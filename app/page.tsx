'use client';

import { useEffect, useState } from 'react';

interface Machine {
  id: number;
  name: string;
  category: number | { id: number; name: string } | string;
  category_name?: string;
  hourly_rate: string;
  daily_rate: string;
  status: string;
}

export default function HomePage() {
  const [machinery, setMachinery] = useState<Machine[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMachinery() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/machinery/');
        if (!res.ok) throw new Error('Failed to fetch machinery');
        const data = await res.json();
        setMachinery(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMachinery();
  }, []);

  // Map category IDs or objects to readable names if category_name isn't provided directly
  const getCategoryLabel = (item: Machine): string => {
    if (item.category_name) return item.category_name;
    if (typeof item.category === 'object' && item.category !== null) return item.category.name;
    
    // Fallback category map if backend returns IDs (1 -> Bulldozers, 2 -> Excavators, etc.)
    const categoryMap: Record<string | number, string> = {
      1: 'Bulldozers',
      2: 'Excavators',
      3: 'Motor Graders',
      4: 'Loaders',
    };
    return categoryMap[item.category as keyof typeof categoryMap] || `Category ${item.category}`;
  };

  // Get unique category names for the dropdown
  const categories = [
    'All',
    ...Array.from(new Set(machinery.map((m) => getCategoryLabel(m)))),
  ];

  // Filter machinery based on selected label
  const filteredMachinery = selectedCategory === 'All'
    ? machinery
    : machinery.filter((item) => getCategoryLabel(item) === selectedCategory);

  if (loading) return <div className="p-8 text-center text-[var(--color-steel)]">Loading machinery...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-steel)]/20 pb-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
          Available Machinery
        </h1>

        <div className="flex items-center gap-2">
          <label htmlFor="category-select" className="text-sm font-medium text-[var(--color-steel)]">
            Filter by Category:
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-[var(--color-steel)] rounded-md text-sm font-medium text-neutral-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-yellow)] cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachinery.length === 0 ? (
          <p className="text-[var(--color-steel)] col-span-full text-center py-8">
            No machinery found in this category.
          </p>
        ) : (
          filteredMachinery.map((item) => (
            <div
              key={item.id}
              className="p-5 border border-neutral-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-neutral-900">{item.name}</h2>
                <p className="text-sm text-[var(--color-steel)] font-medium">{getCategoryLabel(item)}</p>
                <p className="mt-2 text-sm font-medium text-neutral-700">
                  Rs {item.hourly_rate || (item as any).hourlyRate || '0.00'}/hr · Rs {item.daily_rate || (item as any).dailyRate || '0.00'}/day
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'Rented'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>

                <a
                  href={`/machinery/${item.id}`}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'var(--color-yellow)', color: '#111' }}
                >
                  View Details
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}