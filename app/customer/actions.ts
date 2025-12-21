"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

function requiredStr(value: FormDataEntryValue | null, field: string) {
  const v = (value ?? "").toString().trim();
  if (!v) throw new Error(`${field} is required`);
  return v;
}

function optionalStr(value: FormDataEntryValue | null) {
  const v = (value ?? "").toString().trim();
  return v ? v : null;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const raw = (value ?? "").toString().trim();
  if (!raw) return null;
  const num = Number(raw);
  if (Number.isNaN(num)) return null;
  return num;
}

// Accept either slugs OR friendly labels and normalize to DB-safe slugs
function normalizeVehicleType(input: string) {
  const v = input.trim();

  const map: Record<string, string> = {
    // Friendly labels (old UI)
    "Small Van": "small_van",
    "SWB Van": "swb_van",
    "LWB Van": "lwb_van",
    "Luton Van": "luton_van",
    "7.5T": "7_5t",
    "Car": "car",

    // Slugs (new UI)
    small_van: "small_van",
    swb_van: "swb_van",
    lwb_van: "lwb_van",
    luton_van: "luton_van",
    "7_5t": "7_5t",
    car: "car",
  };

  return map[v] ?? v.toLowerCase().replace(/\s+/g, "_"); // last-resort
}

export async function createJobAction(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const pickup_postcode = requiredStr(formData.get("pickup_postcode"), "Pickup postcode");
  const dropoff_postcode = requiredStr(formData.get("dropoff_postcode"), "Dropoff postcode");
  const vehicle_type_raw = requiredStr(formData.get("vehicle_type"), "Vehicle type");
  const vehicle_type = normalizeVehicleType(vehicle_type_raw);

  const pickup_date = requiredStr(formData.get("pickup_date"), "Pickup date");
  const pickup_time_window = optionalStr(formData.get("pickup_time_window"));

  const items = requiredStr(formData.get("items"), "Items");
  const weight_kg = optionalNumber(formData.get("weight_kg"));
  const fragile = formData.get("fragile") === "on";
  const special_instructions = optionalStr(formData.get("special_instructions"));

  const pickup_address = optionalStr(formData.get("pickup_address"));
  const dropoff_address = optionalStr(formData.get("dropoff_address"));

  const { error } = await supabase.from("jobs").insert({
    customer_id: user.id,
    status: "bidding",
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
  });

  if (error) {
    redirect(`/customer?err=${encodeURIComponent(error.message)}`);
  }

  redirect("/customer?created=1");
}


