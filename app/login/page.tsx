"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowser } from "../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Sign in</h1>
      <p className="mt-1 text-sm text-zinc-500">
        New here?{" "}
        <Link href="/signup" className="font-medium text-emerald-700 underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div>
          <label className="text-xs font-medium text-zinc-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-300"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <Link
        href="/"
        className="mt-4 text-center text-xs text-zinc-500 hover:text-zinc-700"
      >
        ← Back to bookings
      </Link>
    </div>
  );
}
