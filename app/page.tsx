import Link from "next/link";
import Image from "next/image";
import MarketingShell from "../components/MarketingShell";
import ActivityToast from "../components/ActivityToast";
import SupportBot from "../components/SupportBot";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function Card({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/70">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-white/60">{label}</div>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80">
        ✓
      </span>
      <span className="text-sm leading-6 text-white/75">{children}</span>
    </li>
  );
}

export default function HomePage() {
  return (
    <MarketingShell>
      {/* Activity Popup */}
      <ActivityToast />

      {/* Mini help bot */}
      <SupportBot />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-white/3 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-12 sm:pt-16">
          <div className="flex flex-col items-start gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Same-day & scheduled</Badge>
              <Badge>Instant bids</Badge>
              <Badge>Secure Stripe payments</Badge>
              <Badge className="hidden sm:inline-flex">Verified drivers</Badge>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Book a trusted courier in minutes —{" "}
                <span className="text-white/80">pay securely, track clearly, deliver confidently.</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                ADW PriorityExpress is a marketplace that connects customers with independent courier drivers.
                Post a job, receive bids, choose your driver, and pay instantly via Stripe.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Get started
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                How it works
              </Link>

              <div className="text-xs text-white/55 sm:ml-2">
                Powered by <span className="text-white/75">ADW Exchange</span>
              </div>
            </div>

            <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm font-semibold text-white">Payments you can trust</div>
                <div className="mt-2 text-sm leading-6 text-white/70">
                  Customer payments are processed via Stripe Checkout (card, Apple Pay/Google Pay where available).
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm font-semibold text-white">Transparent bidding</div>
                <div className="mt-2 text-sm leading-6 text-white/70">
                  Drivers bid for your job — you choose the best price and vehicle type for the task.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm font-semibold text-white">Professional standards</div>
                <div className="mt-2 text-sm leading-6 text-white/70">
                  Driver onboarding + approval checks help keep the marketplace reliable and accountable.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <Image
                        src="/logo.png"
                        alt="ADW PriorityExpress"
                        width={36}
                        height={36}
                        className="h-9 w-9"
                        priority
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">ADW PriorityExpress</div>
                      <div className="text-xs text-white/60">Marketplace overview</div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Badge>Live bids</Badge>
                    <Badge>Payment status</Badge>
                    <Badge>Driver assignment</Badge>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Stat label="Typical setup time" value="2–5 min" />
                  <Stat label="Bids per job" value="Multiple" />
                  <Stat label="Payment" value="Instant" />
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="text-sm font-semibold text-white">What you get</div>
                  <ul className="mt-3 space-y-2">
                    <CheckItem>Post a delivery job with pickup/drop-off details and vehicle type.</CheckItem>
                    <CheckItem>Receive bids from approved drivers and accept the one you prefer.</CheckItem>
                    <CheckItem>Pay securely via Stripe — see clear payment & payout status.</CheckItem>
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-base font-semibold text-white">Built for trust</h2>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Customers need clarity. Drivers need fair jobs. The platform keeps both sides informed.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="text-sm font-semibold text-white">Verified onboarding</div>
                    <div className="mt-2 text-sm text-white/70">
                      Drivers submit details and are approved before accessing the job board.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="text-sm font-semibold text-white">Clear marketplace rules</div>
                    <div className="mt-2 text-sm text-white/70">
                      Statuses (bidding → assigned → in transit → delivered) reduce confusion and disputes.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="text-sm font-semibold text-white">Independent contractors</div>
                    <div className="mt-2 text-sm text-white/70">
                      Drivers operate independently and bid based on availability and vehicle type.
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/drivers"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Become a driver
                  </Link>
                  <div className="mt-3 text-center text-xs text-white/55">
                    Powered by <span className="text-white/75">ADW Exchange</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Professional marketplace features (from day one)
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-white/70">
            Everything is designed to feel clear, safe, and “business-ready” — not like a casual Facebook post.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Instant bidding"
            desc="Drivers bid in real time so customers can choose the best value and vehicle fit."
            icon={<span className="text-sm text-white/80">⚡</span>}
          />
          <Card
            title="Secure payments"
            desc="Stripe Checkout handles card payments and status updates for paid/unpaid jobs."
            icon={<span className="text-sm text-white/80">🔒</span>}
          />
          <Card
            title="Clear job statuses"
            desc="Bidding → Assigned → In Transit → Delivered so everyone knows what’s happening."
            icon={<span className="text-sm text-white/80">🧭</span>}
          />
          <Card
            title="Driver approval"
            desc="Drivers use onboarding and are approved before they can bid on jobs."
            icon={<span className="text-sm text-white/80">🪪</span>}
          />
          <Card
            title="Scheduled payouts"
            desc="Driver payouts can be scheduled (e.g. 30 days later) and processed automatically."
            icon={<span className="text-sm text-white/80">💷</span>}
          />
          <Card
            title="Ratings (next)"
            desc="Post-delivery ratings help keep standards high and reward reliable drivers."
            icon={<span className="text-sm text-white/80">⭐</span>}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Ready to get started?</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Post a job in minutes, get bids, choose your driver, and pay securely.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

