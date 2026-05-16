"use client";

import { formatHour, formatLongDate, upcomingForUser } from "../lib/slots";
import type { Booking } from "../lib/types";

type Props = {
  currentUserId: string | null;
  displayName: string | null;
  bookings: Booking[];
  onCancel: (id: string) => void;
};

export default function MyBookings({
  currentUserId,
  displayName,
  bookings,
  onCancel,
}: Props) {
  if (!currentUserId) {
    return (
      <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
        Sign in to book a court and see your upcoming bookings here.
      </div>
    );
  }

  const mine = upcomingForUser(bookings, currentUserId);

  return (
    <div className="rounded-md border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700">
        Upcoming bookings for{" "}
        <span className="text-emerald-700">{displayName ?? "you"}</span>
      </div>
      {mine.length === 0 ? (
        <div className="px-4 py-3 text-sm text-zinc-500">
          No upcoming bookings.
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {mine.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div>
                <div className="font-medium text-zinc-900">
                  Court {b.court} · {formatHour(b.startHour)}
                </div>
                <div className="text-xs text-zinc-500">
                  {formatLongDate(b.date)}
                  {b.note ? ` — ${b.note}` : ""}
                </div>
              </div>
              <button
                onClick={() => onCancel(b.id)}
                className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
