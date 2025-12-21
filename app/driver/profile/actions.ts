"use server";

import { redirect } from "next/navigation";
import { requireDriver } from "@/app/lib/requireDriver";

function enc(s: string) {
  return encodeURIComponent(s);
}

const ALLOWED = new Set(["small_van", "swb_van", "lwb_van", "luton_van", "7_5t", "car"]);

export async function updateVehicleTypeAction(formData: FormData) {
  const vehicle_type = String(formData.get("vehicle_type") || "").trim();
  if (!ALLOWED.has(vehicle_type)) redirect("/driver/profile?err=" + enc("Invalid vehicle type"));

  const { supabase, userId } = await requireDriver();

  const { error } = await supabase.from("profiles").update({ vehicle_type }).eq("id", userId);

  if (error) redirect("/driver/profile?err=" + enc(error.message));

  redirect("/driver/profile?ok=" + enc("Vehicle updated"));
}
