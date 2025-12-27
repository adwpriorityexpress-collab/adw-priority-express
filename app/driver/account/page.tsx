// app/driver/account/page.tsx
import Link from "next/link";
import { requireDriver } from "../../lib/requireDriver";
import SignOutButton from "@/app/components/SignOutButton";
import AvatarUpload from "./AvatarUpload";
import DocsUpload from "./DocsUpload";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        ok
          ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/20"
          : "bg-amber-500/10 text-amber-200 ring-amber-500/20",
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", ok ? "bg-emerald-400" : "bg-amber-400"].join(" ")} />
      {label}
    </span>
  );
}

export default async function DriverAccountPage() {
  const { supabase, user, profile } = await requireDriver();

  // Avatar URL (public bucket)
  let avatarUrl: string | null = null;
  if (profile?.avatar_path) {
    const { data } = supabase.storage.from("avatars").getPublicUrl(String(profile.avatar_path));
    avatarUrl = data.publicUrl ?? null;
  }

  // Docs list
  const { data: docs } = await supabase
    .from("driver_documents")
    .select("id,doc_type,status,created_at,file_path")
    .eq("driver_id", user.id)
    .order("created_at", { ascending: false });

  const docsList = (docs ?? []) as any[];

  const hasId = docsList.some((d) => String(d.doc_type).toLowerCase() === "id");
  const hasInsurance = docsList.some((d) => String(d.doc_type).toLowerCase() === "insurance");
  const hasVehicleDoc = docsList.some((d) => String(d.doc_type).toLowerCase() === "vehicle");
  const hasAvatar = Boolean(profile?.avatar_path);

  const name = profile?.full_name ? String(profile.full_name) : "Driver";
  const approved = Boolean(profile?.approved);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/10" />
            <div>
              <div className="text-sm text-zinc-400">ADW PriorityExpress</div>
              <div className="text-lg font-semibold leading-tight">Driver Account</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/driver/jobs"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              ← Jobs
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        {/* Hero */}
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                    No photo
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-zinc-400">Driver</div>
                <div className="mt-1 text-xl font-semibold">{name}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge ok={approved} label={approved ? "Approved" : "Pending approval"} />
                  <Badge ok={hasAvatar} label={hasAvatar ? "Photo added" : "Add photo"} />
                  <Badge ok={hasId} label={hasId ? "ID uploaded" : "Upload ID"} />
                  <Badge ok={hasInsurance} label={hasInsurance ? "Insurance uploaded" : "Upload insurance"} />
                  <Badge ok={hasVehicleDoc} label={hasVehicleDoc ? "Vehicle doc uploaded" : "Upload vehicle doc"} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-zinc-400">Verification progress</div>
              <div className="mt-2 h-2 w-64 max-w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-white"
                  style={{
                    width: `${Math.round(
                      ((Number(hasAvatar) + Number(hasId) + Number(hasInsurance) + Number(hasVehicleDoc)) / 4) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                Upload all docs to get verified faster.
              </div>
            </div>
          </div>
        </Card>

        {/* Uploads */}
        <AvatarUpload userId={user.id} currentAvatarUrl={avatarUrl} />
        <DocsUpload userId={user.id} docs={docsList} />

        {/* Cool features (coming next) */}
        <Card className="p-5">
          <div className="text-sm text-zinc-400">Cool features (next)</div>
          <div className="mt-1 text-base font-semibold">Make drivers love the platform</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">Availability</div>
              <div className="mt-1 text-sm text-zinc-400">
                Toggle Online/Offline so customers only see active drivers.
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">Bid presets</div>
              <div className="mt-1 text-sm text-zinc-400">
                One-tap bids for “Small parcel”, “Same day”, “Luton”.
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">Badges</div>
              <div className="mt-1 text-sm text-zinc-400">
                Verified, Fast response, Top-rated.
              </div>
            </div>
          </div>
        </Card>

        <div className="text-xs text-zinc-500">
          Powered by ADW Exchange • Verified network • Secure payments
        </div>
      </div>
    </div>
  );
}
