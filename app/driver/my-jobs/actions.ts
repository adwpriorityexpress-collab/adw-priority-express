"use server";

import { redirect } from "next/navigation";
import { requireDriver } from "@/app/lib/requireDriver";

function enc(msg: string) {
  return encodeURIComponent(msg);
}

export async function startJobAction(formData: FormData) {
  const jobId = String(formData.get("jobId") || "").trim();
  if (!jobId) redirect("/driver/my-jobs?err=" + enc("Missing job id"));

  const { supabase, userId } = await requireDriver();

  // Extra safety: only update jobs assigned to this driver
  const { error } = await supabase
    .from("jobs")
    .update({ status: "in_transit" })
    .eq("id", jobId)
    .eq("assigned_driver_id", userId)
    .eq("status", "assigned");

  if (error) {
    redirect("/driver/my-jobs?err=" + enc(error.message));
  }

  redirect("/driver/my-jobs?ok=" + enc("Job started"));
}

export async function deliveredJobAction(formData: FormData) {
  const jobId = String(formData.get("jobId") || "").trim();
  if (!jobId) redirect("/driver/my-jobs?err=" + enc("Missing job id"));

  const { supabase, userId } = await requireDriver();

  const { error } = await supabase
    .from("jobs")
    .update({ status: "delivered" })
    .eq("id", jobId)
    .eq("assigned_driver_id", userId)
    .eq("status", "in_transit");

  if (error) {
    redirect("/driver/my-jobs?err=" + enc(error.message));
  }

  redirect("/driver/my-jobs?ok=" + enc("Marked delivered"));
}
