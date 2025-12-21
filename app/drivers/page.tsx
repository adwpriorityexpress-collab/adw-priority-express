import Link from "next/link";
import MarketingShell from "../../components/MarketingShell";

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}

function Block({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card-soft p-6">
      <div className="text-lg font-black">{title}</div>
      <div className="mt-2 text-brand-muted text-sm leading-relaxed">{desc}</div>
    </div>
  );
}

export default function DriversPage() {
  return (
    <MarketingShell active="drivers">
      <div className="container py-12">
        <div className="card p-8 md:p-10">
          <div className="badge">For drivers</div>
          <h1 className="mt-5 text-4xl md:text-5xl font-black leading-tight">
            Earn more with verified courier work
          </h1>
          <p className="mt-4 text-brand-muted max-w-2xl leading-relaxed">
            Apply, get verified, bid on delivery jobs, and get paid through our platform. You stay
            independent — we provide the tech, marketplace, and payment handling.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link className="btn-primary" href="/signup">
              Apply to drive
            </Link>
            <Link className="btn-secondary" href="/login">
              Driver login
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill>Verified onboarding</Pill>
            <Pill>Bid on jobs</Pill>
            <Pill>Stripe payments</Pill>
            <Pill>Scheduled payouts</Pill>
          </div>
        </div>

        <h2 className="mt-10 text-2xl md:text-3xl font-black">How it works</h2>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Block title="1) Apply" desc="Create your driver profile and upload required documents." />
          <Block title="2) Get approved" desc="We review your docs. Once approved, you can access the job board." />
          <Block title="3) Bid on work" desc="Submit bids on jobs that match your vehicle type and availability." />
          <Block title="4) Deliver & update" desc="Complete the job and update status through the app." />
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-4">
          <div className="card p-7">
            <div className="text-xl font-black">Driver requirements</div>
            <ul className="mt-4 space-y-3 text-brand-muted text-sm leading-relaxed">
              <li>• Right to work document</li>
              <li>• Photo ID</li>
              <li>• Insurance (as required for your work type)</li>
              <li>• Vehicle type declared (Small van / Luton / etc.)</li>
              <li>• Professional conduct — no cowboys</li>
            </ul>
            <div className="mt-5 badge">
              Drivers are independent contractors. You control what you bid on and when you work.
            </div>
          </div>

          <div className="card p-7">
            <div className="text-xl font-black">Payments & payouts</div>
            <ul className="mt-4 space-y-3 text-brand-muted text-sm leading-relaxed">
              <li>• Customers pay via Stripe after accepting your bid</li>
              <li>• Platform fee is taken automatically</li>
              <li>• Your payout is scheduled (e.g. 30 days after payment)</li>
              <li>• Payouts are processed via the platform’s payout run endpoint</li>
            </ul>
            <div className="mt-5 badge">
              Coming soon: Fast payout option (early pay for a small fee).
            </div>
          </div>
        </div>

        <div className="mt-12 card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-2xl font-black">Ready to apply?</div>
            <div className="mt-2 text-brand-muted text-sm leading-relaxed">
              Join the driver network and start bidding on verified jobs.
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link className="btn-primary" href="/signup">
              Apply now
            </Link>
            <Link className="btn-secondary" href="/driver/jobs">
              View job board
            </Link>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
