'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getErrorMessage, readJsonResponse } from '@/lib/format';
import { CircleDollarSign, LockKeyhole, LogIn, ReceiptText, ShieldCheck, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await readJsonResponse<{ message?: string }>(res);
      if (!res.ok) throw new Error(data?.message || 'Login gagal');

      const next = searchParams.get('next') || '/kasir';
      router.replace(next.startsWith('/') ? next : '/kasir');
      router.refresh();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Login gagal'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-visual">
        <div>
          <span className="brand">
            <span className="brand-mark"><CircleDollarSign size={22} /></span>
            <span className="brand-copy">
              <strong>PASUNDAN POS</strong>
              <small>Premium Retail Suite</small>
            </span>
          </span>
          <h1>Kasir modern untuk operasional yang lebih rapi.</h1>
          <p>
            Dashboard POS beridentitas dark forest green, dibuat untuk transaksi cepat,
            pembukuan kas harian, dan monitoring usaha dari desktop sampai smartphone.
          </p>
        </div>

        <div className="login-device" aria-hidden="true">
          <div className="login-device-screen">
            {[0, 1, 2].map((item) => (
              <div className="login-device-row" key={item}>
                <span className="login-device-icon" />
                <span className="login-device-line" />
                <span className="login-device-price" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="login-panel-wrap">
        <div className="login-panel glass">
          <div className="login-brand">
            <span className="login-logo"><CircleDollarSign size={24} /></span>
            <div>
              <p>Welcome Back</p>
              <h1>Masuk Aplikasi</h1>
            </div>
          </div>

          <form onSubmit={submit} className="login-form">
            <label className="field">
              <span className="field-label"><LockKeyhole size={14} /> Password</span>
              <div className="input-shell">
                <span className="input-icon"><LockKeyhole size={17} /></span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  autoFocus
                  required
                />
              </div>
            </label>

            <button className="btn btn-primary" disabled={loading || !password}>
              {loading ? <span className="button-spinner spinner" /> : <LogIn size={17} />}
              {loading ? 'Memeriksa...' : 'Login Sekarang'}
            </button>
          </form>

          {message && (
            <div className="toast error" style={{ marginTop: 14 }}>
              <ShieldCheck size={17} />
              {message}
            </div>
          )}

          <div className="surface-card" style={{ marginTop: 18, padding: 14, boxShadow: 'none' }}>
            <div className="mobile-data-row">
              <span><Sparkles size={13} style={{ display: 'inline', marginRight: 5 }} /> Mode</span>
              <strong>Secure POS</strong>
            </div>
            <div className="mobile-data-row" style={{ marginTop: 10 }}>
              <span><ReceiptText size={13} style={{ display: 'inline', marginRight: 5 }} /> Akses</span>
              <strong>Kasir dan Buku Kas</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginLoading() {
  return (
    <main className="login-shell">
      <section className="login-visual">
        <div>
          <span className="brand">
            <span className="brand-mark"><CircleDollarSign size={22} /></span>
            <span className="brand-copy">
              <strong>PASUNDAN POS</strong>
              <small>Premium Retail Suite</small>
            </span>
          </span>
          <h1>Memuat halaman login.</h1>
          <p>Menyiapkan tampilan aplikasi kasir.</p>
        </div>
      </section>
      <section className="login-panel-wrap">
        <div className="login-panel glass">
          <div className="loading-state">
            <span className="spinner" />
            <strong>Memuat login</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
