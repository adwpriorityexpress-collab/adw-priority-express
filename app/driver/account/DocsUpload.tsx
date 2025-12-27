"use client";

import { useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type DocRow = {
  id: string;
  doc_type: string;
  status: string;
  created_at: string;
  file_path: string;
};

function prettyType(t: string) {
  const s = (t || "").toLowerCase();
  if (s === "id") return "ID / Driving licence";
  if (s === "insurance") return "Insurance";
  if (s === "vehicle") return "Vehicle document";
  return "Other";
}

function pill(status: string) {
  const s = (status || "").toLowerCase();
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset";
  if (s.includes("verified")) return `${base} bg-emerald-500/10 text-emerald-200 ring-emerald-500/20`;
  if (s.includes("rejected")) return `${base} bg-rose-500/10 text-rose-200 ring-rose-500/20`;
  return `${base} bg-amber-500/10 text-amber-200 ring-amber-500/20`;
}

export default function DocsUpload({
  userId,
  docs,
}: {
  userId: string;
  docs: DocRow[];
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [docType, setDocType] = useState<"id" | "insurance" | "vehicle" | "other">("id");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file: File) {
    setErr("");
    setBusy(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `drivers/${userId}/${docType}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("driver-docs")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("driver_documents").insert({
        driver_id: userId,
        doc_type: docType,
        file_path: path,
        status: "uploaded",
      });

      if (insErr) throw insErr;

      window.location.reload();
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeDoc(id: string) {
    if (!confirm("Delete this document?")) return;
    setBusy(true);
    setErr("");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.from("driver_documents").delete().eq("id", id).eq("driver_id", userId);
      if (error) throw error;
      window.location.reload();
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm text-zinc-400">Verification</div>
          <div className="mt-1 text-base font-semibold">Upload documents</div>
          <div className="mt-1 text-sm text-zinc-400">
            Add ID, insurance, and vehicle docs to get verified faster.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none"
            disabled={busy}
          >
            <option value="id">ID</option>
            <option value="insurance">Insurance</option>
            <option value="vehicle">Vehicle doc</option>
            <option value="other">Other</option>
          </select>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.currentTarget.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
          >
            {busy ? "Working…" : "Upload doc"}
          </button>
        </div>
      </div>

      {err ? (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {err}
        </div>
      ) : null}

      <div className="mt-5">
        {docs.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-4 text-sm text-zinc-400">
            No documents uploaded yet.
          </div>
        ) : (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-zinc-900/20">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold">{prettyType(d.doc_type)}</div>
                    <span className={pill(d.status)}>{d.status}</span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Uploaded {new Date(d.created_at).toLocaleString("en-GB")}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeDoc(d.id)}
                  disabled={busy}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
