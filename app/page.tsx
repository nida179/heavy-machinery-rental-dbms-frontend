'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Machinery = {
    rate_daily: any;
    machine_id: number;
    name: string;
    category_name: string;
    rate_hourly: string;
    status: string;
};

export default function Home() {
    const router = useRouter();

    const [machinery, setMachinery] = useState<Machinery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/machinery/')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch machinery');
                }
                return res.json();
            })
            .then((data) => {
                console.log('Machinery received: ', data);
                setMachinery(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <main style={{ padding: 40 }}>
                Loading Machinery...
            </main>
        );
    }

    if (error) {
        return (
            <main style={{ padding: 40, color: 'red' }}>
                Error: {error}
            </main>
        );
    }

    return (
        <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: 28, marginBottom: 24 }}>
                Available Machinery
            </h1>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: 20,
                }}
            >
                {machinery.map((m) => (
                    <div
                        key={m.machine_id}
                        onClick={() =>
                            router.push(`/machinery/${m.machine_id}`)
                        }
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: 8,
                            padding: 16,
                            boxShadow:
                                '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                        }}
                    >
                        <h2
                            style={{
                                fontSize: 18,
                                marginBottom: 8,
                            }}
                        >
                            {m.name}
                        </h2>

                        <p
                            style={{
                                color: '#666',
                                marginBottom: 4,
                            }}
                        >
                            {m.category_name}
                        </p>

                        <p style={{ marginBottom: 4 }}>
                            Rs {m.rate_hourly}/hr &middot; Rs{' '}
                            {m.rate_daily}/day
                        </p>

                        <span
                            style={{
                                display: 'inline-block',
                                marginTop: 8,
                                padding: '4px 10px',
                                borderRadius: 12,
                                fontSize: 12,
                                background:
                                    m.status === 'Available'
                                        ? '#d1fae5'
                                        : '#fee2e2',
                                color:
                                    m.status === 'Available'
                                        ? '#065f46'
                                        : '#991b1b',
                            }}
                        >
                            {m.status}
                        </span>
                    </div>
                ))}
            </div>
        </main>
    );
}