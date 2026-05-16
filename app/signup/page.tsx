"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowser } from "../lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    const supabase = createSupabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    // If email confirmation is disabled in Supabase, signUp returns a session
    // and we can go straight to the app. Otherwise, show a "check your email" message.
    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }

    setInfo("Check your email for a confirmation link to finish signing up.");
    setSubmitting(false);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Create your account</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Already have one?{" "}
        <Link href="/login" className="font-medium text-emerald-700 underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div>
          <label className="text-xs font-medium text-zinc-700">
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={60}
            placeholder="e.g. Marvin Stone"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
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
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <p className="mt-1 text-[10px] text-zinc-500">At least 6 characters.</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-300"
        >
          {submitting ? "Creating…" : "Create account"}
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
