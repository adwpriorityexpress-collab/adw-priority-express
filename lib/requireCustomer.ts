// lib/requireCustomer.ts
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

type Role = "customer" | "driver" | "admin";

function normalizeRole(v: any): Role | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "customer" || s === "driver" || s === "admin") return s;
  return null;
}

export async function requireCustomer() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent("/customer")}`);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", user.id)
    .single();

  if (error || !profile) redirect(`/login?next=${encodeURIComponent("/customer")}`);

  const role = normalizeRole(profile.role);

  if (role !== "customer") {
    // If they're not a customer, send them to the dashboard router
    redirect("/app");
  }

  return { supabase, user, profile };
}

