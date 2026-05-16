export type DbBooking = {
  id: string;
  user_id: string | null;
  display_name: string;
  court: number;
  date: string;
  start_hour: number;
  note: string | null;
  created_at: string;
};
