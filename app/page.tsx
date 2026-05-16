"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthHeader from "./components/AuthHeader";
import BookingDialog from "./components/BookingDialog";
import CourtGrid from "./components/CourtGrid";
import DayNavigator from "./components/DayNavigator";
import MyBookings from "./components/MyBookings";
import { findBooking, todayISO } from "./lib/slots";
import { createSupabaseBrowser } from "./lib/supabase/client";
import {
  createBooking,
  deleteBooking,
  fetchAllBookings,
  subscribeToBookings,
} from "./lib/supabase/bookings";
import type { Booking } from "./lib/types";

type DialogTarget = { court: number; hour: number } | null;

export default function Home() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowser(), []);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<string>(() => todayISO());
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load + auth subscription
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ data: userData }, bookingsData] = await Promise.all([
          supabase.auth.getUser(),
          fetchAllBookings(),
        ]);
        if (!active) return;
        setUser(userData.user);
        setBookings(bookingsData);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load bookings.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const unsubscribeBookings = subscribeToBookings((change) => {
      setBookings((prev) => {
        if (change.type === "insert") {
          if (prev.some((b) => b.id === change.booking.id)) return prev;
          return [...prev, change.booking];
        }
        if (change.type === "delete") {
          return prev.filter((b) => b.id !== change.id);
        }
        if (change.type === "update") {
          return prev.map((b) =>
            b.id === change.booking.id ? change.booking : b,
          );
        }
        return prev;
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      unsubscribeBookings();
    };
  }, [supabase]);

  const dialogOpen = dialogTarget !== null;
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email ??
    null;

  const dayBookings = useMemo(
    () => bookings.filter((b) => b.date === date),
    [bookings, date],
  );

  function handleBookSlot(court: number, hour: number) {
    setError(null);
    if (!user) {
      router.push("/login");
      return;
    }
    if (findBooking(bookings, date, court, hour)) return;
    setDialogTarget({ court, hour });
  }

  async function handleConfirmBooking(note: string) {
    if (!dialogTarget) return;
    const { court, hour } = dialogTarget;
    setError(null);
    try {
      const created = await createBooking({
        court,
        date,
        startHour: hour,
        note: note || undefined,
      });
      setBookings((prev) => [...prev, created]);
      setDialogTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed.");
      setDialogTarget(null);
      // Refetch to reconcile (e.g. duplicate slot)
      try {
        setBookings(await fetchAllBookings());
      } catch {}
    }
  }

  async function handleCancelBooking(id: string) {
    const target = bookings.find((b) => b.id === id);
    if (!target) return;
    if (!user || target.userId !== user.id) return;
    const confirmed = window.confirm(
      `Cancel your booking on Court ${target.court}?`,
    );
    if (!confirmed) return;
    setError(null);
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tennis Court Booking</h1>
            <p className="text-xs text-zinc-500">
              Book a court at your local club
            </p>
          </div>
          <AuthHeader />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <DayNavigator date={date} onChange={setDate} />

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-md border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Loading…
          </div>
        ) : (
          <CourtGrid
            date={date}
            bookings={dayBookings}
            currentUserId={user?.id ?? null}
            onBookSlot={handleBookSlot}
            onCancelBooking={handleCancelBooking}
          />
        )}

        <MyBookings
          currentUserId={user?.id ?? null}
          displayName={displayName}
          bookings={bookings}
          onCancel={handleCancelBooking}
        />
      </main>

      {dialogTarget && displayName && (
        <BookingDialog
          open={dialogOpen}
          date={date}
          court={dialogTarget.court}
          hour={dialogTarget.hour}
          displayName={displayName}
          onConfirm={handleConfirmBooking}
          onClose={() => setDialogTarget(null)}
        />
      )}
    </div>
  );
}
