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

export default async function JobDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { err?: string; accepted?: string };
}) {
  const { supabase, user } = await requireCustomer();

  // Load job (must belong to customer)
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.id)
    .eq("customer_id", user.id)
    .single();

  if (jobError || !job) {
    return (
      <div style={{ padding: 24 }}>
        <BackButton label="Back" hrefFallback="/customer" />
        <p>Job not found.</p>
      </div>
    );
  }

  // Load bids for this job
  const { data: bids, error: bidsError } = await supabase
    .from("bids")
    .select("id,job_id,driver_id,amount_gbp,note,status,created_at")
    .eq("job_id", params.id)
    .order("amount_gbp", { ascending: true });

  const errMsg = searchParams?.err ? decodeURIComponent(searchParams.err) : "";
  const acceptedMsg = Boolean(searchParams?.accepted);
  const isBidding = job.status === "bidding";

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "system-ui, Arial",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
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

      {/* Alerts */}
      {errMsg && (
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
      )}

      {acceptedMsg && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #cce8cc",
            background: "#f3fff3",
            marginBottom: 12,
          }}
        >
          <strong style={{ color: "#126b12" }}>Bid accepted.</strong> Job is now
          assigned.
        </div>
      )}

      {/* Job details */}
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div><b>Pickup:</b> {job.pickup_address || job.pickup_postcode}</div>
        <div><b>Dropoff:</b> {job.dropoff_address || job.dropoff_postcode}</div>
        <div><b>Vehicle:</b> {job.vehicle_type}</div>
        <div>
          <b>Date:</b> {job.pickup_date} {job.pickup_time_window || ""}
        </div>

        {job.items && <div><b>Items:</b> {job.items}</div>}
        {job.special_instructions && (
          <div><b>Notes:</b> {job.special_instructions}</div>
        )}
      </div>

      {/* Bids */}
      <div style={{ marginTop: 22 }}>
        <h2 style={{ marginBottom: 8 }}>Driver Bids</h2>

        {!isBidding && (
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
        )}

        {bidsError ? (
          <p style={{ color: "crimson" }}>
            Failed to load bids: {bidsError.message}
          </p>
        ) : !bids || bids.length === 0 ? (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px dashed #ccc",
              color: "#666",
            }}
          >
            No bids yet — check back soon.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {(bids as Bid[]).map((b) => {
              const canAccept = isBidding && b.status === "pending";

              return (
                <div
                  key={b.id}
                  style={{
                    border: "1px solid #e6e6e6",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>
                        £{Number(b.amount_gbp).toFixed(2)}
                      </div>
                      <div style={{ color: "#666", marginTop: 4 }}>
                        Status: {b.status}
                      </div>
                      {b.note && (
                        <div style={{ marginTop: 6, color: "#444" }}>
                          {b.note}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {b.status === "won" && (
                        <span style={{ fontWeight: 700 }}>✅ Accepted</span>
                      )}

                      <form action={acceptBidAction}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <input type="hidden" name="bidId" value={b.id} />
                        <button
                          type="submit"
                          disabled={!canAccept}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: canAccept
                              ? "1px solid #111"
                              : "1px solid #ddd",
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
                    Accepting a bid assigns the job and marks all other pending
                    bids as lost.
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
