import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs"; // Stripe SDK needs node runtime

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err?.message || err}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const jobId = session.metadata?.job_id;
      if (!jobId) {
        return NextResponse.json({ error: "Missing metadata.job_id" }, { status: 400 });
      }

      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null;

      // Read job to get driver + payout amount
      const { data: job, error: jobErr } = await supabaseAdmin
        .from("jobs")
        .select("id, assigned_driver_id, driver_payout_gbp, payment_status")
        .eq("id", jobId)
        .single();

      if (jobErr || !job) {
        return NextResponse.json({ error: `Job not found: ${jobErr?.message || "unknown"}` }, { status: 404 });
      }

      if (!job.assigned_driver_id) {
        return NextResponse.json({ error: "Job has no assigned_driver_id (must be assigned before payment)" }, { status: 400 });
      }

      // Idempotency: if already marked paid, just return ok
      if (job.payment_status === "paid") {
        return NextResponse.json({ received: true, alreadyPaid: true });
      }

      const payoutAmount = Number(job.driver_payout_gbp || 0);
      if (!payoutAmount || payoutAmount <= 0) {
        return NextResponse.json({ error: "driver_payout_gbp missing/invalid on job" }, { status: 400 });
      }

      // Update job payment status + schedule payout due
      const { error: updErr } = await supabaseAdmin
        .from("jobs")
        .update({
          payment_status: "paid",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
          payout_status: "scheduled",
          payout_due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        })
        .eq("id", jobId);

      if (updErr) {
        return NextResponse.json({ error: `Failed updating job: ${updErr.message}` }, { status: 500 });
      }

      // Create payout ledger record (idempotent via unique(job_id))
      const dueAtIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error: payoutErr } = await supabaseAdmin.from("payouts").upsert(
        {
          job_id: jobId,
          driver_id: job.assigned_driver_id,
          amount_gbp: payoutAmount.toFixed(2),
          due_at: dueAtIso,
          status: "scheduled",
        },
        { onConflict: "job_id" }
      );

      if (payoutErr) {
        return NextResponse.json({ error: `Failed creating payout row: ${payoutErr.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
