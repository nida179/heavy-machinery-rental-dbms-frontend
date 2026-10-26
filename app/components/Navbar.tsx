'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Machinery', href: '/' },
    { name: 'My Bookings', href: '/bookings' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header className="w-full border-b border-[var(--color-steel)]/30 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-wider text-white uppercase">
            Heavy<span style={{ color: 'var(--color-yellow)' }}>Rent</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[var(--color-yellow)] ${
                  isActive ? 'text-[var(--color-yellow)] underline underline-offset-4' : 'text-[var(--color-steel)]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Auth Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-bold tracking-wide uppercase text-neutral-900 transition-opacity hover:opacity-90 rounded"
            style={{ backgroundColor: 'var(--color-yellow)' }}
          >
            Sign In
          </Link>
        </div>

      </div>
    </header>
  );
}