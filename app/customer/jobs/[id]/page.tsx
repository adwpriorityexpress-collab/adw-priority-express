import Link from "next/link";
import BackButton from "@/app/components/BackButton";
import { requireCustomer } from "@/app/lib/requireCustomer";
import { acceptBidAction } from "./actions";

type Bid = {
  id: string;
  job_id: string;
  driver_id: string;
  amount_gbp: number;
  note: string | null;
  status: "pending" | "withdrawn" | "won" | "lost";
  created_at: string | null;
};

function maskId(id?: string | null) {
  if (!id) return "—";
  if (id.length <= 10) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function badge(text: string) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid #ddd",
        background: "#fafafa",
        fontSize: 12,
        color: "#111",
      }}
    >
      {text}
    </span>
  );
}

function ProgressRow(props: { label: string; active: boolean; done: boolean }) {
  const { label, active, done } = props;
  const dotBg = done ? "#111" : active ? "#111" : "#ddd";
  const textColor = done ? "#111" : active ? "#111" : "#888";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 12, height: 12, borderRadius: 999, background: dotBg }} />
      <div style={{ color: textColor, fontWeight: active ? 700 : 500 }}>
        {done ? "✅ " : active ? "➡️ " : ""}
        {label}
      </div>
    </div>
  );
}

function fmtGBP(n: any) {
  const x = Number(n || 0);
  return `£${x.toFixed(2)}`;
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

export default async function JobDetail({
  params,
  searchParams,
}: {
  params: any;
  searchParams?: any;
}) {
  const resolvedParams = await params;
  const jobId = resolvedParams?.id as string | undefined;

  const sp = (await searchParams) || {};
  const errMsg = sp.err ? decodeURIComponent(String(sp.err)) : "";
  const acceptedMsg = Boolean(sp.accepted);

  const paidMsg = Boolean(sp.paid); // returned from Checkout success_url
  const payCanceledMsg = sp.pay === "cancel";

  if (!jobId) {
    return (
      <div style={{ padding: 24 }}>
        <BackButton label="Back" hrefFallback="/customer" />
        <p>Missing job id.</p>
      </div>
    );
  }

  const { supabase, userId } = await requireCustomer();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(
      [
        "id",
        "status",
        "pickup_postcode",
        "pickup_address",
        "dropoff_postcode",
        "dropoff_address",
        "vehicle_type",
        "pickup_date",
        "pickup_time_window",
        "items",
        "special_instructions",
        "assigned_driver_id",
        "assigned_at",
        "created_at",
        // payment fields
        "winning_bid_amount_gbp",
        "platform_fee_gbp",
        "driver_payout_gbp",
        "payment_status",
        "paid_at",
        "payout_status",
        "payout_due_at",
      ].join(",")
    )
    .eq("id", jobId)
    .eq("customer_id", userId)
    .single();

  if (jobError || !job) {
    return (
      <div style={{ padding: 24 }}>
        <BackButton label="Back" hrefFallback="/customer" />
        <p>Job not found.</p>
      </div>
    );
  }

  // Assigned driver public card (allowed by your policy)
  let assignedDriver: null | {
    full_name: string | null;
    vehicle_type: string | null;
    completed_jobs: number | null;
    rating_avg: number | null;
    rating_count: number | null;
  } = null;

  if (job.assigned_driver_id) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name,vehicle_type,completed_jobs,rating_avg,rating_count")
      .eq("id", job.assigned_driver_id)
      .single();

    assignedDriver = data ?? null;
  }

  const { data: bids, error: bidsError } = await supabase
    .from("bids")
    .select("id,job_id,driver_id,amount_gbp,note,status,created_at")
    .eq("job_id", jobId)
    .order("amount_gbp", { ascending: true });

  const isBidding = job.status === "bidding";
  const isAssigned = job.status === "assigned";
  const isInTransit = job.status === "in_transit";
  const isDelivered = job.status === "delivered";

  const paymentStatus = (job.payment_status || "unpaid") as string;
  const canPayNow =
    (isAssigned || isInTransit || isDelivered) &&
    paymentStatus !== "paid" &&
    job.winning_bid_amount_gbp != null &&
    Number(job.winning_bid_amount_gbp) > 0;

  const shouldShowPaymentCard =
    (isAssigned || isInTransit || isDelivered) &&
    (job.winning_bid_amount_gbp != null || paymentStatus !== "unpaid");

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            {job.pickup_postcode} → {job.dropoff_postcode}
          </h1>
          <p style={{ marginTop: 6, color: "#666" }}>
            Status: <b>{job.status}</b>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <BackButton label="Back" hrefFallback="/customer" />
          <Link
            href="/customer"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #d6d6d6",
              textDecoration: "none",
              color: "#111",
              fontSize: 14,
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Feedback banners */}
      {errMsg ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ffb4b4",
            background: "#fff3f3",
            marginBottom: 12,
          }}
        >
          <strong style={{ color: "crimson" }}>Action failed:</strong> {errMsg}
        </div>
      ) : null}

      {acceptedMsg ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #cce8cc",
            background: "#f3fff3",
            marginBottom: 12,
          }}
        >
          <strong style={{ color: "#126b12" }}>Bid accepted.</strong> Job is now assigned.
        </div>
      ) : null}

      {paidMsg ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #cce8cc",
            background: "#f3fff3",
            marginBottom: 12,
          }}
        >
          <strong style={{ color: "#126b12" }}>Payment received.</strong> Thanks — your driver payout is scheduled automatically.
        </div>
      ) : null}

      {payCanceledMsg ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ffe3a3",
            background: "#fff9e8",
            marginBottom: 12,
          }}
        >
          <strong style={{ color: "#7a5a00" }}>Payment cancelled.</strong> You can try again when ready.
        </div>
      ) : null}

      {/* Progress + Driver card */}
      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 18 }}>Job Progress</h2>

        <div style={{ display: "grid", gap: 8 }}>
          <ProgressRow label="Bidding (drivers placing bids)" active={isBidding} done={!isBidding} />
          <ProgressRow label="Assigned (driver confirmed)" active={isAssigned} done={isInTransit || isDelivered} />
          <ProgressRow label="In transit (driver en route / collecting)" active={isInTransit} done={isDelivered} />
          <ProgressRow label="Delivered (completed)" active={isDelivered} done={isDelivered} />
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Assigned Driver</h3>

          {!job.assigned_driver_id ? (
            <div style={{ marginTop: 8, color: "#666" }}>Not assigned yet.</div>
          ) : (
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <b style={{ fontSize: 16 }}>{assignedDriver?.full_name ?? maskId(job.assigned_driver_id)}</b>
                {badge("Verified")}
                {assignedDriver?.vehicle_type ? badge(`Vehicle: ${assignedDriver.vehicle_type}`) : badge("Vehicle: —")}
                {badge(`Completed: ${assignedDriver?.completed_jobs ?? 0}`)}
              </div>

              <div style={{ color: "#666", fontSize: 13 }}>
                Rating:{" "}
                {assignedDriver?.rating_count && assignedDriver.rating_avg != null
                  ? `${Number(assignedDriver.rating_avg).toFixed(1)} ★ (${assignedDriver.rating_count})`
                  : "Not rated yet"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment card (only shows once job is assigned+) */}
      {shouldShowPaymentCard ? (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: 18 }}>Payment</h2>
              <div style={{ color: "#666" }}>
                Status: <b>{paymentStatus}</b>
                {job.paid_at ? (
                  <>
                    {" "}
                    • Paid at: <b>{fmtDateTime(job.paid_at)}</b>
                  </>
                ) : null}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {canPayNow ? (
                <Link
                  href={`/customer/pay/${job.id}`}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #111",
                    background: "#111",
                    color: "white",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  Pay now (Stripe)
                </Link>
              ) : null}

              {!canPayNow && paymentStatus !== "paid" ? (
                <span style={{ color: "#999", fontSize: 13 }}>
                  Payment will be available once the job is assigned and priced.
                </span>
              ) : null}
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
            <div>
              <b>Customer pays:</b> {job.winning_bid_amount_gbp != null ? fmtGBP(job.winning_bid_amount_gbp) : "—"}
            </div>
            <div>
              <b>Platform fee:</b> {job.platform_fee_gbp != null ? fmtGBP(job.platform_fee_gbp) : "—"}
            </div>
            <div>
              <b>Driver payout:</b> {job.driver_payout_gbp != null ? fmtGBP(job.driver_payout_gbp) : "—"}{" "}
              <span style={{ color: "#666" }}>(paid in 30 days)</span>
            </div>

            <div style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
              Payout status: <b>{job.payout_status || "not_due"}</b>
              {job.payout_due_at ? (
                <>
                  {" "}
                  • Due at: <b>{fmtDateTime(job.payout_due_at)}</b>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Job details */}
      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Pickup:</strong> {job.pickup_address || job.pickup_postcode}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Dropoff:</strong> {job.dropoff_address || job.dropoff_postcode}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Requested vehicle:</strong> {job.vehicle_type}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Date:</strong> {job.pickup_date} {job.pickup_time_window || ""}
        </div>

        {job.items ? (
          <div style={{ marginBottom: 8 }}>
            <strong>Items:</strong> {job.items}
          </div>
        ) : null}

        {job.special_instructions ? (
          <div style={{ marginBottom: 8 }}>
            <strong>Notes:</strong> {job.special_instructions}
          </div>
        ) : null}
      </div>

      {/* Bids */}
      <div style={{ marginTop: 22 }}>
        <h2 style={{ marginBottom: 8 }}>Driver Bids</h2>

        {!isBidding ? (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #eee",
              background: "#fafafa",
              color: "#666",
              marginBottom: 12,
            }}
          >
            This job is no longer open for bidding.
          </div>
        ) : null}

        {bidsError ? (
          <p style={{ color: "crimson" }}>Failed to load bids: {bidsError.message}</p>
        ) : !bids || bids.length === 0 ? (
          <div style={{ padding: 12, borderRadius: 12, border: "1px dashed #ccc", color: "#666" }}>
            No bids yet — check back soon.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {(bids as Bid[]).map((b) => {
              const canAccept = isBidding && b.status === "pending";

              return (
                <div key={b.id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>£{Number(b.amount_gbp).toFixed(2)}</div>
                      <div style={{ color: "#666", marginTop: 4 }}>Status: {b.status}</div>
                      {b.note ? <div style={{ marginTop: 6, color: "#444" }}>{b.note}</div> : null}
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {b.status === "won" ? <span style={{ fontWeight: 700 }}>✅ Accepted</span> : null}

                      <form action={acceptBidAction}>
                        <input type="hidden" name="jobId" value={jobId} />
                        <input type="hidden" name="bidId" value={b.id} />
                        <button
                          type="submit"
                          disabled={!canAccept}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: canAccept ? "1px solid #111" : "1px solid #ddd",
                            background: canAccept ? "#111" : "#f3f3f3",
                            color: canAccept ? "white" : "#999",
                            cursor: canAccept ? "pointer" : "not-allowed",
                            minWidth: 120,
                          }}
                        >
                          Accept bid
                        </button>
                      </form>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, color: "#888", fontSize: 12 }}>
                    Accepting a bid assigns the job and marks all other pending bids as lost.
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 22 }}>
        <Link href="/customer" style={{ textDecoration: "none" }}>
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
