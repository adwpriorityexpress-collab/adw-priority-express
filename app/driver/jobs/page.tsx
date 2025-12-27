// app/driver/jobs/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireDriver } from "../../lib/requireDriver";
import JobsAutoRefresh from "./JobsAutoRefresh";
import DriverTabs from "./DriverTabs";
import SignOutButton from "@/app/components/SignOutButton";

type Job = {
  id: string;
  status: string;
  pickup_postcode: string | null;
  dropoff_postcode: string | null;
  pickup_time_window: string | null;
  items: string | null;
  weight_kg: number | null;
  fragile: boolean | null;
  created_at: string;
};

type Bid = {
  id: string;
  job_id: string;
  amount_gbp: number;
  status: string;
  note: string | null;
  created_at: string;
};

function StatusPill({ label }: { label: string }) {
  const s = (label || "").toLowerCase();
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset";
  if (s.includes("open") || s.includes("quote") || s.includes("bidding") || s.includes("new"))
    return (
      <span className={`${base} bg-emerald-500/10 text-emerald-300 ring-emerald-500/20`}>
        Open
      </span>
    );
  if (s.includes("accepted"))
    return (
      <span className={`${base} bg-sky-500/10 text-sky-300 ring-sky-500/20`}>
        Accepted
      </span>
    );
  if (s.includes("completed"))
    return (
      <span className={`${base} bg-violet-500/10 text-violet-300 ring-violet-500/20`}>
        Completed
      </span>
    );
  if (s.includes("cancel"))
    return (
      <span className={`${base} bg-rose-500/10 text-rose-300 ring-rose-500/20`}>
        Cancelled
      </span>
    );
  return (
    <span className={`${base} bg-zinc-500/10 text-zinc-300 ring-zinc-500/20`}>
      {label || "Status"}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function DriverJobsPage() {
  const { supabase, user, profile } = await requireDriver();

  if (profile?.approved === false) redirect("/driver/pending");

  const { data: jobs, error: jobsErr } = await supabase
    .from("jobs")
    .select(
      "id,status,pickup_postcode,dropoff_postcode,pickup_time_window,items,weight_kg,fragile,created_at"
    )
    .in("status", ["open", "quote_requested", "bidding", "new"])
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: myBids, error: bidsErr } = await supabase
    .from("bids")
    .select("id,job_id,amount_gbp,status,note,created_at")
    .eq("driver_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const jobsList = (jobs ?? []) as Job[];
  const bidsList = (myBids ?? []) as Bid[];

  const activeBids = bidsList.filter((b) => (b.status || "").toLowerCase() === "active").length;
  const acceptedBids = bidsList.filter((b) =>
    (b.status || "").toLowerCase().includes("accepted")
  ).length;

  const jobsError = jobsErr ? jobsErr.message : "";
  const bidsError = bidsErr ? bidsErr.message : "";

  const profileName = profile?.full_name ? String(profile.full_name) : "Driver";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/10" />
            <div>
              <div className="text-sm text-zinc-400">ADW PriorityExpress</div>
              <div className="text-lg font-semibold leading-tight">Driver Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <JobsAutoRefresh intervalMs={10000} />
            <Link
              href="/app"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/driver/account"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Account
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Mobile-first tabs */}
      <div className="mx-auto max-w-6xl px-4 py-6 lg:hidden">
        <DriverTabs
          jobs={jobsList}
          bids={bidsList}
          profileName={profileName}
          activeBids={activeBids}
          acceptedBids={acceptedBids}
        />
      </div>

      {/* Desktop layout */}
      <div className="mx-auto hidden max-w-6xl grid-cols-1 gap-4 px-4 pb-6 lg:grid lg:grid-cols-12">
        {/* Header row */}
        <div className="lg:col-span-12">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-zinc-400">Welcome</div>
                <div className="mt-1 text-xl font-semibold">{profileName}</div>
                <div className="mt-1 text-sm text-zinc-400">
                  Live jobs update automatically. Open a job to place a bid.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-zinc-400">Available jobs</div>
                  <div className="mt-1 text-lg font-semibold">{jobsList.length}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-zinc-400">Active bids</div>
                  <div className="mt-1 text-lg font-semibold">{activeBids}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-zinc-400">Accepted</div>
                  <div className="mt-1 text-lg font-semibold">{acceptedBids}</div>
                </div>
              </div>
            </div>

            {jobsError ? (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                Could not load jobs: {jobsError}
              </div>
            ) : null}

            {bidsError ? (
              <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                Could not load bids: {bidsError}
              </div>
            ) : null}
          </Card>
        </div>

        {/* Jobs */}
        <div className="lg:col-span-8">
          <Card>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-base font-semibold">Available jobs</div>
                <div className="text-sm text-zinc-400">
                  Click “View & Bid” to open the job details and place your bid.
                </div>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
                {jobsList.length} listed
              </span>
            </div>

            <div className="border-t border-white/10">
              {jobsList.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="text-lg font-semibold">No jobs right now</div>
                  <div className="mt-1 text-sm text-zinc-400">
                    Keep this open — new jobs will appear automatically.
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {jobsList.map((j) => (
                    <li key={j.id} className="px-5 py-4 hover:bg-white/5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-sm font-semibold">
                              {j.pickup_postcode ?? "Pickup"} → {j.dropoff_postcode ?? "Dropoff"}
                            </div>
                            <StatusPill label={j.status} />
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                            <span>Posted {formatDate(j.created_at)}</span>
                            {j.pickup_time_window ? <span>• {j.pickup_time_window}</span> : null}
                            {typeof j.weight_kg === "number" ? <span>• {j.weight_kg}kg</span> : null}
                            {j.fragile ? <span>• Fragile</span> : null}
                          </div>

                          {j.items ? (
                            <div className="mt-2 line-clamp-2 text-sm text-zinc-200/90">
                              {j.items}
                            </div>
                          ) : null}
                        </div>

                        <div className="shrink-0">
                          <Link
                            href={`/driver/jobs/${j.id}`}
                            className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
                          >
                            View & Bid
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <Card className="p-5">
            <div className="text-sm text-zinc-400">Your status</div>
            <div className="mt-1 text-base font-semibold">Approved • Ready for jobs</div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-zinc-400">Live updates</div>
              <div className="mt-1 text-sm text-zinc-200">
                This page auto-refreshes every 10 seconds.
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                Toggle Auto off if you’re on slow internet.
              </div>
            </div>
          </Card>

          <Card className="mt-4">
            <div className="px-5 py-4">
              <div className="text-base font-semibold">My recent bids</div>
              <div className="text-sm text-zinc-400">Track what you’ve offered.</div>
            </div>

            <div className="border-t border-white/10">
              {bidsList.length === 0 ? (
                <div className="px-5 py-8 text-sm text-zinc-400">No bids yet.</div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {bidsList.slice(0, 8).map((b) => (
                    <li key={b.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">£{Number(b.amount_gbp).toFixed(2)}</div>
                          <div className="mt-1 text-xs text-zinc-400">
                            {formatDate(b.created_at)} • {b.status}
                          </div>
                          {b.note ? (
                            <div className="mt-2 line-clamp-2 text-sm text-zinc-300">{b.note}</div>
                          ) : null}
                        </div>

                        <Link
                          href={`/driver/jobs/${b.job_id}`}
                          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                        >
                          Open
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 text-xs text-zinc-500">
        Powered by ADW Exchange • Secure payments • Verified driver network
      </div>
    </div>
  );
}
