// app/driver/jobs/[id]/BidBox.tsx
"use client";

import { useMemo, useState } from "react";

type Props = {
  jobId: string;
  isOpenForBids: boolean;
  existingBid?: {
    amount_gbp: number;
    note: string | null;
  } | null;
};

export default function BidBox(props: Props) {
  const initialAmount = useMemo(() => {
    if (props.existingBid?.amount_gbp != null) return String(props.existingBid.amount_gbp);
    return "";
  }, [props.existingBid?.amount_gbp]);

  const initialNote = useMemo(() => {
    return props.existingBid?.note ?? "";
  }, [props.existingBid?.note]);

  const [amount, setAmount] = useState(initialAmount);
  const [note, setNote] = useState(initialNote);

  function setQuick(v: number | null) {
    if (v === null) {
      setAmount("");
      return;
    }
    setAmount(String(v));
  }

  return (
    <div className="space-y-3">
      {/* Must exist for the server action */}
      <input type="hidden" name="jobId" value={props.jobId} />

      <div>
        <label className="mb-2 block text-sm text-zinc-300">Bid amount</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            £
          </span>
          <input
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 45"
            inputMode="decimal"
            className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-8 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-white/20"
            disabled={!props.isOpenForBids}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {[35, 45, 55, 65, 75].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setQuick(v)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-40"
              disabled={!props.isOpenForBids}
              title={`Set bid to £${v}`}
            >
              £{v}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setQuick(null)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-40"
            disabled={!props.isOpenForBids}
            title="Clear amount"
          >
            Clear
          </button>
        </div>

        <div className="mt-2 text-xs text-zinc-500">
          Tip: include parking/tolls if relevant, and be clear about ETA.
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300">Note (optional)</label>
        <textarea
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Example: Luton van, can collect within 60 mins. 2-man option available if needed."
          className="min-h-[110px] w-full resize-none rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-white/20"
          maxLength={500}
          disabled={!props.isOpenForBids}
        />
        <div className="mt-1 text-xs text-zinc-500">{note.length}/500</div>
      </div>

      <button
        type="submit"
        disabled={!props.isOpenForBids}
        className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {props.existingBid ? "Update bid" : "Place bid"}
      </button>
    </div>
  );
}
