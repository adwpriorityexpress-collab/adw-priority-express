// app/driver/jobs/JobsAutoRefresh.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function JobsAutoRefresh({
  intervalMs = 10000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      setRefreshing(true);
      router.refresh();
      // tiny delay so the UI shows “refreshing”
      setTimeout(() => setRefreshing(false), 400);
    }, intervalMs);

    return () => clearInterval(id);
  }, [enabled, intervalMs, router]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setRefreshing(true);
          router.refresh();
          setTimeout(() => setRefreshing(false), 400);
        }}
        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
      >
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>

      <button
        type="button"
        onClick={() => setEnabled((v) => !v)}
        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        title="Toggle auto-refresh"
      >
        {enabled ? "Auto: On" : "Auto: Off"}
      </button>

      <span className="hidden text-xs text-zinc-500 sm:inline">
        Updates every {Math.round(intervalMs / 1000)}s
      </span>
    </div>
  );
}
