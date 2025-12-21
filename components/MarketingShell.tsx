import Link from "next/link";
import Image from "next/image";

export default function MarketingShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: "welcome" | "how" | "drivers";
}) {
  return (
    <div className="app-shell">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-brand-border bg-brand-black/60 backdrop-blur">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* Logo in a box */}
            <div className="h-11 w-11 rounded-xl border border-brand-border bg-brand-surface2 flex items-center justify-center shadow-soft">
              <Image
                src="/adw-priorityexpress-logo.png"
                alt="ADW PriorityExpress"
                width={120}
                height={40}
                priority
                className="h-7 w-auto object-contain"
              />
            </div>

            <div className="leading-tight">
              <div className="font-black tracking-tight">ADW PriorityExpress</div>
              <div className="text-brand-muted text-xs font-semibold">
                Verified same-day courier marketplace
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-extrabold text-brand-muted">
            <Link
              href="/"
              className={`hover:text-brand-text ${
                active === "welcome" ? "text-brand-text" : ""
              }`}
            >
              Welcome
            </Link>
            <Link
              href="/how-it-works"
              className={`hover:text-brand-text ${
                active === "how" ? "text-brand-text" : ""
              }`}
            >
              How it works
            </Link>
            <Link
              href="/drivers"
              className={`hover:text-brand-text ${
                active === "drivers" ? "text-brand-text" : ""
              }`}
            >
              Drivers
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link className="btn-ghost hidden sm:inline-flex" href="/login">
              Login
            </Link>
            <Link className="btn-secondary hidden sm:inline-flex" href="/drivers">
              Apply to drive
            </Link>
            <Link className="btn-primary" href="/signup">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-brand-border mt-16">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl border border-brand-border bg-brand-surface2 flex items-center justify-center shadow-soft">
                  <Image
                    src="/adw-priorityexpress-logo.png"
                    alt="ADW PriorityExpress"
                    width={120}
                    height={40}
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <div className="leading-tight">
                  <div className="font-black tracking-tight">ADW PriorityExpress</div>
                  <div className="text-brand-muted text-xs font-semibold">
                    Verified same-day courier marketplace
                  </div>
                </div>
              </div>

              <div className="text-brand-muted text-sm font-semibold mt-4 leading-relaxed">
                Marketplace technology for same-day courier work — verified drivers, secure payments,
                and tracking.
              </div>

              <div className="mt-2 text-xs font-semibold text-brand-muted">
                Powered by <span className="text-brand-text">ADW Exchange</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 text-sm font-extrabold text-brand-muted">
              <Link className="hover:text-brand-text" href="/">
                Welcome
              </Link>
              <Link className="hover:text-brand-text" href="/how-it-works">
                How it works
              </Link>
              <Link className="hover:text-brand-text" href="/drivers">
                Drivers
              </Link>
              <Link className="hover:text-brand-text" href="/login">
                Login
              </Link>
            </div>
          </div>

          <div className="text-brand-muted text-xs font-semibold mt-6">
            © {new Date().getFullYear()} ADW PriorityExpress • Payments powered by Stripe • Drivers are
            independent contractors.
          </div>
        </div>
      </footer>
    </div>
  );
}

