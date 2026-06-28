'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LockKeyhole, LogIn, ShieldCheck, Zap } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login gagal');

      const next = searchParams.get('next') || '/kasir';
      router.replace(next.startsWith('/') ? next : '/kasir');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel card">
        <div className="login-brand">
          <span className="login-logo"><Zap size={22} /></span>
          <div>
            <p>PASUNDAN POS</p>
            <h1>Masuk Aplikasi</h1>
          </div>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>
            <span>Password</span>
            <div className="login-input-wrap">
              <LockKeyhole size={17} />
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoFocus
                required
              />
            </div>
          </label>

          <button className="btn btn-primary" disabled={loading || !password}>
            {loading ? 'Memeriksa...' : <><LogIn size={16} /> Login Sekali</>}
          </button>
        </form>

        {message && <div className="login-alert"><ShieldCheck size={16} />{message}</div>}
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
