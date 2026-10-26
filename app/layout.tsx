import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar'; // Adjust path if components is outside app

export const metadata: Metadata = {
  title: 'Heavy Machinery Rental',
  description: 'Book construction and industrial heavy machinery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}