// app/customer/page.tsx
import Link from "next/link";
import { requireCustomer } from "@/lib/requireCustomer";

type SearchParams = { created?: string; err?: string };

export default async function CustomerPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const { supabase, user } = await requireCustomer();
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Customer Dashboard</h1>
          <div className="mt-1 text-sm text-brand-muted">
            Logged in as <span className="text-brand-text font-semibold">{user.email}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link className="btn-ghost" href="/">
            Home
          </Link>
          <Link className="btn-secondary" href="/logout">
            Logout
          </Link>
        </div>
      </div>

      {searchParams?.created ? (
        <div className="mt-6 card-soft p-4 border-emerald-500/25 bg-emerald-500/10 text-emerald-200">
          ✅ Job created successfully.
        </div>
      ) : null}

      {searchParams?.err ? (
        <div className="mt-6 card-soft p-4 border-red-500/25 bg-red-500/10 text-red-200">
          ❌ {searchParams.err}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 card-soft p-4 border-red-500/25 bg-red-500/10 text-red-200">
          ❌ Failed to load jobs: {error.message}
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold">Your jobs</h2>
        <Link className="btn-primary" href="/customer/new">
          + Create job
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {!jobs || jobs.length === 0 ? (
          <div className="card p-5">
            <div className="text-sm text-brand-muted">
              No jobs yet. Click <span className="text-brand-text font-semibold">Create job</span> to post your first
              delivery.
            </div>
          </div>
        ) : (
          jobs.map((job: any) => (
            <div key={job.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="font-extrabold">
                  {job.pickup_postcode || "Pickup"} → {job.dropoff_postcode || "Dropoff"}
                </div>
                <span className="badge">{job.status}</span>
              </div>

              <div className="mt-2 text-sm text-brand-muted">
                {job.items ? job.items : "No item details provided"}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="btn-secondary" href={`/customer/jobs/${encodeURIComponent(job.id)}`}>
                  View
                </Link>
                <Link className="btn-secondary" href={`/customer/jobs/${encodeURIComponent(job.id)}?tab=bids`}>
                  Bids
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

