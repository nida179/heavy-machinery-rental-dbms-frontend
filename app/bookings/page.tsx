'use client';

import { useEffect, useState } from 'react';

interface Booking {
  id: number;
  machinery_name?: string;
  machinery?: { name: string } | number;
  start_date: string;
  end_date: string;
  status: string;
  created_at?: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/bookings/', {
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
          },
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error('Please sign in to view your bookings.');
          throw new Error('Failed to load bookings');
        }

        const data = await res.json();
        setBookings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const getMachineName = (b: Booking) => {
    if (b.machinery_name) return b.machinery_name;
    if (typeof b.machinery === 'object' && b.machinery !== null) return b.machinery.name;
    return `Machinery #${b.machinery || b.id}`;
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s === 'rejected') return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-amber-100 text-amber-800 border-amber-200'; // Default Pending
  };

  if (loading) return <div className="p-8 text-center text-[var(--color-steel)]">Loading your bookings...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div className="border-b border-[var(--color-steel)]/20 pb-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
          My Bookings
        </h1>
        <p className="text-sm text-[var(--color-steel)] mt-1">
          Track your machinery rental requests and approval status.
        </p>
      </div>

      {error ? (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
          ℹ️ {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-300 rounded-2xl bg-white space-y-3">
          <p className="text-[var(--color-steel)] font-medium">No booking requests submitted yet.</p>
          <a
            href="/"
            className="inline-block text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-yellow)', color: '#111' }}
          >
            Browse Machinery
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-5 border border-neutral-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-semibold text-neutral-900">
                    {getMachineName(b)}
                  </h2>
                  <p className="text-xs text-[var(--color-steel)] mt-1">Booking ID: #{b.id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusBadge(
                    b.status
                  )}`}
                >
                  {b.status}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-xs text-neutral-700">
                <div>
                  <span className="block text-[var(--color-steel)] font-medium">Start Date</span>
                  <span className="font-semibold text-neutral-900">{b.start_date}</span>
                </div>
                <div>
                  <span className="block text-[var(--color-steel)] font-medium">End Date</span>
                  <span className="font-semibold text-neutral-900">{b.end_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}