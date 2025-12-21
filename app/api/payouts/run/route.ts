import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

function toPence(amountGbp: number) {
  return Math.round(amountGbp * 100);
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Missing CRON_SECRET" }, { status: 500 });

  const provided = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret");
  if (provided !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get due payouts
  const { data: payouts, error } = await supabaseAdmin
    .from("payouts")
    .select("id, job_id, driver_id, amount_gbp, due_at, status")
    .eq("status", "scheduled")
    .lte("due_at", new Date().toISOString())
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let processed = 0;
  let paid = 0;
  let failed = 0;

  for (const p of payouts || []) {
    processed++;

    // Get driver Stripe account id
    const { data: driver, error: driverErr } = await supabaseAdmin
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", p.driver_id)
      .single();

    if (driverErr || !driver?.stripe_account_id) {
      failed++;
      await supabaseAdmin
        .from("payouts")
        .update({ status: "failed", last_error: "Missing driver stripe_account_id" })
        .eq("id", p.id);
      continue;
    }

    try {
      const amountGbp = Number(p.amount_gbp);
      const transfer = await stripe.transfers.create({
        amount: toPence(amountGbp),
        currency: "gbp",
        destination: driver.stripe_account_id,
        metadata: {
          job_id: p.job_id,
          payout_id: p.id,
        },
      });

      paid++;

      await supabaseAdmin
        .from("payouts")
        .update({
          status: "paid",
          stripe_transfer_id: transfer.id,
          paid_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", p.id);

      // also mark job payout_status (nice for UI)
      await supabaseAdmin
        .from("jobs")
        .update({ payout_status: "paid" })
        .eq("id", p.job_id);
    } catch (err: any) {
      failed++;
      await supabaseAdmin
        .from("payouts")
        .update({
          status: "failed",
          last_error: err?.message || String(err),
        })
        .eq("id", p.id);

      await supabaseAdmin
        .from("jobs")
        .update({ payout_status: "failed" })
        .eq("id", p.job_id);
    }
  }

  return NextResponse.json({ ok: true, processed, paid, failed });
}
