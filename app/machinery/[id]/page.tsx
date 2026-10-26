'use client';

import { useEffect, useState, use } from 'react';

interface Machine {
  id: number;
  name: string;
  category: number | { name: string } | string;
  category_name?: string;
  hourly_rate?: string;
  daily_rate?: string;
  hourlyRate?: string;
  dailyRate?: string;
  status: string;
}

export default function MachineryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use() for Next.js App Router compatibility
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [machine, setMachine] = useState<Machine | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMachine() {
      if (!id) return;
      try {
        // Try fetching individual machine details
        let res = await fetch(`http://127.0.0.1:8000/api/machinery/${id}/`);
        
        // Fallback: if single detail endpoint isn't supported, fetch list and find by ID
        if (!res.ok) {
          const listRes = await fetch('http://127.0.0.1:8000/api/machinery/');
          if (!listRes.ok) throw new Error('Machine details could not be retrieved');
          const listData = await listRes.json();
          const found = listData.find((m: Machine) => String(m.id) === String(id));
          if (!found) throw new Error('Machine not found');
          setMachine(found);
          return;
        }

        const data = await res.json();
        setMachine(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMachine();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBookingLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }),
        },
        body: JSON.stringify({
          machinery: id,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.non_field_errors?.[0] || 'Booking conflict or invalid dates');
      }

      setSuccess('Booking request submitted successfully!');
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--color-steel)]">Loading machine details...</div>;
  if (error || !machine) return <div className="p-8 text-center text-red-500">{error || 'Machine not found.'}</div>;

  const hRate = machine.hourly_rate || machine.hourlyRate || '85.00';
  const dRate = machine.daily_rate || machine.dailyRate || '600.00';

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
      {/* Machine Info */}
      <div className="p-6 border border-neutral-200 rounded-2xl bg-white shadow-sm space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-emerald-100 text-emerald-800 rounded">
          {machine.status}
        </span>
        <h1 className="font-display text-3xl font-bold text-neutral-900">{machine.name}</h1>
        <p className="text-lg font-semibold text-neutral-800">
          Rs {hRate}/hr · Rs {dRate}/day
        </p>
      </div>

      {/* Booking Form */}
      <div className="p-6 border border-neutral-200 rounded-2xl bg-white shadow-sm space-y-6">
        <h2 className="font-display text-xl font-bold text-neutral-900">Book Machinery</h2>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-steel)] mb-1">
              Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-steel)]/40 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-yellow)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-steel)] mb-1">
              End Date
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-steel)]/40 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-yellow)]"
            />
          </div>

          <button
            type="submit"
            disabled={bookingLoading || machine.status !== 'Available'}
            className="w-full py-3 px-4 font-bold uppercase tracking-wider text-sm rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-yellow)', color: '#111' }}
          >
            {bookingLoading ? 'Submitting...' : 'Confirm Booking Request'}
          </button>
        </form>
      </div>
    </div>
  );
}