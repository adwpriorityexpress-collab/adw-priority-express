import Link from "next/link";

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="card feature" style={{ padding: 18 }}>
      <b style={{ fontSize: 14 }}>{props.title}</b>
      <div style={{ marginTop: 8, color: "rgba(255,255,255,0.68)", fontSize: 13.5, lineHeight: 1.55 }}>
        {props.children}
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="trustPill">{children}</span>;
}

export default function DriversPage() {
  return (
    <>
      {/* Nav */}
      <div className="nav">
        <div className="container">
          <div className="navInner">
            <Link className="brand" href="/">
              <div className="logo" />
              <div className="brandText">
                <b>ADW PriorityExpress</b>
                <span>Courier Marketplace • UK</span>
              </div>
            </Link>

            <div className="navLinks">
              <Link className="btn" href="/">Home</Link>
              <Link className="btn" href="/login">Log in</Link>
              <Link className="btn" href="/signup">Create account</Link>
              <Link className="btn btnPrimary" href="/signup">Apply to drive</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="hero">
        <div className="container">
          <div className="card heroCard" style={{ padding: 22 }}>
            <span className="kicker">🚐 Driver Network • Verified • Professional</span>

            <h1 className="h1" style={{ marginBottom: 10 }}>
              Join our verified driver network.
            </h1>

            <p className="lead" style={{ marginBottom: 14 }}>
              ADW PriorityExpress connects customers with independent drivers. You choose the jobs you want,
              place bids, and complete work locally or nationwide — with clear job details and secure payment tracking.
            </p>

            <div className="heroActions">
              <Link className="btn btnPrimary" href="/signup">Apply to drive</Link>
              <Link className="btn" href="/login">Driver log in</Link>
              <Link className="btn btnGreen" href="/customer">Post a job (customer)</Link>
            </div>

            <div className="trustRow">
              <Pill>✅ Verified platform</Pill>
              <Pill>📍 Clear job details</Pill>
              <Pill>💷 Transparent bidding</Pill>
              <Pill>🧾 Payment recorded</Pill>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section">
        <div className="container">
          <h2 className="sectionTitle">How it works for drivers</h2>
          <p className="sectionSub">
            Simple process — no nonsense. You stay in control of your pricing and availability.
          </p>

          <div className="grid3">
            <Card title="1) Apply & get verified">
              Submit your details and documents. Once approved, you can access the job board and start bidding.
            </Card>

            <Card title="2) Bid on jobs you want">
              You decide the price. Customers review bids and accept the best option for them.
            </Card>

            <Card title="3) Complete jobs & build reputation">
              Move the job through status updates and deliver professionally. Ratings (coming next) help you win more work.
            </Card>
          </div>

          <div style={{ height: 14 }} />

          <h2 className="sectionTitle">What you’ll need</h2>
          <p className="sectionSub">
            We aim to keep the network professional and trustworthy. Typical requirements:
          </p>

          <div className="grid3">
            <Card title="Identity & right to work">
              Government-issued ID and right-to-work documentation.
            </Card>

            <Card title="Driving licence & vehicle details">
              Licence details plus vehicle type (Small van / SWB / LWB / Luton etc).
            </Card>

            <Card title="Contact details & professionalism">
              Reliable phone/email, good communication, and respectful customer service.
            </Card>
          </div>

          <div style={{ height: 14 }} />

          <h2 className="sectionTitle">Why join ADW PriorityExpress</h2>
          <p className="sectionSub">
            Built to help good drivers get more work — with clear rules and a trusted customer experience.
          </p>

          <div className="grid3">
            <Card title="You control your pricing">
              Bid what the job is worth. No forced rates — you choose what works for you.
            </Card>

            <Card title="Clear job info">
              Pickup/dropoff, item notes, time windows — so you can price accurately.
            </Card>

            <Card title="Trust-first platform">
              Customers see a professional flow, which helps serious drivers avoid time-wasters.
            </Card>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn btnPrimary" href="/signup">Apply to drive</Link>
            <Link className="btn" href="/login">Log in</Link>
            <Link className="btn" href="/">Back to home</Link>
          </div>

          <div style={{ marginTop: 16, color: "rgba(255,255,255,0.68)", fontSize: 13.5, lineHeight: 1.6 }}>
            <b style={{ color: "rgba(255,255,255,0.9)" }}>Note:</b> Drivers on the platform operate as independent providers.
            We provide the technology, verification process, and payment tracking to support the marketplace.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="container">
          <div className="footerGrid">
            <div>
              <b style={{ color: "rgba(255,255,255,0.9)" }}>ADW PriorityExpress</b>
              <div style={{ marginTop: 6 }}>Driver network • Verified independent drivers</div>
            </div>

            <div className="smallLinks">
              <Link href="/">Home</Link>
              <Link href="/drivers">Drivers</Link>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Apply</Link>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            © {new Date().getFullYear()} ADW PriorityExpress. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}
