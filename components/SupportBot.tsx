"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type FaqItem = {
  id: string;
  q: string;
  a: string;
  tags: string[];
  links?: { label: string; href: string }[];
};

type Msg = {
  id: string;
  from: "bot" | "user";
  text: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreMatch(query: string, item: FaqItem) {
  const q = norm(query);
  if (!q) return 0;

  const hay = norm(`${item.q} ${item.a} ${item.tags.join(" ")}`);
  let score = 0;

  if (hay.includes(q)) score += 6;

  const words = q.split(" ").filter(Boolean);
  for (const w of words) {
    if (w.length < 3) continue;
    if (hay.includes(w)) score += 1;
  }
  return score;
}

const FAQ: FaqItem[] = [
  {
    id: "how-post-job",
    q: "How do I book a courier?",
    a: "Create an account, post your pickup/drop-off details and vehicle type, then drivers will bid. You choose a bid and pay securely via Stripe.",
    tags: ["book", "customer", "job", "quote", "bids"],
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Create account", href: "/signup" },
    ],
  },
  {
    id: "bidding",
    q: "How does bidding work?",
    a: "Drivers place bids based on distance, timing, and vehicle type. You can compare bids and accept the one you prefer.",
    tags: ["bidding", "bids", "price", "choose driver"],
    links: [{ label: "How it works", href: "/how-it-works" }],
  },
  {
    id: "payments",
    q: "Is payment secure?",
    a: "Yes. Customer payments are processed via Stripe Checkout. You’ll see clear payment status on your job.",
    tags: ["stripe", "secure", "card", "payment"],
  },
  {
    id: "driver-apply",
    q: "How do I become a driver?",
    a: "Apply as a driver, complete onboarding, and once approved you can access the job board and start bidding.",
    tags: ["driver", "apply", "approved", "onboarding"],
    links: [{ label: "Driver page", href: "/drivers" }],
  },
  {
    id: "driver-paid",
    q: "When do drivers get paid?",
    a: "Driver payouts are scheduled (for example 30 days later) and processed automatically. The driver can see payout status clearly in-app.",
    tags: ["payout", "paid", "schedule", "earnings"],
  },
  {
    id: "contractors",
    q: "Are drivers employed by ADW PriorityExpress?",
    a: "No. Drivers are independent contractors who choose their own jobs and set bid prices.",
    tags: ["independent", "contractor", "employment"],
  },
  {
    id: "tracking",
    q: "Do you offer live tracking?",
    a: "Live tracking can be added (optional feature). For now, the platform uses clear status updates: bidding → assigned → in transit → delivered.",
    tags: ["tracking", "live tracking", "status"],
  },
];

const QUICK_TOPICS: Array<{ label: string; prompt: string }> = [
  { label: "Book a courier", prompt: "How do I book a courier?" },
  { label: "Payments", prompt: "Is payment secure?" },
  { label: "Driver help", prompt: "How do I become a driver?" },
  { label: "Payouts", prompt: "When do drivers get paid?" },
];

// Change this if you rename the file in /public
const ICON_SRC = "/adw-helper.png";

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70" />
    </div>
  );
}

export default function SupportBot() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [unreadPulse, setUnreadPulse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const savedOpen = localStorage.getItem("adw_support_open");
      const savedMsgs = localStorage.getItem("adw_support_msgs");

      if (savedOpen === "1") setOpen(true);

      if (savedMsgs) {
        const parsed = JSON.parse(savedMsgs) as Msg[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      } else {
        setMessages([
          {
            id: "m0",
            from: "bot",
            text: "Hi 👋 I’m ADW Helper. Ask a question or pick a topic below.",
          },
        ]);
      }
    } catch {
      setMessages([
        {
          id: "m0",
          from: "bot",
          text: "Hi 👋 I’m ADW Helper. Ask a question or pick a topic below.",
        },
      ]);
    }
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem("adw_support_open", open ? "1" : "0");
    } catch {}
  }, [open]);

  useEffect(() => {
    try {
      localStorage.setItem("adw_support_msgs", JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  // Scroll to bottom on new messages / open
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, isTyping]);

  // Small pulse to draw attention once
  useEffect(() => {
    const key = "adw_support_pulsed";
    try {
      const already = localStorage.getItem(key);
      if (already) return;
      const t = setTimeout(() => {
        setUnreadPulse(true);
        localStorage.setItem(key, "1");
        setTimeout(() => setUnreadPulse(false), 4000);
      }, 2500);
      return () => clearTimeout(t);
    } catch {}
  }, []);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return FAQ.slice(0, 4);
    return [...FAQ]
      .map((item) => ({ item, s: scoreMatch(q, item) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((x) => x.item);
  }, [query]);

  function answerFromFaq(userText: string) {
    const q = userText.trim();
    const ranked = [...FAQ]
      .map((item) => ({ item, s: scoreMatch(q, item) }))
      .sort((a, b) => b.s - a.s);

    const top = ranked[0];
    if (!top || top.s < 2) {
      return {
        text:
          "I can help with booking, bidding, payments, driver onboarding, and payouts. Try “How do I book?” or pick a topic below.",
        links: [
          { label: "How it works", href: "/how-it-works" },
          { label: "Driver page", href: "/drivers" },
        ],
      };
    }

    return {
      text: top.item.a,
      links: top.item.links ?? [],
    };
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Msg = { id: `u_${Date.now()}`, from: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);

    const { text: botText, links } = answerFromFaq(trimmed);

    // show typing indicator
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Msg = { id: `b_${Date.now() + 1}`, from: "bot", text: botText };

      setMessages((m) => {
        const next = [...m, botMsg];

        if (links && links.length) {
          next.push({
            id: `b_links_${Date.now() + 2}`,
            from: "bot",
            text: `Helpful links: ${links.map((l) => l.label).join(" • ")}`,
          });
        }

        return next;
      });

      setIsTyping(false);
    }, 450);
  }

  function reset() {
    setQuery("");
    setIsTyping(false);
    setMessages([
      { id: "m0", from: "bot", text: "Hi 👋 I’m ADW Helper. Ask a question or pick a topic below." },
    ]);
    try {
      localStorage.removeItem("adw_support_msgs");
    } catch {}
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cx(
            "group relative flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-lg backdrop-blur",
            "hover:bg-white/[0.14]"
          )}
          aria-label="Open help"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 overflow-hidden">
            <img src={ICON_SRC} alt="ADW Helper" className="h-9 w-9 object-contain" />
          </span>
          <span className="text-sm font-semibold text-white">Help & FAQ</span>

          {unreadPulse && (
            <span className="absolute -top-1 -right-1 inline-flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-40" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white/70" />
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="w-[340px] overflow-hidden rounded-3xl border border-white/15 bg-[#0b0f17]/95 shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 overflow-hidden">
                <img src={ICON_SRC} alt="ADW Helper" className="h-9 w-9 object-contain" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">ADW Helper</div>
                <div className="text-xs text-white/60">Powered by ADW Exchange</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="border-b border-white/10 px-4 py-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help… (e.g. payments, bids, driver)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => send(t.prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="max-h-[260px] space-y-3 overflow-auto px-4 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cx("w-full", m.from === "user" ? "flex justify-end" : "flex justify-start")}
              >
                <div
                  className={cx(
                    "max-w-[85%] rounded-2xl border px-3 py-2 text-sm leading-6",
                    m.from === "user"
                      ? "border-white/10 bg-white/10 text-white"
                      : "border-white/10 bg-white/[0.04] text-white/85"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator bubble */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/85">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* FAQ results */}
          <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3">
            <div className="text-xs font-semibold text-white/70">Suggested FAQs</div>
            <div className="mt-2 space-y-2">
              {results.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => send(f.q)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  {f.q}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                href="/how-it-works"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                How it works
              </Link>
              <Link
                href="/drivers"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                Drivers
              </Link>
            </div>

            <div className="mt-2 text-[11px] leading-5 text-white/55">
              Need more help? Check the pages above to get started quickly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

