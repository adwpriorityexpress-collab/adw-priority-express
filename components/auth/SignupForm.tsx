"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Role = "customer" | "driver";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function isEmail(v: string) {
  const s = v.trim();
  return s.includes("@") && s.includes(".");
}

export default function SignupForm() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMsg, setResentMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      isEmail(email) &&
      password.trim().length >= 6 &&
      !submitting
    );
  }, [fullName, email, password, submitting]);

  async function resendConfirmation() {
    setResentMsg(null);
    setErrorMsg(null);

    if (!isEmail(email)) {
      setErrorMsg("Enter a valid email above first.");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabaseBrowser.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) throw error;

      setResentMsg("Confirmation email resent. Please check your inbox (and spam/junk).");
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not resend confirmation email.");
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setNeedsEmailConfirm(false);
    setResentMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }
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
      // Profiles are created by your DB trigger on auth.users insert.
      const { data, error } = await supabaseBrowser.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role, // DB trigger reads raw_user_meta_data->>'role'
          },
        },
      });

      if (error) throw error;

      const user = data.user;
      const session = data.session;

      // If email confirmation is enabled, session will be null.
      if (!user || !session) {
        setNeedsEmailConfirm(true);
        setSuccessMsg("Account created. Please confirm your email address to continue.");

        // Send them to login with a banner (optional)
        router.push("/login?check=email");
        router.refresh();
        return;
      }

      // If session exists, we still route through /login so proxy.ts applies role/approval logic consistently.
      // This avoids edge cases where the trigger/profile isn't immediately visible.
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Sign up failed. Please try again.");
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

      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successMsg}
        </div>
      )}

      {/* If confirmation is required, show resend controls */}
      {needsEmailConfirm && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm font-semibold text-white">Check your email</div>
          <div className="mt-1 text-sm leading-6 text-white/70">
            We’ve sent a confirmation link to{" "}
            <span className="text-white/85">{email.trim() || "your email"}</span>. Click it
            to activate your account.
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={resendConfirmation}
              className={cx(
                "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10",
                resending && "opacity-70"
              )}
              disabled={resending}
            >
              {resending ? "Resending…" : "Resend email"}
            </button>

            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              Go to login
            </Link>
          </div>

          {resentMsg && <div className="mt-3 text-xs text-white/70">{resentMsg}</div>}

          <div className="mt-2 text-[11px] leading-5 text-white/45">
            Tip: Check spam/junk folders. Some providers delay messages by a few minutes.
          </div>
        </div>
      )}

      {/* Role toggle */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={cx(
              "rounded-xl px-3 py-2 text-sm font-semibold",
              role === "customer"
                ? "bg-white text-black"
                : "bg-white/5 text-white/80 hover:bg-white/10"
            )}
          >
            I’m a customer
          </button>

          <button
            type="button"
            onClick={() => setRole("driver")}
            className={cx(
              "rounded-xl px-3 py-2 text-sm font-semibold",
              role === "driver"
                ? "bg-white text-black"
                : "bg-white/5 text-white/80 hover:bg-white/10"
            )}
          >
            I’m a driver
          </button>
        </div>

        <div className="px-2 pb-1 pt-2 text-xs text-white/60">
          {role === "driver"
            ? "Drivers must be approved before bidding on jobs."
            : "Customers can post jobs and accept bids immediately."}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/70">Full name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
        />
      </div>

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
          placeholder="Create a password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
        />
        <div className="text-[11px] text-white/55">
          Minimum 6 characters. Use a unique password.
        </div>
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
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <div className="text-center text-xs text-white/55">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-white/80 hover:text-white">
          Sign in
        </Link>
      </div>

      <div className="text-center text-[11px] leading-5 text-white/45">
        By continuing, you agree to platform rules and acknowledge drivers operate as independent contractors.
      </div>
    </form>
  );
}
