import { redirect } from "next/navigation";
import { createServerSupabase } from "@/app/lib/supabase/server";

export async function requireCustomer() {
  const supabase = await createServerSupabase();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, approved")
    .eq("id", auth.user.id)
    .single();

  if (error || !profile) redirect("/login");

  if (profile.role !== "customer") redirect("/");

  return { supabase, userId: auth.user.id, profile };
}
