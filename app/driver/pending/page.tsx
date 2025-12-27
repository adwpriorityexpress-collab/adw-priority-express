// app/driver/pending/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireDriver } from "../../lib/requireDriver";

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

export default async function DriverPendingPage() {
  const { profile } = await requireDriver();

  // If approved, send to jobs
  if (profile?.approved) redirect("/driver/jobs");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar (matches the portal) */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/10" />
            <div>
              <div className="text-sm text-zinc-400">ADW PriorityExpress</div>
              <div className="text-lg font-semibold leading-tight">Driver Verification</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/drivers"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Driver info
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              How it works
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Main message */}
          <div className="lg:col-span-8">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20" />
                <div className="min-w-0">
                  <div className="text-xl font-semibold">Account pending approval</div>
                  <div className="mt-2 text-sm text-zinc-400">
                    We’re verifying your details to keep the platform safe and professional for
                    customers. You’ll get access to live jobs as soon as you’re approved.
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold">What happens next</div>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                      <li className="flex gap-2">
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-400" />
                        <span>We review your driver profile and contact details.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-400" />
                        <span>We check vehicle type and basic compliance info.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-400" />
                        <span>Once approved, you’ll be able to bid on jobs instantly.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      href="/drivers"
                      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
                    >
                      View driver requirements
                    </Link>
                    <Link
                      href="/"
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Back to website
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Card className="p-6">
              <div className="text-sm text-zinc-400">Verification status</div>
              <div className="mt-1 text-base font-semibold">In review</div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-zinc-400">Typical time</div>
                <div className="mt-1 text-sm text-zinc-200">
                  Usually same day (working hours).
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  If you registered outside hours, we’ll review next working day.
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-zinc-400">Need help?</div>
                <div className="mt-1 text-sm text-zinc-200">
                  If it’s been a while, message support with your driver name and phone number.
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  (You can wire this to WhatsApp/email later.)
                </div>
              </div>
            </Card>

            <div className="mt-4 text-xs text-zinc-500">
              Powered by ADW Exchange • Verified driver network • Secure payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
