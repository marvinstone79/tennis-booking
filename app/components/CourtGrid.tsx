"use client";

import { findBooking, formatHour, hoursInDay } from "../lib/slots";
import { COURTS, type Booking } from "../lib/types";
import SlotCell from "./SlotCell";

type Props = {
  date: string;
  bookings: Booking[];
  currentUserId: string | null;
  onBookSlot: (court: number, hour: number) => void;
  onCancelBooking: (id: string) => void;
};

export default function CourtGrid({
  date,
  bookings,
  currentUserId,
  onBookSlot,
  onCancelBooking,
}: Props) {
  const hours = hoursInDay();
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[80px_repeat(4,minmax(0,1fr))] gap-2">
          <div className="h-10" />
          {COURTS.map((c) => (
            <div
              key={c}
              className="flex h-10 items-center justify-center rounded-md bg-zinc-900 text-sm font-semibold text-white"
            >
              Court {c}
            </div>
          ))}

          {hours.map((h) => (
            <div key={h} className="contents">
              <div className="flex h-14 items-center justify-end pr-2 text-xs font-medium text-zinc-500">
                {formatHour(h)}
              </div>
              {COURTS.map((c) => {
                const b = findBooking(bookings, date, c, h);
                const isMine = !!b && !!currentUserId && b.userId === currentUserId;
                return (
                  <SlotCell
                    key={`${c}-${h}`}
                    booking={b}
                    isMine={isMine}
                    onBook={() => onBookSlot(c, h)}
                    onCancel={() => b && onCancelBooking(b.id)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
