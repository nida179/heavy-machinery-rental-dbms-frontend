"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, isLoggedIn, logout } from "@/lib/api";

type Booking = {
  booking_id: number;
  customer_name: string;
  machinery_name: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
};

type PageState = "loading" | "denied" | "ready" | "error";

// The API may return a plain list or a paginated { results: [...] } object.
function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const results = (data as { results?: T[] } | null)?.results;
  return results ?? [];
}

const money = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

function Stat({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <div
      className={`border-l-2 pl-4 ${
        alert ? "border-red-300" : "border-[var(--color-yellow)]"
      }`}
    >
      <dt className="text-sm text-slate-300">{label}</dt>
      <dd
        className={`font-display text-4xl font-bold ${alert ? "text-red-300" : "text-white"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function BookingTable({
  rows,
  busyId,
  onAction,
}: {
  rows: Booking[];
  busyId?: number | null;
  onAction?: (id: number, action: "approve" | "reject") => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-[var(--color-paper)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 text-[var(--color-steel-soft)]">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Booking</th>
            <th scope="col" className="px-4 py-3 font-medium">Customer</th>
            <th scope="col" className="px-4 py-3 font-medium">Machine</th>
            <th scope="col" className="px-4 py-3 font-medium">Start</th>
            <th scope="col" className="px-4 py-3 font-medium">End</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            {onAction && <th scope="col" className="px-4 py-3 font-medium">Decision</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.booking_id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3">#{b.booking_id}</td>
              <td className="px-4 py-3">{b.customer_name}</td>
              <td className="px-4 py-3">{b.machinery_name}</td>
              <td className="px-4 py-3">{when(b.start_datetime)}</td>
              <td className="px-4 py-3">{when(b.end_datetime)}</td>
              <td className="px-4 py-3">{b.status}</td>
              {onAction && (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAction(b.booking_id, "approve")}
                      disabled={busyId === b.booking_id}
                      className="rounded-md bg-[var(--color-yellow)] px-3 py-1.5 font-semibold text-[var(--color-steel)] hover:bg-[var(--color-yellow-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-steel)] disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onAction(b.booking_id, "reject")}
                      disabled={busyId === b.booking_id}
                      className="rounded-md border border-[var(--color-steel)] px-3 py-1.5 font-semibold hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-steel)] disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("loading");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [overdue, setOverdue] = useState<Booking[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [rev, over, all] = await Promise.all([
      apiFetch("/api/dashboard/revenue/"),
      apiFetch("/api/dashboard/overdue/"),
      apiFetch("/api/bookings/"),
    ]);
    if (!rev.ok || !over.ok || !all.ok) {
      throw new Error("Could not load the dashboard data.");
    }
    const revJson = await rev.json();
    setRevenue(Number(revJson.total_revenue ?? 0));
    setOverdue(asList<Booking>(await over.json()));
    setBookings(asList<Booking>(await all.json()));
  }, []);

  useEffect(() => {
    async function init() {
      if (!isLoggedIn()) {
        router.replace("/login");
        return;
      }
      try {
        const me = await apiFetch("/api/me/");
        if (!me.ok) throw new Error("Could not check your account.");
        const info = await me.json();
        if (!info.is_staff) {
          setState("denied");
          return;
        }
        await load();
        setState("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setState("error");
      }
    }
    init();
  }, [router, load]);

  async function decide(id: number, action: "approve" | "reject") {
    setBusyId(id);
    setError("");
    try {
      const res = await apiFetch(`/api/bookings/${id}/${action}/`, { method: "POST" });
      if (!res.ok) throw new Error(`Could not ${action} booking #${id}. Try again.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  if (state === "loading") {
    return <main className="p-8">Loading dashboard...</main>;
  }

  if (state === "denied") {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="font-display text-3xl font-bold">Admins only</h1>
        <p className="mt-2 text-[var(--color-steel-soft)]">
          This page is for the business owner. Sign in with an admin account to see it.
        </p>
        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/" className="underline underline-offset-2">
            Back to machinery
          </Link>
          <button onClick={logout} className="underline underline-offset-2">
            Sign out
          </button>
        </div>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="font-display text-3xl font-bold">Dashboard unavailable</h1>
        <p role="alert" className="mt-2 text-[var(--color-danger)]">
          {error}
        </p>
        <p className="mt-2 text-sm text-[var(--color-steel-soft)]">
          Check that Django is running, then reload the page.
        </p>
      </main>
    );
  }

  const pending = bookings.filter((b) => b.status === "Pending");
  const active = bookings.filter((b) => b.status === "Approved" || b.status === "Ongoing");

  return (
    <main className="min-h-screen">
      <header className="bg-[var(--color-steel)] px-6 py-8 text-white md:px-12">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-4xl font-bold">Admin dashboard</h1>
          <button
            onClick={logout}
            className="text-sm text-slate-300 underline underline-offset-2 hover:text-white"
          >
            Sign out
          </button>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          <Stat label="Total revenue" value={money(revenue)} />
          <Stat label="Pending requests" value={pending.length} />
          <Stat label="Active bookings" value={active.length} />
          <Stat label="Overdue returns" value={overdue.length} alert={overdue.length > 0} />
        </dl>
      </header>
      <div className="hazard-stripe h-2" aria-hidden="true" />

      <div className="space-y-10 px-6 py-8 md:px-12">
        {error && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <section>
          <h2 className="font-display mb-3 text-2xl font-semibold">Pending requests</h2>
          {pending.length === 0 ? (
            <p className="text-[var(--color-steel-soft)]">
              No pending requests. New bookings from customers will appear here.
            </p>
          ) : (
            <BookingTable rows={pending} busyId={busyId} onAction={decide} />
          )}
        </section>

        <section>
          <h2 className="font-display mb-3 text-2xl font-semibold">Overdue returns</h2>
          {overdue.length === 0 ? (
            <p className="text-[var(--color-steel-soft)]">Nothing is overdue.</p>
          ) : (
            <BookingTable rows={overdue} />
          )}
        </section>
      </div>
    </main>
  );
}