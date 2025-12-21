"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Msg = { title: string; detail: string };

const MESSAGES: Msg[] = [
  { title: "New job posted", detail: "Small Van • Birmingham → Wolverhampton" },
  { title: "Bid received", detail: "Verified driver bid: £52 • Collection today" },
  { title: "Driver accepted", detail: "Job assigned • Tracking starts on pickup" },
  { title: "Payment confirmed", detail: "Stripe Checkout • Secure payment complete" },
];

const STORAGE_KEY = "adw_welcome_toast_dismissed_v1";

export default function ActivityToast() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (dismissed === "1") return;
    } catch {
      // ignore
    }

    const first = setTimeout(() => setOpen(true), 20000);

    const interval = setInterval(() => {
      setIdx((v) => (v + 1) % MESSAGES.length);
      setOpen(true);
    }, 120000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!open) return null;

  const msg = MESSAGES[idx];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[320px] max-w-[calc(100vw-2rem)]">
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="badge">Live activity</div>
            <div className="mt-2 font-black">{msg.title}</div>
            <div className="mt-1 text-brand-muted text-sm font-semibold leading-relaxed">
              {msg.detail}
            </div>
          </div>

          <button
            onClick={dismiss}
            className="btn-ghost"
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <Link className="btn-primary" href="/signup">
            Post a job
          </Link>
          <Link className="btn-secondary" href="/how-it-works">
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
}
