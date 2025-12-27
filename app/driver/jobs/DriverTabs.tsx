// app/driver/jobs/DriverTabs.tsx
"use client";

import { useMemo, useState } from "react";

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

function TabBtn({
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

export default function DriverTabs(props: {
  jobs: Job[];
  bids: Bid[];
  profileName: string;
  activeBids: number;
  acceptedBids: number;
}) {
  const [tab, setTab] = useState<"jobs" | "bids" | "profile">("jobs");
  const [q, setQ] = useState("");

  const jobsFiltered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return props.jobs;

    return props.jobs.filter((j) => {
      const hay = [
        j.pickup_postcode ?? "",
        j.dropoff_postcode ?? "",
        j.pickup_time_window ?? "",
        j.items ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [props.jobs, q]);

  return (
    <div className="lg:hidden">
      {/* Tabs */}
      <div className="mb-3 flex gap-2">
        <TabBtn active={tab === "jobs"} onClick={() => setTab("jobs")}>
          Live Jobs
        </TabBtn>
        <TabBtn active={tab === "bids"} onClick={() => setTab("bids")}>
          My Bids
        </TabBtn>
        <TabBtn active={tab === "profile"} onClick={() => setTab("profile")}>
          Profile
        </TabBtn>
      </div>

      {tab === "jobs" ? (
        <>
          <Card className="mb-3 p-4">
            <label className="mb-2 block text-sm text-zinc-300">Search jobs</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Postcode, items, time…"
              className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-white/20"
            />
            <div className="mt-2 text-xs text-zinc-500">
              Showing {jobsFiltered.length} job(s)
            </div>
          </Card>

          <Card>
            <div className="px-5 py-4">
              <div className="text-base font-semibold">Available jobs</div>
              <div className="text-sm text-zinc-400">Tap a job to view and bid.</div>
            </div>

            <div className="border-t border-white/10">
              {jobsFiltered.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="text-lg font-semibold">No jobs found</div>
                  <div className="mt-1 text-sm text-zinc-400">Try a different search.</div>
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {jobsFiltered.map((j) => (
                    <li key={j.id} className="px-5 py-4 hover:bg-white/5">
                      <a href={`/driver/jobs/${j.id}`} className="block">
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
                              {typeof j.weight_kg === "number" ? (
                                <span>• {j.weight_kg}kg</span>
                              ) : null}
                              {j.fragile ? <span>• Fragile</span> : null}
                            </div>

                            {j.items ? (
                              <div className="mt-2 line-clamp-2 text-sm text-zinc-200/90">
                                {j.items}
                              </div>
                            ) : null}
                          </div>

                          <div className="shrink-0 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950">
                            Open
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </>
      ) : null}

      {tab === "bids" ? (
        <Card>
          <div className="px-5 py-4">
            <div className="text-base font-semibold">My bids</div>
            <div className="text-sm text-zinc-400">Your latest offers.</div>
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
      ) : null}

      {tab === "profile" ? (
        <div className="space-y-3">
          <Card className="p-5">
            <div className="text-sm text-zinc-400">Profile</div>
            <div className="mt-1 text-lg font-semibold">{props.profileName}</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-zinc-400">Active bids</div>
                <div className="mt-1 text-2xl font-semibold">{props.activeBids}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-zinc-400">Accepted</div>
                <div className="mt-1 text-2xl font-semibold">{props.acceptedBids}</div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-sm text-zinc-400">Features coming next</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>• Availability toggle (Online/Offline)</li>
              <li>• Push alerts for new jobs</li>
              <li>• Saved bid presets</li>
            </ul>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
