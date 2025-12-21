"use server";

import { redirect } from "next/navigation";
import { requireCustomer } from "../../../lib/requireCustomer";

export async function acceptBidAction(formData: FormData) {
  const jobId = String(formData.get("jobId") || "").trim();
  const bidId = String(formData.get("bidId") || "").trim();

  if (!jobId || !bidId) {
    redirect(`/customer/jobs/${encodeURIComponent(jobId)}?err=${encodeURIComponent("Missing jobId or bidId")}`);
  }

  const { supabase } = await requireCustomer();

  // Call the atomic SQL function
  const { error } = await supabase.rpc("accept_bid", {
    p_job_id: jobId,
    p_bid_id: bidId,
  });

  if (error) {
    redirect(`/customer/jobs/${encodeURIComponent(jobId)}?err=${encodeURIComponent(error.message)}`);
  }

  redirect(`/customer/jobs/${encodeURIComponent(jobId)}?accepted=1`);
}
