"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "../lib/supabase/client";

export default function AuthHeader() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  if (!ready) {
    return <div className="h-9" aria-hidden />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ?? user.email ?? "Account";

  return (
    <div className="flex items-center gap-3">
      <div className="text-right text-xs">
        <div className="text-[10px] uppercase tracking-wide text-zinc-400">
          Signed in as
        </div>
        <div className="font-medium text-zinc-900">{displayName}</div>
      </div>
      <button
        onClick={handleSignOut}
        className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Sign out
      </button>
    </div>
  );
}
