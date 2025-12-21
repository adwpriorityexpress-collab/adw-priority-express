"use client";

import { useRouter } from "next/navigation";

type Props = {
  label?: string;
  hrefFallback?: string;
};

export default function BackButton({ label = "Back", hrefFallback = "/app" }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        router.back();
        setTimeout(() => {
          try {
            router.push(hrefFallback);
          } catch {}
        }, 150);
      }}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #d6d6d6",
        background: "white",
        cursor: "pointer",
        fontSize: 14,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
      aria-label={label}
    >
      ← {label}
    </button>
  );
}
