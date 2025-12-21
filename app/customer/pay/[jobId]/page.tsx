import Link from "next/link";
import { requireCustomer } from "@/lib/requireCustomer";



export default async function CustomerPayJobPage(props: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await props.params;

  const { supabase, userId } = await requireCustomer();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, customer_id, status, payment_status, winning_bid_amount_gbp, platform_fee_gbp, driver_payout_gbp")
    .eq("id", jobId)
    .single();

  if (error || !job || job.customer_id !== userId) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
        <h1>Job not found</h1>
        <Link href="/customer">Back</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginTop: 0 }}>Pay for this job</h1>

      <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <div>
          <b>Job:</b> {job.id}
        </div>
        <div>
          <b>Status:</b> {job.status}
        </div>
        <div>
          <b>Payment status:</b> {job.payment_status}
        </div>

        <div style={{ marginTop: 10 }}>
          <div>
            <b>Amount (customer pays now):</b> £{Number(job.winning_bid_amount_gbp || 0).toFixed(2)}
          </div>
          <div>
            <b>Platform fee:</b> £{Number(job.platform_fee_gbp || 0).toFixed(2)}
          </div>
          <div>
            <b>Driver payout (paid in 30 days):</b> £{Number(job.driver_payout_gbp || 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        {job.payment_status === "paid" ? (
          <Link href={`/customer/jobs/${job.id}`}>Back to job</Link>
        ) : (
          <Link
            href={`/api/stripe/checkout?jobId=${encodeURIComponent(job.id)}`}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #111",
              background: "#111",
              color: "white",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Pay now (Stripe)
          </Link>
        )}

        <Link href={`/customer/jobs/${job.id}`}>Cancel</Link>
      </div>

      <p style={{ marginTop: 18, color: "#666" }}>
        Payment is taken now. Driver payout is scheduled for 30 days after payment clears.
      </p>
    </div>
  );
}
