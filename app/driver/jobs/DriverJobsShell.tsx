"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
        active ? "bg-white text-zinc-950" : "bg-white/5 text-zinc-200 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function DriverJobsShell(props: {
  profileName: string;
  approved: boolean;
  jobs: Job[];
  bids: Bid[];
  intervalMs?: number;
}) {
  const router = useRouter();
  const intervalMs = props.intervalMs ?? 10000;

  const [tab, setTab] = useState<"jobs" | "bids">("jobs");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(true);
  const [filterFragile, setFilterFragile] = useState(false);
  const [filterHeavy, setFilterHeavy] = useState(false);

  const [auto, setAuto] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auto refresh (polling)
  useMemo(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setRefreshing(true);
      router.refresh();
      setTimeout(() => setRefreshing(false), 350);
    }, intervalMs);
    return () => clearInterval(id);
  }, [auto, intervalMs, router]);

  function manualRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 350);
  }

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return props.jobs.filter((j) => {
      if (filterOpen) {
        const s = String(j.status || "").toLowerCase();
        const openStatuses = ["open", "quote_requested", "bidding", "new"];
        if (!openStatuses.includes(s)) return false;
      }
      if (filterFragile && !j.fragile) return false;
      if (filterHeavy && !(typeof j.weight_kg === "number" && j.weight_kg >= 50)) return false;

      if (!q) return true;
      const hay = [
        j.pickup_postcode ?? "",
        j.dropoff_postcode ?? "",
        j.pickup_time_window ?? "",
        j.items ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [props.jobs, query, filterOpen, filterFragile, filterHeavy]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header row */}
      <div className="mb-4 grid gap-3 lg:grid-cols-12">
        <Card className="p-4 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-400">Driver</div>
              <div className="mt-1 text-xl font-semibold">{props.profileName}</div>
              <div className="mt-1 text-sm text-zinc-400">
                {props.approved ? "Approved • Ready for jobs" : "Pending"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={manualRefresh}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              <button
                type="button"
                onClick={() => setAuto((v) => !v)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                title="Toggle auto refresh"
              >
                {auto ? "Auto: On" : "Auto: Off"}
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-zinc-400">Live jobs</div>
              <div className="mt-1 text-lg font-semibold">{props.jobs.length}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-zinc-400">My bids</div>
              <div className="mt-1 text-lg font-semibold">{props.bids.length}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-zinc-400">Accepted</div>
              <div className="mt-1 text-lg font-semibold">
                {
                  props.bids.filter((b) => String(b.status || "").toLowerCase().includes("accepted"))
                    .length
                }
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs (mobile-first) */}
      <div className="mb-3 flex gap-2">
        <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")}>
          Live jobs
        </TabButton>
        <TabButton active={tab === "bids"} onClick={() => setTab("bids")}>
          My bids
        </TabButton>
      </div>

      {/* Search + filters */}
      {tab === "jobs" ? (
        <Card className="mb-4 p-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-7">
              <label className="mb-2 block text-sm text-zinc-300">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search postcode, items, time window…"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-white/20"
              />
            </div>

            <div className="md:col-span-5">
              <label className="mb-2 block text-sm text-zinc-300">Filters</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilterOpen((v) => !v)}
                  className={[
                    "rounded-full px-3 py-1 text-xs ring-1 ring-inset",
                    filterOpen
                      ? "bg-white text-zinc-950 ring-white/20"
                      : "bg-white/5 text-zinc-200 ring-white/10 hover:bg-white/10",
                  ].join(" ")}
                >
                  Open only
                </button>

                <button
                  type="button"
                  onClick={() => setFilterFragile((v) => !v)}
                  className={[
                    "rounded-full px-3 py-1 text-xs ring-1 ring-inset",
                    filterFragile
                      ? "bg-white text-zinc-950 ring-white/20"
                      : "bg-white/5 text-zinc-200 ring-white/10 hover:bg-white/10",
                  ].join(" ")}
                >
                  Fragile
                </button>

                <button
                  type="button"
                  onClick={() => setFilterHeavy((v) => !v)}
                  className={[
                    "rounded-full px-3 py-1 text-xs ring-1 ring-inset",
                    filterHeavy
                      ? "bg-white text-zinc-950 ring-white/20"
                      : "bg-white/5 text-zinc-200 ring-white/10 hover:bg-white/10",
                  ].join(" ")}
                >
                  Heavy 50kg+
                </button>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Content */}
      {tab === "jobs" ? (
        <Card>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-base font-semibold">Available jobs</div>
              <div className="text-sm text-zinc-400">
                New jobs appear automatically while Auto is on.
              </div>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
              {filteredJobs.length} shown
            </span>
          </div>

          <div className="border-t border-white/10">
            {filteredJobs.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="text-lg font-semibold">No jobs match your filters</div>
                <div className="mt-1 text-sm text-zinc-400">Try clearing filters or search.</div>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {filteredJobs.map((j) => (
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
                          <div className="mt-2 line-clamp-2 text-sm text-zinc-200/90">{j.items}</div>
                        ) : null}
                      </div>

                      <div className="shrink-0">
                        <a
                          href={`/driver/jobs/${j.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
                        >
                          View & Bid
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-base font-semibold">My recent bids</div>
              <div className="text-sm text-zinc-400">Track your offers and statuses.</div>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
              {props.bids.length} total
            </span>
          </div>

          <div className="border-t border-white/10">
            {props.bids.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-zinc-400">No bids yet.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {props.bids.slice(0, 20).map((b) => (
                  <li key={b.id} className="px-5 py-4 hover:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">
                          £{Number(b.amount_gbp).toFixed(2)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          {formatDate(b.created_at)} • {b.status}
                        </div>
                        {b.note ? (
                          <div className="mt-2 line-clamp-2 text-sm text-zinc-300">{b.note}</div>
                        ) : null}
                      </div>
                      <a
                        href={`/driver/jobs/${b.job_id}`}
                        className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                      >
                        Open
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      )}

      <div className="mt-6 text-xs text-zinc-500">
        Powered by ADW Exchange • Secure payments • Verified driver network
      </div>
    </div>
  );
}
