import { requireCustomer } from "@/lib/requireCustomer";
import { createJobAction } from "./actions";

type SearchParams = { created?: string; err?: string };

export default async function CustomerPage(props: { searchParams?: Promise<SearchParams> }) {
  const { supabase, userId, profile } = await requireCustomer();

  // Next.js 16: searchParams is a Promise
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id,status,pickup_postcode,dropoff_postcode,vehicle_type,pickup_date,created_at")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginTop: 0 }}>Customer Dashboard</h1>
      <p style={{ color: "#666", marginTop: 4 }}>
        Signed in as: {profile.full_name ?? "Customer"} ({userId})
      </p>

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

      <div style={{ marginTop: 18, padding: 14, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Create Job</h2>

        <form action={createJobAction} style={{ display: "grid", gap: 10 }}>
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

          <button type="submit" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}>
            Create job
          </button>
        </form>
      </div>

      <div style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Your Jobs</h2>

        {error ? (
          <p style={{ color: "crimson" }}>Failed to load jobs: {error.message}</p>
        ) : !jobs || jobs.length === 0 ? (
          <p style={{ color: "#666" }}>No jobs yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {jobs.map((j) => (
              <li key={j.id} style={{ marginBottom: 8 }}>
                <strong>{j.pickup_postcode}</strong> → <strong>{j.dropoff_postcode}</strong>{" "}
                <span style={{ color: "#666" }}>
                  (vehicle: {j.vehicle_type}, status: {j.status})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
