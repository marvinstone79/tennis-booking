"use client";

import type { Booking } from "../lib/types";

type Props = {
  booking: Booking | undefined;
  isMine: boolean;
  onBook: () => void;
  onCancel: () => void;
};

export default function SlotCell({ booking, isMine, onBook, onCancel }: Props) {
  if (!booking) {
    return (
      <button
        onClick={onBook}
        className="h-14 w-full rounded-md border border-dashed border-zinc-300 bg-white text-xs text-zinc-400 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
        aria-label="Book this slot"
      >
        + Book
      </button>
    );
  }

  if (isMine) {
    return (
      <button
        onClick={onCancel}
        className="h-14 w-full rounded-md border border-emerald-600 bg-emerald-600 px-2 text-left text-xs font-medium text-white transition hover:bg-emerald-700"
        title="Click to cancel"
      >
        <div className="truncate">{booking.name}</div>
        <div className="truncate text-[10px] font-normal opacity-80">
          {booking.note ? booking.note : "Click to cancel"}
        </div>
      </button>
    );
  }

  return (
    <div
      className="h-14 w-full rounded-md border border-zinc-200 bg-zinc-100 px-2 py-1 text-xs text-zinc-700"
      title={booking.note ?? ""}
    >
      <div className="truncate font-medium">{booking.name}</div>
      {booking.note && (
        <div className="truncate text-[10px] text-zinc-500">{booking.note}</div>
      )}
    </div>
  );
}
