"use client";

import { useEffect, useRef, useState } from "react";
import { formatHour, formatLongDate } from "../lib/slots";

type Props = {
  open: boolean;
  date: string;
  court: number;
  hour: number;
  displayName: string;
  onConfirm: (note: string) => void;
  onClose: () => void;
};

export default function BookingDialog({
  open,
  date,
  court,
  hour,
  displayName,
  onConfirm,
  onClose,
}: Props) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNote("");
      setSubmitting(false);
      setTimeout(() => noteRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    onConfirm(note.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-zinc-900">Book this slot</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Court {court} · {formatHour(hour)} · {formatLongDate(date)}
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          Booking as <span className="font-medium text-zinc-900">{displayName}</span>
        </p>

        <label className="mt-3 block text-xs font-medium text-zinc-700">
          Note (optional)
        </label>
        <input
          ref={noteRef}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="e.g. doubles with Sam"
          maxLength={80}
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-300"
          >
            {submitting ? "Booking…" : "Confirm booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
