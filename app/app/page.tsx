// app/app/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

type Role = "customer" | "driver" | "admin";

function normalizeRole(v: any): Role | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "customer" || s === "driver" || s === "admin") return s;
  return null;
}

export default async function AppRouterPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → go login, then come back to /app
  if (!user) redirect("/login?next=/app");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", user.id)
    .single();

  // No profile → treat as logged out (or onboarding broken)
  if (!profile) redirect("/login?next=/app");

  const role = normalizeRole(profile.role);
  const approved = typeof profile.approved === "boolean" ? profile.approved : null;

  if (role === "customer") redirect("/customer");

  if (role === "driver") {
    if (approved === false) redirect("/driver/pending");
    redirect("/driver/jobs");
  }

  if (role === "admin") redirect("/admin");

  // Unknown role → send to welcome page (safe)
  redirect("/");
}
