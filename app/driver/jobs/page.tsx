import Link from "next/link";
import SignOutButton from "@/app/components/SignOutButton";
import { requireDriver } from "@/lib/requireDriver";
import { placeBid, withdrawBid } from "./actions";

type Job = {
  id: string;
  status: string;
  pickup_postcode: string | null;
  pickup_address: string | null;
  dropoff_postcode: string | null;
  dropoff_address: string | null;
  vehicle_type: string | null;
  pickup_date: string | null;
  pickup_time_window: string | null;
  items: string | null;
  weight_kg: number | null;
  fragile: boolean | null;
  special_instructions: string | null;
  created_at: string;
};

type Bid = {
  id: string;
  job_id: string;
  amount_gbp: number;
  note: string | null;
  status: string;
};

export default async function DriverJobsPage() {
  const { supabase, userId, profile } = await requireDriver();

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select(
      "id,status,pickup_postcode,pickup_address,dropoff_postcode,dropoff_address,vehicle_type,pickup_date,pickup_time_window,items,weight_kg,fragile,special_instructions,created_at"
    )
    .eq("status", "bidding")
    .order("created_at", { ascending: false });

  const { data: myBids } = await supabase
    .from("bids")
    .select("id,job_id,amount_gbp,note,status")
    .eq("driver_id", userId)
    .eq("status", "pending");

  const myBidByJob = new Map<string, Bid>();
  (myBids || []).forEach((b: any) => myBidByJob.set(b.job_id, b));

  const navLinkStyle: React.CSSProperties = {
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    color: "#111",
    fontSize: 14,
    background: "white",
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Driver Job Board</h1>
          <p style={{ marginTop: 6, color: "#555" }}>
            Jobs open for bidding{profile.approved ? "" : " (your account is pending approval)"}
          </p>
        </div>

        {/* ✅ Driver nav */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/driver/jobs" style={navLinkStyle}>
            Job Board
          </Link>
          <Link href="/driver/my-jobs" style={navLinkStyle}>
            My Jobs
          </Link>
          <Link href="/driver/profile" style={navLinkStyle}>
            Profile
          </Link>
          <Link href="/app" style={navLinkStyle}>
            Home
          </Link>
          <SignOutButton />
        </div>
      </div>

      {jobsError && (
        <div style={{ marginTop: 16, padding: 12, background: "#fff3f3", border: "1px solid #ffd1d1", borderRadius: 10 }}>
          Failed to load jobs: {jobsError.message}
        </div>
      )}

      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {(jobs as Job[] | null)?.length ? (
          (jobs as Job[]).map((job) => {
            const myBid = myBidByJob.get(job.id);

            return (
              <div key={job.id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {job.pickup_postcode || "Pickup"} → {job.dropoff_postcode || "Dropoff"}
                    </div>
                    <div style={{ color: "#666", marginTop: 4 }}>
                      {job.vehicle_type || "vehicle"} • {job.pickup_date || "date"} • {job.pickup_time_window || "time window"}
                    </div>
                  </div>
                  <div style={{ color: "#666" }}>
                    {job.fragile ? "Fragile" : "Not fragile"} • {job.weight_kg ? `${job.weight_kg}kg` : "weight n/a"}
                  </div>
                </div>

                {(job.pickup_address || job.dropoff_address) && (
                  <div style={{ marginTop: 10, color: "#444" }}>
                    <div>
                      <b>Pickup:</b> {job.pickup_address || "—"}
                    </div>
                    <div>
                      <b>Dropoff:</b> {job.dropoff_address || "—"}
                    </div>
                  </div>
                )}

                {(job.items || job.special_instructions) && (
                  <div style={{ marginTop: 10, color: "#444" }}>
                    {job.items && (
                      <div>
                        <b>Items:</b> {job.items}
                      </div>
                    )}
                    {job.special_instructions && (
                      <div>
                        <b>Notes:</b> {job.special_instructions}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 14, borderTop: "1px solid #eee", paddingTop: 14 }}>
                  {myBid ? (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>Your bid: £{Number(myBid.amount_gbp).toFixed(2)}</div>
                        {myBid.note && <div style={{ color: "#666", marginTop: 4 }}>{myBid.note}</div>}
                      </div>

                      <form action={withdrawBid} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="hidden" name="bidId" value={myBid.id} />
                        <button
                          type="submit"
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid #d6d6d6",
                            background: "white",
                            cursor: "pointer",
                          }}
                        >
                          Withdraw bid
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form action={placeBid} style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: 10 }}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <input
                        name="amount"
                        placeholder="Bid £"
                        inputMode="decimal"
                        style={{ padding: 10, borderRadius: 10, border: "1px solid #d6d6d6" }}
                      />
                      <input
                        name="note"
                        placeholder="Optional note (e.g. available now, 2 men, blankets)"
                        style={{ padding: 10, borderRadius: 10, border: "1px solid #d6d6d6" }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "1px solid #111",
                          background: "#111",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Place bid
                      </button>
                    </form>
                  )}

                  <div style={{ marginTop: 10, color: "#777", fontSize: 12 }}>
                    Customer accepts one bid → job becomes assigned.
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: 14, border: "1px dashed #ccc", borderRadius: 12, color: "#666" }}>
            No jobs open for bidding right now.
          </div>
        )}
      </div>
    </div>
  );
}

