// app/driver/jobs/[id]/actions.ts
"use server";

import { redirect } from "next/navigation";
import { requireDriver } from "@/app/lib/requireDriver";

function cleanId(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function parseMoney(v: FormDataEntryValue | null) {
  const raw = String(v ?? "").trim().replace("£", "");
  const num = Number(raw);
  if (!Number.isFinite(num)) return null;
  // keep it sensible
  if (num <= 0) return null;
  return Math.round(num * 100) / 100;
}

export async function placeOrUpdateBidAction(formData: FormData) {
  const jobId = cleanId(formData.get("jobId"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  const amount = parseMoney(formData.get("amount"));

  if (!jobId) redirect(`/driver/jobs?err=${encodeURIComponent("Missing job id")}`);
  if (amount === null) redirect(`/driver/jobs/${encodeURIComponent(jobId)}?err=${encodeURIComponent("Enter a valid bid amount")}`);

  const { supabase, user, profile } = await requireDriver();

  if (profile?.approved === false) redirect("/driver/pending");

  // Optional: ensure job exists & is open to bids
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select("id,status")
    .eq("id", jobId)
    .single();

  if (jobErr || !job) redirect(`/driver/jobs?err=${encodeURIComponent("Job not found")}`);

  const status = String(job.status ?? "").toLowerCase();
  const allowed = ["open", "quote_requested", "bidding", "new"];
  if (!allowed.includes(status)) {
    redirect(`/driver/jobs/${encodeURIComponent(jobId)}?err=${encodeURIComponent("This job is not accepting bids")}`);
  }

  // If you already have a bid, update it; else insert a new one.
  const { data: existing } = await supabase
    .from("bids")
    .select("id")
    .eq("job_id", jobId)
    .eq("driver_id", user.id)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("bids")
      .update({
        amount_gbp: amount,
        note: note || null,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) redirect(`/driver/jobs/${encodeURIComponent(jobId)}?err=${encodeURIComponent(error.message)}`);
    redirect(`/driver/jobs/${encodeURIComponent(jobId)}?ok=${encodeURIComponent("Bid updated")}`);
  } else {
    const { error } = await supabase.from("bids").insert({
      job_id: jobId,
      driver_id: user.id,
      amount_gbp: amount,
      note: note || null,
      status: "active",
      created_at: new Date().toISOString(),
    });

    if (error) redirect(`/driver/jobs/${encodeURIComponent(jobId)}?err=${encodeURIComponent(error.message)}`);
    redirect(`/driver/jobs/${encodeURIComponent(jobId)}?ok=${encodeURIComponent("Bid placed")}`);
  }
}

export async function withdrawBidAction(formData: FormData) {
  const jobId = cleanId(formData.get("jobId"));
  if (!jobId) redirect(`/driver/jobs?err=${encodeURIComponent("Missing job id")}`);

  const { supabase, user, profile } = await requireDriver();
  if (profile?.approved === false) redirect("/driver/pending");

  // soft-withdraw (keeps history)
  const { error } = await supabase
    .from("bids")
    .update({
      status: "withdrawn",
      updated_at: new Date().toISOString(),
    })
    .eq("job_id", jobId)
    .eq("driver_id", user.id);

  if (error) redirect(`/driver/jobs/${encodeURIComponent(jobId)}?err=${encodeURIComponent(error.message)}`);
  redirect(`/driver/jobs/${encodeURIComponent(jobId)}?ok=${encodeURIComponent("Bid withdrawn")}`);
}
