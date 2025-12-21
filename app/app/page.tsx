import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function AppRouterPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  if (profile.role === "customer") {
    redirect("/customer");
  }

  if (profile.role === "driver") {
    if (!profile.approved) redirect("/driver/pending");
    redirect("/driver/jobs");
  }

  redirect("/login");
}
