'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Machinery = {
  machine_id: number;
  name: string;
  category_name: string;
  description?: string;
  rate_hourly: string;
  rate_daily: string;
  status: string;
};

export default function MachineryDetail() {
  const params = useParams();
  const { id } = params;

  const [machine, setMachine] = useState<Machinery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/machinery/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error('Machine not found');
        return res.json();
      })
      .then((data) => {
        setMachine(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <main style={{ padding: 40 }}>Loading...</main>;
  if (error || !machine) return <main style={{ padding: 40, color: 'red' }}>Error: {error}</main>;

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600 }}>
      <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>&larr; Back to all machinery</a>
      <h1 style={{ fontSize: 28, margin: '16px 0 8px' }}>{machine.name}</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>{machine.category_name}</p>
      {machine.description && (
        <p style={{ marginBottom: 16, lineHeight: 1.6 }}>{machine.description}</p>
      )}
      <p style={{ fontSize: 18, marginBottom: 8 }}>
        Rs {machine.rate_hourly}/hr &middot; Rs {machine.rate_daily}/day
      </p>
      <span
        style={{
          display: 'inline-block',
          marginBottom: 24,
          padding: '4px 10px',
          borderRadius: 12,
          fontSize: 13,
          background: machine.status === 'Available' ? '#d1fae5' : '#fee2e2',
          color: machine.status === 'Available' ? '#065f46' : '#991b1b',
        }}
      >
        {machine.status}
      </span>
      <div>
        <button
          style={{
            padding: '10px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          Book Now
        </button>
      </div>
    </main>
  );
}