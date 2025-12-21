import Link from "next/link";
import BackButton from "@/app/components/BackButton";
import SignOutButton from "@/app/components/SignOutButton";
import { requireCustomer } from "@/app/lib/requireCustomer";
import { createJobAction } from "./actions";

type SearchParams = { created?: string; err?: string };

export default async function CustomerPage(props: { searchParams?: Promise<SearchParams> }) {
  const { supabase, userId, profile } = await requireCustomer();

  const searchParams = props.searchParams ? await props.searchParams : undefined;

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id,status,pickup_postcode,dropoff_postcode,vehicle_type,pickup_date,created_at")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      {/* Header with back + sign out */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 10,
        }}
      >
        <div>
          <h1 style={{ marginTop: 0, marginBottom: 4 }}>Customer Dashboard</h1>
          <p style={{ color: "#666", marginTop: 0, marginBottom: 0 }}>
            Signed in as: {profile.full_name ?? "Customer"} ({userId})
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <BackButton label="Back" hrefFallback="/app" />
          <SignOutButton />
        </div>
      </div>

      {/* Status banners */}
      {searchParams?.err ? (
        <div style={{ padding: 12, borderRadius: 10, border: "1px solid #ffb4b4", background: "#fff3f3" }}>
          <strong style={{ color: "crimson" }}>Create failed:</strong>{" "}
          <span>{decodeURIComponent(searchParams.err)}</span>
        </div>
      ) : null}

      {searchParams?.created ? (
        <div style={{ padding: 12, borderRadius: 10, border: "1px solid #cce8cc", background: "#f3fff3" }}>
          <strong style={{ color: "#126b12" }}>Job created.</strong>
        </div>
      ) : null}

      {/* Create Job */}
      <div style={{ marginTop: 18, padding: 14, border: "1px solid #eee", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>Create Job</h2>

          {/* Optional quick links */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/app" style={{ textDecoration: "none" }}>
              Home
            </Link>
            <Link href="/driver/jobs" style={{ textDecoration: "none" }}>
              Driver job board
            </Link>
          </div>
        </div>

        <form action={createJobAction} style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input name="pickup_postcode" placeholder="Pickup postcode" required />
          <input name="dropoff_postcode" placeholder="Dropoff postcode" required />

          <select name="vehicle_type" required defaultValue="small_van">
            <option value="small_van">Small Van</option>
            <option value="swb_van">SWB Van</option>
            <option value="lwb_van">LWB Van</option>
            <option value="luton_van">Luton Van</option>
            <option value="7_5t">7.5T</option>
            <option value="car">Car</option>
          </select>

          <input name="pickup_date" type="date" required />
          <input name="pickup_time_window" placeholder="Time window (optional)" />

          <textarea name="items" placeholder="Items" rows={4} required />

          <button
            type="submit"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Create job
          </button>
        </form>
      </div>

      {/* Jobs list */}
      <div style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Your Jobs</h2>

        {error ? (
          <p style={{ color: "crimson" }}>Failed to load jobs: {error.message}</p>
        ) : !jobs || jobs.length === 0 ? (
          <p style={{ color: "#666" }}>No jobs yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            {jobs.map((j) => (
              <li key={j.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong>{j.pickup_postcode}</strong> → <strong>{j.dropoff_postcode}</strong>{" "}
                    <span style={{ color: "#666" }}>
                      (vehicle: {j.vehicle_type}, status: {j.status})
                    </span>
                  </div>

                  <Link href={`/customer/jobs/${j.id}`} style={{ textDecoration: "none" }}>
                    View bids →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

