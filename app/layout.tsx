import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'PASUNDAN POS', description: 'Kasir manual dan buku kas' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <nav className="sticky top-0 z-50 border-b border-green-900/10 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-black text-green-900">PASUNDAN POS</Link>
            <div className="flex gap-2 text-sm font-bold text-green-900">
              <Link className="rounded-xl px-3 py-2 hover:bg-green-50" href="/dashboard">Dashboard</Link>
              <Link className="rounded-xl px-3 py-2 hover:bg-green-50" href="/kasir">Kasir</Link>
              <Link className="rounded-xl px-3 py-2 hover:bg-green-50" href="/buku-kas">Buku Kas</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
