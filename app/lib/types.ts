export type Booking = {
  id: string;
  userId: string | null;
  court: number;
  date: string;
  startHour: number;
  name: string;
  note?: string;
  createdAt: string;
};

export const COURTS = [1, 2, 3, 4] as const;
export const START_HOUR = 7;
export const END_HOUR = 21;
export const BOOKING_WINDOW_DAYS = 14;
