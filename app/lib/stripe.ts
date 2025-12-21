import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY");

export const stripe = new Stripe(secretKey, {
  // Let Stripe SDK pick default unless you pin a version.
  // apiVersion: "2024-06-20",
});
