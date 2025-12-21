"use client";

import { useRouter } from "next/navigation";

type Props = {
  label?: string;
};

export default function BackButton({ label = "Back" }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      style={{
        marginBottom: 16,
        padding: "8px 14px",
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "#f9f9f9",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      ← {label}
    </button>
  );
}
