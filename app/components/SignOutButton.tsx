"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #d6d6d6",
        background: "white",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      Sign out
    </button>
  );
}
