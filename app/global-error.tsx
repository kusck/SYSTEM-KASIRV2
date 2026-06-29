'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PASUNDAN POS] Global render error', error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <main className="app-fallback-screen">
          <section className="app-fallback-card">
            <p className="page-kicker">PASUNDAN POS</p>
            <h1>Aplikasi perlu dimuat ulang</h1>
            <p>Terjadi error pada root aplikasi. Data tidak diubah.</p>
            <pre>{error.message || error.digest || 'Error tidak diketahui'}</pre>
            <div className="button-row">
              <button className="btn btn-primary" type="button" onClick={reset}>
                Coba Lagi
              </button>
              <a className="btn btn-secondary" href="/login">
                Login
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
