'use client';

import { useEffect } from 'react';

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PASUNDAN POS] App Router segment error', error);
  }, [error]);

  return (
    <main className="app-fallback-screen">
      <section className="app-fallback-card">
        <p className="page-kicker">PASUNDAN POS</p>
        <h1>Halaman belum bisa dimuat</h1>
        <p>Koneksi atau komponen halaman mengalami masalah sementara.</p>
        <pre>{error.message || error.digest || 'Error tidak diketahui'}</pre>
        <div className="button-row">
          <button className="btn btn-primary" type="button" onClick={reset}>
            Coba Lagi
          </button>
          <a className="btn btn-secondary" href="/dashboard">
            Dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
