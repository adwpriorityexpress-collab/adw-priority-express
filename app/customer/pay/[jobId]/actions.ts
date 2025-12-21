"use server";

import { redirect } from "next/navigation";
import { stripe } from "@/app/lib/stripe";
import { requireCustomer } from "@/app/lib/requireCustomer";

function toPence(amountGbp: number) {
  return Math.round(amountGbp * 100);
}

export async function createCheckoutForJob(jobId: string) {
  const { supabase, user } = await requireCustomer();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, customer_id, status, payment_status, winning_bid_amount_gbp, pickup_postcode, dropoff_postcode")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    throw new Error(`Job not found: ${error?.message || "unknown"}`);
  }

  if (job.customer_id !== user.id) throw new Error("Not your job");
  if (job.status !== "assigned" && job.status !== "in_transit" && job.status !== "delivered") {
    throw new Error("Job must be assigned before payment");
  }
  if (job.payment_status === "paid") {
    redirect(`/customer/jobs/${jobId}`);
  }

  const amount = Number(job.winning_bid_amount_gbp || 0);
  if (!amount || amount <= 0) throw new Error("winning_bid_amount_gbp not set on job");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/customer/jobs/${jobId}?paid=1`,
    cancel_url: `${appUrl}/customer/jobs/${jobId}?pay=cancel`,
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
      customer_id: user.id,
    },
  });

  // Redirect customer to Stripe Checkout URL
  if (!session.url) throw new Error("Stripe session missing url");
  redirect(session.url);
}
