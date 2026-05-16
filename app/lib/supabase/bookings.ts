"use client";

import type { Booking } from "../types";
import { createSupabaseBrowser } from "./client";
import type { DbBooking } from "./types";

function dbToBooking(row: DbBooking): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    court: row.court,
    date: row.date,
    startHour: row.start_hour,
    name: row.display_name,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

export async function fetchAllBookings(): Promise<Booking[]> {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("date", { ascending: true })
    .order("start_hour", { ascending: true });
  if (error) throw error;
  return (data as DbBooking[]).map(dbToBooking);
}

export async function createBooking(params: {
  court: number;
  date: string;
  startHour: number;
  note?: string;
}): Promise<Booking> {
  const supabase = createSupabaseBrowser();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("You must be signed in to book.");

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email ??
    "Unknown";

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      display_name: displayName,
      court: params.court,
      date: params.date,
      start_hour: params.startHour,
      note: params.note ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("That slot was just booked by someone else.");
    }
    throw error;
  }
  return dbToBooking(data as DbBooking);
}

export async function deleteBooking(id: string): Promise<void> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
}

export type BookingChange =
  | { type: "insert"; booking: Booking }
  | { type: "delete"; id: string }
  | { type: "update"; booking: Booking };

export function subscribeToBookings(
  onChange: (change: BookingChange) => void,
): () => void {
  const supabase = createSupabaseBrowser();
  const channel = supabase
    .channel("bookings-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookings" },
      (payload) => {
        if (payload.eventType === "INSERT") {
          onChange({
            type: "insert",
            booking: dbToBooking(payload.new as DbBooking),
          });
        } else if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string }).id;
          if (id) onChange({ type: "delete", id });
        } else if (payload.eventType === "UPDATE") {
          onChange({
            type: "update",
            booking: dbToBooking(payload.new as DbBooking),
          });
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
