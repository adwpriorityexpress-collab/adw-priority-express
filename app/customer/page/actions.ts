"use server";

import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/requireCustomer";


function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function b(v: FormDataEntryValue | null) {
  const t = s(v).toLowerCase();
  return t === "true" || t === "1" || t === "on" || t === "yes";
}

function n(v: FormDataEntryValue | null) {
  const t = s(v);
  if (!t) return null;
  const num = Number(t);
  return Number.isFinite(num) ? num : null;
}

export async function createJobAction(formData: FormData) {
  const pickup_postcode = s(formData.get("pickup_postcode"));
  const pickup_address = s(formData.get("pickup_address")) || null;

  const dropoff_postcode = s(formData.get("dropoff_postcode"));
  const dropoff_address = s(formData.get("dropoff_address")) || null;

  const vehicle_type = s(formData.get("vehicle_type")) || null;

  const pickup_date = s(formData.get("pickup_date")) || null; // yyyy-mm-dd
  const pickup_time_window = s(formData.get("pickup_time_window")) || null;

  const items = s(formData.get("items")) || null;
  const weight_kg = n(formData.get("weight_kg"));
  const fragile = b(formData.get("fragile"));
  const special_instructions = s(formData.get("special_instructions")) || null;

  // Basic validation
  if (!pickup_postcode || !dropoff_postcode) {
    redirect(
      `/customer/jobs/new?err=${encodeURIComponent(
        "Pickup and dropoff postcode are required."
      )}`
    );
  }

  const { supabase, user } = await requireCustomer();

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      customer_id: user.id,
      status: "bidding",
      payment_status: "unpaid",
      payout_status: "not_due",
      pickup_postcode,
      pickup_address,
      dropoff_postcode,
      dropoff_address,
      vehicle_type,
      pickup_date,
      pickup_time_window,
      items,
      weight_kg,
      fragile,
      special_instructions,
    })
    .select("id")
    .single();

  if (error || !job?.id) {
    redirect(
      `/customer/jobs/new?err=${encodeURIComponent(
        error?.message || "Failed to create job"
      )}`
    );
  }

  redirect(`/customer/jobs/${encodeURIComponent(job.id)}?created=1`);
}

export async function acceptBidAction(formData: FormData) {
  const jobId = s(formData.get("jobId"));
  const bidId = s(formData.get("bidId"));

  if (!jobId || !bidId) {
    redirect(
      `/customer/jobs/${encodeURIComponent(jobId)}?err=${encodeURIComponent(
        "Missing jobId or bidId"
      )}`
    );
  }

  const { supabase } = await requireCustomer();

  // Atomic SQL function
  const { error } = await supabase.rpc("accept_bid", {
    p_job_id: jobId,
    p_bid_id: bidId,
  });

  if (error) {
    redirect(
      `/customer/jobs/${encodeURIComponent(jobId)}?err=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(`/customer/jobs/${encodeURIComponent(jobId)}?accepted=1`);
}
