"use client";

import { SyntheticEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/");
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Can't reach the server. Check that Django is running.");
      } else {
        setError(err instanceof Error ? err.message : "Could not sign in. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-[var(--color-steel)] " +
    "focus:outline-none focus:border-[var(--color-steel)] focus:ring-2 focus:ring-[var(--color-yellow)]";

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      {/* Brand panel */}
      <section className="bg-[var(--color-steel)] text-white p-8 md:p-12 flex flex-col justify-between gap-10">
        <p className="font-display text-2xl font-semibold">Heavy Machinery Rental</p>

        <div>
          <p className="font-display text-5xl md:text-7xl font-bold leading-[0.95]">
            Book the machine.
            <br />
            Start the job.
          </p>
          <p className="mt-5 max-w-sm text-slate-300">
            Check availability, choose your dates and send a booking request.
          </p>
        </div>

        <div className="hazard-stripe h-3 rounded-sm" aria-hidden="true" />
      </section>

      {/* Form */}
      <section className="flex items-center justify-center p-6 md:p-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-lg border border-slate-200 bg-[var(--color-paper)] p-7"
        >
          <h1 className="font-display text-3xl font-bold">Sign in</h1>

          <label htmlFor="username" className="mt-6 block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />

          <label htmlFor="password" className="mt-4 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />

          {error && (
            <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-[var(--color-yellow)] px-4 py-2.5 font-semibold text-[var(--color-steel)] hover:bg-[var(--color-yellow-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-steel)] focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-5 text-sm text-[var(--color-steel-soft)]">
            <Link href="/" className="underline underline-offset-2 hover:text-[var(--color-steel)]">
              Browse machinery without an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}