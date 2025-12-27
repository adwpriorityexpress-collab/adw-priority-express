import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // Stripe needs Node runtime

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // Use SERVICE ROLE so webhook can update rows regardless of RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      // We rely on metadata.job_id set when creating Checkout Session
      const jobId = session.metadata?.job_id;
      if (!jobId) throw new Error("Missing metadata.job_id on checkout session");

      // PaymentIntent is available for payment mode
      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : "";

      // Atomic DB update (idempotent if your SQL function is written that way)
      const { error } = await supabase.rpc("mark_job_paid_from_stripe", {
        p_job_id: jobId,
        p_stripe_session_id: session.id,
        p_payment_intent_id: paymentIntentId,
      });

      if (error) throw error;
    } else {
      // Optional: useful during dev
      // console.log("Unhandled event type:", event.type);
    }

    // Always 200 if processed successfully
    return NextResponse.json({ received: true });
  } catch (err: any) {
    // Stripe will retry on non-2xx
    return NextResponse.json(
      { error: err?.message ?? "Webhook handler error" },
      { status: 500 }
    );
  }
}
