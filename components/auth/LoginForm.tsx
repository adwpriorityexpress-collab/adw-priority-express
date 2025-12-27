"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Props = {
  nextParam?: string;
};

function sanitizeNext(raw?: string | null) {
  const s = (raw || "").trim();

  // ✅ Default: send to dashboard router
  if (!s) return "/app";

  // ✅ Must be a relative internal path (prevents host switching to localhost/127/etc)
  if (!s.startsWith("/")) return "/app";
  if (s.startsWith("//")) return "/app";
  if (s.toLowerCase().startsWith("/\\") || s.toLowerCase().includes("http")) return "/app";

  // Prevent redirecting back to auth pages
  if (s.startsWith("/login") || s.startsWith("/signup")) return "/app";

  return s;
}

export default function LoginForm({ nextParam }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const resolvedNext = useMemo(() => {
    const fromQuery = sp?.get("next");
    return sanitizeNext(nextParam ?? fromQuery);
  }, [nextParam, sp]);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createBrowserClient(url, anon);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMsg(error.message);
        setLoading(false);
        return;
      }

      // ✅ Go to next (or /app by default), then refresh server components
      router.replace(resolvedNext);
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {msg ? (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {msg}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/70">Email</label>
        <input
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/70">Password</label>
        <input
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className="text-xs text-white/55">
        Tip: if you were sent here from a protected page, we’ll take you back automatically after login.
      </div>
    </form>
  );
}
