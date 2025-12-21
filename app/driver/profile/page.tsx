import Link from "next/link";
import BackButton from "@/app/components/BackButton";
import SignOutButton from "@/app/components/SignOutButton";
import { requireDriver } from "@/lib/requireDriver";
import { updateVehicleTypeAction } from "./actions";

type SearchParams = { err?: string; ok?: string };

export default async function DriverProfilePage(props: { searchParams?: Promise<SearchParams> }) {
  const { supabase, userId, profile } = await requireDriver();

  const sp = props.searchParams ? await props.searchParams : undefined;
  const errMsg = sp?.err ? decodeURIComponent(sp.err) : "";
  const okMsg = sp?.ok ? decodeURIComponent(sp.ok) : "";

  const { data: me } = await supabase
    .from("profiles")
    .select("full_name,vehicle_type,completed_jobs,rating_avg,rating_count")
    .eq("id", userId)
    .single();

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Driver Profile</h1>
          <p style={{ marginTop: 6, color: "#666" }}>
            {me?.full_name ?? profile.full_name ?? "Driver"} • Completed: {me?.completed_jobs ?? 0}
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

      {errMsg ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fff3f3", border: "1px solid #ffd1d1" }}>
          <b style={{ color: "crimson" }}>Update failed:</b> {errMsg}
        </div>
      ) : null}

      {okMsg ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f3fff3", border: "1px solid #cce8cc" }}>
          <b style={{ color: "#126b12" }}>{okMsg}</b>
        </div>
      ) : null}

      <div style={{ marginTop: 18, border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Vehicle Type</h2>

        <form action={updateVehicleTypeAction} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select name="vehicle_type" defaultValue={me?.vehicle_type ?? "small_van"} style={{ padding: 10, borderRadius: 10, border: "1px solid #d6d6d6" }}>
            <option value="small_van">Small Van</option>
            <option value="swb_van">SWB Van</option>
            <option value="lwb_van">LWB Van</option>
            <option value="luton_van">Luton Van</option>
            <option value="7_5t">7.5T</option>
            <option value="car">Car</option>
          </select>

          <button type="submit" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "white", cursor: "pointer" }}>
            Save
          </button>
        </form>

        <div style={{ marginTop: 10, color: "#777", fontSize: 12 }}>
          This will show to customers once you’re assigned to a job.
        </div>
      </div>

      <div style={{ marginTop: 18, border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Rating (coming soon)</h2>
        <p style={{ margin: 0, color: "#666" }}>
          {me?.rating_count && me.rating_avg != null ? `${Number(me.rating_avg).toFixed(1)} ★ (${me.rating_count})` : "Not rated yet"}
        </p>
      </div>
    </div>
  );
}
