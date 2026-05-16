"use client";

import { useEffect } from "react";
import {
  addDays,
  formatLongDate,
  isAfterWindow,
  isBeforeToday,
  maxBookableISO,
  todayISO,
} from "../lib/slots";

type Props = {
  date: string;
  onChange: (date: string) => void;
};

export default function DayNavigator({ date, onChange }: Props) {
  const today = todayISO();
  const max = maxBookableISO();
  const atStart = date <= today;
  const atEnd = date >= max;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && !atStart) {
        onChange(addDays(date, -1));
      } else if (e.key === "ArrowRight" && !atEnd) {
        onChange(addDays(date, 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [date, atStart, atEnd, onChange]);

  function handleJump(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (!v) return;
    if (isBeforeToday(v) || isAfterWindow(v)) return;
    onChange(v);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(addDays(date, -1))}
          disabled={atStart}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous day"
        >
          ← Prev
        </button>
        <button
          onClick={() => onChange(today)}
          disabled={date === today}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Today
        </button>
        <button
          onClick={() => onChange(addDays(date, 1))}
          disabled={atEnd}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next day"
        >
          Next →
        </button>
      </div>

      <div className="text-base font-semibold text-zinc-900 sm:text-lg">
        {formatLongDate(date)}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-500">Jump to</label>
        <input
          type="date"
          value={date}
          min={today}
          max={max}
          onChange={handleJump}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>
    </div>
  );
}
