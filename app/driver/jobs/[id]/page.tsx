// app/driver/jobs/[id]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireDriver } from "../../../lib/requireDriver";

import { placeOrUpdateBidAction, withdrawBidAction } from "./actions";
import BidBox from "./BidBox";

type Job = {
  id: string;
  status: string;
  pickup_postcode: string | null;
  pickup_address: string | null;
  dropoff_postcode: string | null;
  dropoff_address: string | null;
  pickup_date: string | null;
  pickup_time_window: string | null;
  items: string | null;
  weight_kg: number | null;
  fragile: boolean | null;
  special_instructions: string | null;
  created_at: string;
};

type MyBid = {
  id: string;
  amount_gbp: number;
  status: string;
  note: string | null;
  created_at: string;
  updated_at?: string | null;
};

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

function StatusPill({ label }: { label: string }) {
  const s = (label || "").toLowerCase();
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset";

  if (s.includes("open") || s.includes("quote") || s.includes("bidding") || s.includes("new")) {
    return (
      <span className={`${base} bg-emerald-500/10 text-emerald-300 ring-emerald-500/20`}>
        Open for bids
      </span>
    );
  }
  if (s.includes("accepted")) {
    return (
      <span className={`${base} bg-sky-500/10 text-sky-300 ring-sky-500/20`}>
        Accepted
      </span>
    );
  }
  if (s.includes("completed")) {
    return (
      <span className={`${base} bg-violet-500/10 text-violet-300 ring-violet-500/20`}>
        Completed
      </span>
    );
  }
  if (s.includes("cancel")) {
    return (
      <span className={`${base} bg-rose-500/10 text-rose-300 ring-rose-500/20`}>
        Cancelled
      </span>
    );
  }
  return (
    <span className={`${base} bg-zinc-500/10 text-zinc-300 ring-zinc-500/20`}>
      {label || "Status"}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="text-sm text-zinc-100 text-right">{value}</div>
    </div>
  );
}

export default async function DriverJobDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ ok?: string; err?: string }>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const okMsg = sp?.ok ? String(sp.ok) : "";
  const errMsg = sp?.err ? String(sp.err) : "";

  const { supabase, user, profile } = await requireDriver();

  if (profile?.approved === false) redirect("/driver/pending");

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select(
      "id,status,pickup_postcode,pickup_address,dropoff_postcode,dropoff_address,pickup_date,pickup_time_window,items,weight_kg,fragile,special_instructions,created_at"
    )
    .eq("id", id)
    .single();

  if (jobErr || !job) {
    redirect(`/driver/jobs?err=${encodeURIComponent(jobErr?.message || "Job not found")}`);
  }

  const { data: myBid, error: bidErr } = await supabase
    .from("bids")
    .select("id,amount_gbp,status,note,created_at,updated_at")
    .eq("job_id", id)
    .eq("driver_id", user.id)
    .maybeSingle();

  // If bids are blocked by RLS or query fails, treat as "no bid" but show a warning.
  const bidWarning = bidErr ? bidErr.message : "";

  const j = job as Job;
  const bid = (myBid ?? null) as MyBid | null;

  const status = String(j.status ?? "").toLowerCase();
  const openStatuses = ["open", "quote_requested", "bidding", "new"];
  const isOpenForBids = openStatuses.includes(status);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/10" />
            <div>
              <div className="text-sm text-zinc-400">ADW PriorityExpress</div>
              <div className="text-lg font-semibold leading-tight">Job details</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/driver/jobs"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              ← Back to jobs
            </Link>
            <Link
              href="/driver/account"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Account
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-12">
        {/* Left: Details */}
        <div className="lg:col-span-8">
          <Card>
            <div className="px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-zinc-400">Route</div>
                  <div className="mt-1 text-xl font-semibold">
                    {j.pickup_postcode ?? "Pickup"}{" "}
                    <span className="text-zinc-400">→</span>{" "}
                    {j.dropoff_postcode ?? "Dropoff"}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusPill label={j.status} />
                    <span className="text-xs text-zinc-400">Posted {formatDate(j.created_at)}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-zinc-400">Job ID</div>
                  <div className="mt-1 font-mono text-xs text-zinc-200">{j.id}</div>
                </div>
              </div>

              {errMsg ? (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errMsg}
                </div>
              ) : null}

              {okMsg ? (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {okMsg}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="text-sm font-semibold">Pickup</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    {j.pickup_address ?? "Address not provided"}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">{j.pickup_postcode ?? ""}</div>
                </Card>

                <Card className="p-4">
                  <div className="text-sm font-semibold">Drop-off</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    {j.dropoff_address ?? "Address not provided"}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">{j.dropoff_postcode ?? ""}</div>
                </Card>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="text-sm font-semibold">Timing</div>
                  <div className="mt-2 space-y-1">
                    <InfoRow label="Pickup date" value={j.pickup_date ?? "Not set"} />
                    <InfoRow label="Time window" value={j.pickup_time_window ?? "Not set"} />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-sm font-semibold">Load details</div>
                  <div className="mt-2 space-y-1">
                    <InfoRow
                      label="Weight"
                      value={typeof j.weight_kg === "number" ? `${j.weight_kg} kg` : "Not set"}
                    />
                    <InfoRow label="Fragile" value={j.fragile ? "Yes" : "No"} />
                  </div>
                </Card>
              </div>

              {j.items ? (
                <div className="mt-5">
                  <div className="text-sm font-semibold">Items</div>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
                    {j.items}
                  </div>
                </div>
              ) : null}

              {j.special_instructions ? (
                <div className="mt-4">
                  <div className="text-sm font-semibold">Special instructions</div>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
                    {j.special_instructions}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="p-5">
              <div className="text-sm text-zinc-400">Driver tips</div>
              <div className="mt-1 text-base font-semibold">Get accepted faster</div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                <li>• Include your vehicle type and ETA in your note.</li>
                <li>• Keep your bid fair — customers choose value + trust.</li>
                <li>• Be clear if you can do same-day pickup.</li>
              </ul>
            </Card>

            <Card className="p-5">
              <div className="text-sm text-zinc-400">Safety</div>
              <div className="mt-1 text-base font-semibold">Be careful</div>
              <div className="mt-3 text-sm text-zinc-300">
                If anything looks suspicious, don’t proceed — message support before accepting work.
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/how-it-works"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  How it works
                </Link>
                <Link
                  href="/drivers"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Driver info
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Right: Bid column */}
        <div className="lg:col-span-4">
          <Card className="p-5">
            <div className="text-sm text-zinc-400">Job summary</div>
            <div className="mt-1 text-base font-semibold">
              {j.pickup_postcode ?? "Pickup"} → {j.dropoff_postcode ?? "Dropoff"}
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-zinc-400">Status</div>
              <div className="mt-1">
                <StatusPill label={j.status} />
              </div>
              <div className="mt-2 text-xs text-zinc-400">Posted</div>
              <div className="text-sm text-zinc-200">{formatDate(j.created_at)}</div>
            </div>

            {bidWarning ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Could not load your bid: {bidWarning}
              </div>
            ) : null}

            {/* Existing bid */}
            {bid ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-zinc-400">Current bid</div>
                    <div className="mt-1 text-2xl font-semibold">
                      £{Number(bid.amount_gbp).toFixed(2)}
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Status: <span className="text-zinc-200">{bid.status}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-400">
                    {bid.updated_at ? (
                      <>
                        Updated
                        <div className="text-zinc-200">{formatDate(String(bid.updated_at))}</div>
                      </>
                    ) : (
                      <>
                        Placed
                        <div className="text-zinc-200">{formatDate(bid.created_at)}</div>
                      </>
                    )}
                  </div>
                </div>

                {bid.note ? (
                  <div className="mt-3 text-sm text-zinc-300">
                    <div className="text-xs text-zinc-400">Your note</div>
                    <div className="mt-1">{bid.note}</div>
                  </div>
                ) : null}

                <form action={withdrawBidAction} className="mt-4">
                  <input type="hidden" name="jobId" value={j.id} />
                  <button
                    className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/15"
                    type="submit"
                  >
                    Withdraw bid
                  </button>
                </form>
              </div>
            ) : null}

            {/* Place/update bid */}
            {isOpenForBids ? (
              <div className="mt-4">
                <div className="text-sm text-zinc-400">Your bid</div>
                <div className="mt-1 text-base font-semibold">
                  {bid ? "Update your bid" : "Place a bid"}
                </div>

                <form action={placeOrUpdateBidAction} className="mt-3">
                  <BidBox
                    jobId={j.id}
                    isOpenForBids={true}
                    existingBid={bid ? { amount_gbp: Number(bid.amount_gbp), note: bid.note ?? null } : null}
                  />
                </form>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                This job is not currently accepting bids.
              </div>
            )}

            <div className="mt-4 text-xs text-zinc-500">
              Powered by ADW Exchange • Secure payments • Verified network
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

