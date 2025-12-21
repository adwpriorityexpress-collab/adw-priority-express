import Link from "next/link";
import MarketingShell from "../../components/MarketingShell";

function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="card-soft p-6">
      <div className="badge">Step {step}</div>
      <div className="mt-3 text-lg font-black">{title}</div>
      <div className="mt-2 text-brand-muted text-sm leading-relaxed">{desc}</div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="card-soft p-6">
      <div className="text-base font-black">{q}</div>
      <div className="mt-2 text-brand-muted text-sm leading-relaxed">{a}</div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <MarketingShell active="how">
      <div className="container py-12">
        <div className="card p-8 md:p-10">
          <div className="badge">For customers</div>
          <h1 className="mt-5 text-4xl md:text-5xl font-black leading-tight">
            How ADW PriorityExpress works
          </h1>
          <p className="mt-4 text-brand-muted max-w-2xl leading-relaxed">
            Post your delivery job, drivers bid, you pick the best option, and pay securely with Stripe.
            We handle the technology, verification, and payment flow.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link className="btn-primary" href="/signup">
              Post a job
            </Link>
            <Link className="btn-secondary" href="/drivers">
              I’m a driver
            </Link>
          </div>
        </div>

        <h2 className="mt-10 text-2xl md:text-3xl font-black">Customer journey</h2>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StepCard
            step="1"
            title="Post the job"
            desc="Enter pickup & drop-off, vehicle type, time window, and any special instructions."
          />
          <StepCard
            step="2"
            title="Get bids"
            desc="Verified drivers submit bids. You can compare price, experience, and rating."
          />
          <StepCard
            step="3"
            title="Accept a driver"
            desc="Choose the best bid. The job becomes assigned and the driver is notified."
          />
          <StepCard
            step="4"
            title="Pay securely"
            desc="Pay instantly via Stripe Checkout. The platform fee is taken automatically."
          />
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-4">
          <div className="card p-7">
            <div className="text-xl font-black">What you get</div>
            <ul className="mt-4 space-y-3 text-brand-muted text-sm leading-relaxed">
              <li>• Access to verified drivers (approval required before bidding)</li>
              <li>• Transparent pricing (bids, not hidden fees)</li>
              <li>• Stripe payments (secure checkout)</li>
              <li>• Tracking & status updates through your dashboard</li>
              <li>• Clear job statuses: bidding → assigned → in_transit → delivered</li>
            </ul>
          </div>

          <div className="card p-7">
            <div className="text-xl font-black">Payments & protection</div>
            <ul className="mt-4 space-y-3 text-brand-muted text-sm leading-relaxed">
              <li>• You pay once you accept a driver (Stripe Checkout)</li>
              <li>• Platform fee is included automatically</li>
              <li>• Drivers are paid on scheduled terms (typically 30 days)</li>
              <li>• The platform provides payment handling and record keeping</li>
            </ul>
            <div className="mt-5 badge">
              Note: Drivers are independent contractors; the platform provides technology and payment
              handling.
            </div>
          </div>
        </div>

        <h2 className="mt-12 text-2xl md:text-3xl font-black">FAQ</h2>
        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <FAQ
            q="Do I get instant quotes?"
            a="You’ll receive bids from drivers. This gives you real pricing based on availability and job details."
          />
          <FAQ
            q="Are drivers verified?"
            a="Yes. Drivers submit documents and must be approved before they can bid on jobs."
          />
          <FAQ
            q="When do I pay?"
            a="After you accept a bid, you pay securely via Stripe Checkout. The job updates to paid."
          />
          <FAQ
            q="What if my job details change?"
            a="Edit the job details before accepting a bid. If changes are needed after acceptance, contact support/driver and agree changes before proceeding."
          />
        </div>

        <div className="mt-12 card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-2xl font-black">Ready to post a job?</div>
            <div className="mt-2 text-brand-muted text-sm leading-relaxed">
              Create a job in minutes and receive bids from verified drivers.
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link className="btn-primary" href="/signup">
              Get started
            </Link>
            <Link className="btn-secondary" href="/customer">
              Customer dashboard
            </Link>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}

