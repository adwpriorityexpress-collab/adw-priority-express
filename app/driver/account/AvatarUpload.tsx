"use client";

import { useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
}: {
  userId: string;
  currentAvatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  async function onPick(file: File) {
    setErr("");
    setBusy(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `drivers/${userId}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      // Save path to profiles
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ avatar_path: path })
        .eq("id", userId);

      if (profErr) throw profErr;

      // refresh UI
      window.location.reload();
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-400">Profile photo</div>
          <div className="mt-1 text-base font-semibold">Upload your picture</div>
          <div className="mt-1 text-sm text-zinc-400">
            Helps customers trust who’s arriving.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50">
            {currentAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                No photo
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.currentTarget.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

      {err ? (
        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {err}
        </div>
      ) : null}
    </div>
  );
}
