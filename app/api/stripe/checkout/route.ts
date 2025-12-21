import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { requireCustomer } from "@/app/lib/requireCustomer";

function toPence(amountGbp: number) {
  return Math.round(amountGbp * 100);
}

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const { supabase, userId } = await requireCustomer();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, customer_id, status, payment_status, winning_bid_amount_gbp, pickup_postcode, dropoff_postcode")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: `Job not found: ${error?.message || "unknown"}` }, { status: 404 });
  }

  if (job.customer_id !== userId) {
    return NextResponse.json({ error: "Not your job" }, { status: 403 });
  }

  if (!["assigned", "in_transit", "delivered"].includes(job.status)) {
    return NextResponse.json({ error: "Job must be assigned before payment" }, { status: 400 });
  }

  if (job.payment_status === "paid") {
    return NextResponse.redirect(`${appUrl}/customer/jobs/${jobId}?paid=1`);
  }

  const amount = Number(job.winning_bid_amount_gbp || 0);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "winning_bid_amount_gbp not set on job" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/customer/jobs/${jobId}?paid=1`,
    cancel_url: `${appUrl}/customer/pay/${jobId}?pay=cancel`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: toPence(amount),
          product_data: {
            name: "Courier Job Payment",
            description: `Job ${jobId} • ${job.pickup_postcode ?? ""} → ${job.dropoff_postcode ?? ""}`.trim(),
          },
        },
      },
    ],
    metadata: {
      job_id: jobId,
      customer_id: userId,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe session missing url" }, { status: 500 });
  }

  return NextResponse.redirect(session.url);
}
