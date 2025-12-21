"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";



function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function isEmail(v: string) {
  const s = v.trim();
  return s.includes("@") && s.includes(".");
}

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return isEmail(email) && password.trim().length >= 6 && !submitting;
  }, [email, password, submitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!isEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.trim().length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    try {
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || "Login failed. Please try again.");
        setSubmitting(false);
        return;
      }

      if (!data.user) {
        setErrorMsg("Login failed. Please try again.");
        setSubmitting(false);
        return;
      }

      // OPTIONAL: remember me control (simple + explicit)
      // Supabase persists session by default in browser storage.
      // If user unticks remember, we sign out when tab closes isn't trivial without custom storage.
      // For now, we keep it UI-only but you can wire a custom storage later.
      // (We keep explicit behaviour and avoid hidden magic.)

      // Fetch profile to route correctly
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role, approved")
        .eq("id", data.user.id)
        .single();

      if (profileErr || !profile) {
        // If something is wrong with profiles row, send to customer by default
        router.push("/customer");
        router.refresh();
        return;
      }

      if (profile.role === "driver") {
        if (!profile.approved) {
          router.push("/driver/pending");
        } else {
          router.push("/driver/jobs");
        }
      } else {
        router.push("/customer");
      }

      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {errorMsg && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/70">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/70">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-white/65">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/10"
          />
          Remember me
        </label>

        <button
          type="button"
          className="text-xs font-semibold text-white/65 hover:text-white"
          onClick={() => setErrorMsg("Password reset can be added next (Supabase reset email).")}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={cx(
          "w-full rounded-xl px-4 py-3 text-sm font-semibold",
          canSubmit
            ? "bg-white text-black hover:bg-white/90"
            : "cursor-not-allowed bg-white/20 text-white/50"
        )}
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>

      <div className="text-center text-xs text-white/55">
        Don’t have an account?{" "}
        <Link href="/signup" className="font-semibold text-white/80 hover:text-white">
          Create one
        </Link>
      </div>
    </form>
  );
}
