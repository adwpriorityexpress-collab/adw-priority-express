import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export async function requireDriver() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "driver") {
    redirect("/");
  }

  if (!profile.approved) {
    redirect("/driver/pending");
  }

  return {
    supabase,
    user,
    userId: user.id,
    profile,
  };
}
