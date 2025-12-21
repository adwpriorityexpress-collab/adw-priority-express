import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign up • ADW PriorityExpress",
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

export default function SignupPage() {
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

              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">
                Create your account
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Customers can post jobs in minutes. Drivers apply and get approved before bidding.
              </p>

              <div className="mt-6">
                <SignupForm />
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-white/55">
                <Link href="/" className="hover:text-white">
                  ← Back to home
                </Link>
                <span>Secure signup • Verified drivers</span>
              </div>
            </div>
          </div>

          {/* Right: Trust panel */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-7">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Designed for trust
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Professional marketplace standards
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Built around clarity: secure payments, transparent bidding, and trackable status updates.
              </p>

              <div className="mt-6 grid gap-3">
                <TrustItem
                  title="Customer confidence"
                  desc="Choose from bids, pay securely via Stripe, and track job status clearly."
                />
                <TrustItem
                  title="Driver accountability"
                  desc="Drivers are approved before they can bid, helping maintain standards."
                />
                <TrustItem
                  title="Fair marketplace"
                  desc="Independent contractors set their own bids. Customers choose what works best."
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm font-semibold text-white">Already registered?</div>
                <div className="mt-2 text-sm text-white/70">Sign in to your dashboard.</div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90"
                  >
                    Sign in
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

