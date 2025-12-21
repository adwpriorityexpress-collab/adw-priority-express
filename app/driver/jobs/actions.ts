"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

function toMoney(value: FormDataEntryValue | null) {
  if (value === null) return null;
  const n = Number(String(value).trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

export async function placeBid(formData: FormData) {
  const jobId = String(formData.get("jobId") || "").trim();
  const amount = toMoney(formData.get("amount"));
  const note = String(formData.get("note") || "").trim() || null;

  if (!jobId || !amount) return { ok: false, error: "Enter a valid bid amount." };

  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("bids").insert({
    job_id: jobId,
    driver_id: auth.user.id,
    amount_gbp: amount,
    note,
    status: "pending",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/driver/jobs");
  return { ok: true };
}

export async function withdrawBid(formData: FormData) {
  const bidId = String(formData.get("bidId") || "").trim();
  if (!bidId) return { ok: false, error: "Missing bid id." };

  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("bids")
    .update({ status: "withdrawn" })
    .eq("id", bidId)
    .eq("driver_id", auth.user.id)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/driver/jobs");
  return { ok: true };
}
