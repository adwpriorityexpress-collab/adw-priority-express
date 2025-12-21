import Link from "next/link";
import BackButton from "@/app/components/BackButton";
import SignOutButton from "@/app/components/SignOutButton";
import { requireDriver } from "@/lib/requireDriver";
import { startJobAction, deliveredJobAction } from "./actions";

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
  created_at: string | null;
  assigned_at: string | null;
};

type SearchParams = { err?: string; ok?: string };

export default async function DriverMyJobsPage(props: { searchParams?: Promise<SearchParams> }) {
  const { supabase, userId, profile } = await requireDriver();

  const sp = props.searchParams ? await props.searchParams : undefined;
  const errMsg = sp?.err ? decodeURIComponent(sp.err) : "";
  const okMsg = sp?.ok ? decodeURIComponent(sp.ok) : "";

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      "id,status,pickup_postcode,pickup_address,dropoff_postcode,dropoff_address,vehicle_type,pickup_date,pickup_time_window,items,weight_kg,fragile,special_instructions,created_at,assigned_at"
    )
    .eq("assigned_driver_id", userId)
    .order("assigned_at", { ascending: false });

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>My Jobs</h1>
          <p style={{ marginTop: 6, color: "#555" }}>
            Jobs assigned to you • Signed in as {profile.full_name ?? "Driver"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <BackButton label="Back" hrefFallback="/driver/jobs" />
          <Link href="/driver/jobs" style={{ textDecoration: "none" }}>
            Job board
          </Link>
          <SignOutButton />
        </div>
      </div>

      {/* Banners */}
      {errMsg ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fff3f3", border: "1px solid #ffd1d1" }}>
          <b style={{ color: "crimson" }}>Action failed:</b> {errMsg}
        </div>
      ) : null}

      {okMsg ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f3fff3", border: "1px solid #cce8cc" }}>
          <b style={{ color: "#126b12" }}>{okMsg}</b>
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#fff3f3", border: "1px solid #ffd1d1" }}>
          Failed to load your jobs: {error.message}
        </div>
      ) : null}

      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {jobs && jobs.length ? (
          (jobs as Job[]).map((job) => {
            const canStart = job.status === "assigned";
            const canDeliver = job.status === "in_transit";

            return (
              <div key={job.id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                      {job.pickup_postcode || "Pickup"} → {job.dropoff_postcode || "Dropoff"}
                    </div>
                    <div style={{ color: "#666", marginTop: 4 }}>
                      {job.vehicle_type || "vehicle"} • {job.pickup_date || "date"} • {job.pickup_time_window || "time window"}
                    </div>
                    <div style={{ color: "#666", marginTop: 4 }}>
                      Status: <b>{job.status}</b>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", color: "#666" }}>
                    <div>Assigned: {job.assigned_at ? new Date(job.assigned_at).toLocaleString() : "—"}</div>
                    <div>Created: {job.created_at ? new Date(job.created_at).toLocaleString() : "—"}</div>
                  </div>
                </div>

                {job.pickup_address || job.dropoff_address ? (
                  <div style={{ marginTop: 10, color: "#444" }}>
                    <div>
                      <b>Pickup:</b> {job.pickup_address || "—"}
                    </div>
                    <div>
                      <b>Dropoff:</b> {job.dropoff_address || "—"}
                    </div>
                  </div>
                ) : null}

                {job.items || job.special_instructions ? (
                  <div style={{ marginTop: 10, color: "#444" }}>
                    {job.items ? (
                      <div>
                        <b>Items:</b> {job.items}
                      </div>
                    ) : null}
                    {job.special_instructions ? (
                      <div>
                        <b>Notes:</b> {job.special_instructions}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Actions */}
                <div style={{ marginTop: 14, borderTop: "1px solid #eee", paddingTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <form action={startJobAction}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <button
                      type="submit"
                      disabled={!canStart}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: canStart ? "1px solid #111" : "1px solid #ddd",
                        background: canStart ? "#111" : "#f3f3f3",
                        color: canStart ? "white" : "#999",
                        cursor: canStart ? "pointer" : "not-allowed",
                      }}
                    >
                      Start job
                    </button>
                  </form>

                  <form action={deliveredJobAction}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <button
                      type="submit"
                      disabled={!canDeliver}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: canDeliver ? "1px solid #111" : "1px solid #ddd",
                        background: canDeliver ? "#111" : "#f3f3f3",
                        color: canDeliver ? "white" : "#999",
                        cursor: canDeliver ? "pointer" : "not-allowed",
                      }}
                    >
                      Mark delivered
                    </button>
                  </form>
                </div>

                <div style={{ marginTop: 10, color: "#777", fontSize: 12 }}>
                  Assigned → Start job → In transit → Mark delivered → Delivered
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: 14, border: "1px dashed #ccc", borderRadius: 12, color: "#666" }}>
            No assigned jobs yet. When a customer accepts your bid, it will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

