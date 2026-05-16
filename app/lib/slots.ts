import { BOOKING_WINDOW_DAYS, END_HOUR, START_HOUR, type Booking } from "./types";

export function hoursInDay(): number[] {
  const out: number[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) out.push(h);
  return out;
}

export function formatHour(h: number): string {
  const period = h >= 12 ? "pm" : "am";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${period}`;
}

export function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatLongDate(iso: string): string {
  const d = parseISODate(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return formatDateISO(d);
}

export function todayISO(): string {
  return formatDateISO(new Date());
}

export function maxBookableISO(): string {
  return addDays(todayISO(), BOOKING_WINDOW_DAYS);
}

export function isBeforeToday(iso: string): boolean {
  return iso < todayISO();
}

export function isAfterWindow(iso: string): boolean {
  return iso > maxBookableISO();
}

export function findBooking(
  bookings: Booking[],
  date: string,
  court: number,
  hour: number,
): Booking | undefined {
  return bookings.find(
    (b) => b.date === date && b.court === court && b.startHour === hour,
  );
}

export function upcomingForUser(bookings: Booking[], userId: string): Booking[] {
  const today = todayISO();
  return bookings
    .filter((b) => b.userId === userId && b.date >= today)
    .sort((a, b) =>
      a.date === b.date ? a.startHour - b.startHour : a.date.localeCompare(b.date),
    );
}
