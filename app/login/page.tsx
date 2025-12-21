import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login • ADW PriorityExpress",
};

function TrustItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm leading-6 text-white/70">{desc}</div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
      <span className="text-sm font-semibold text-white/85">ADW</span>
    </div>
  );
}

export default async function LoginPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = props.searchParams ? await props.searchParams : {};
  const check = typeof sp.check === "string" ? sp.check : undefined;

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      {/* subtle background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-white/3 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full gap-6 lg:grid-cols-12">
          {/* Left: Auth card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-3">
                <BrandMark />
                <div>
                  <div className="text-sm font-semibold text-white">ADW PriorityExpress</div>
                  <div className="text-xs text-white/60">Powered by ADW Exchange</div>
                </div>
              </div>

              {check === "email" && (
                <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  Account created. Please check your email and click the confirmation link, then log in.
                </div>
              )}

              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Sign in to manage jobs, bids, payments, and delivery status.
              </p>

              <div className="mt-6">
                <LoginForm />
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-white/55">
                <Link href="/" className="hover:text-white">
                  ← Back to home
                </Link>
                <span>Secure login • Stripe payments</span>
              </div>
            </div>
          </div>

          {/* Right: Trust panel */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-7">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Trust & Clarity
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">
                A professional courier marketplace — built for confidence
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Customers pay securely, drivers bid transparently, and job status stays clear for everyone.
              </p>

              <div className="mt-6 grid gap-3">
                <TrustItem
                  title="Secure payments"
                  desc="Customer payments are processed via Stripe Checkout with clear payment status."
                />
                <TrustItem
                  title="Verified onboarding"
                  desc="Drivers complete onboarding and approval before accessing the marketplace."
                />
                <TrustItem
                  title="Clear job statuses"
                  desc="Bidding → Assigned → In Transit → Delivered — no confusion, no messy messages."
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm font-semibold text-white">New here?</div>
                <div className="mt-2 text-sm text-white/70">Create an account in minutes.</div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    How it works
                  </Link>
                </div>
              </div>

              <div className="mt-6 text-xs text-white/55">
                Powered by <span className="text-white/75">ADW Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

