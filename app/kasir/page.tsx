'use client';

import { useMemo, useState } from 'react';
import { rupiah } from '@/lib/format';

export default function KasirPage() {
  const [total, setTotal] = useState('');
  const [paid, setPaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const totalNumber = Number(total || 0);
  const paidNumber = Number(paid || 0);
  const change = useMemo(() => Math.max(paidNumber - totalNumber, 0), [paidNumber, totalNumber]);
  const kurang = paidNumber > 0 && paidNumber < totalNumber;

  async function submit() {
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: totalNumber, paidAmount: paidNumber, cashierName: 'Kasir' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan transaksi');
      setMessage('Pembayaran berhasil. Transaksi otomatis masuk ke Buku Kas sebagai Uang Masuk.');
      setTotal(''); setPaid('');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Terjadi error');
    } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.1fr_.9fr]">
      <section className="card p-6 md:p-8">
        <p className="font-bold text-green-700">Kasir Manual</p>
        <h1 className="mt-2 text-3xl font-black text-green-950">Input Harga & Kembalian Otomatis</h1>
        <div className="mt-8 space-y-5">
          <label className="block"><span className="mb-2 block font-bold">Total Penjualan</span><input className="input" type="number" min="0" value={total} onChange={(e)=>setTotal(e.target.value)} placeholder="Masukkan total belanja" /></label>
          <label className="block"><span className="mb-2 block font-bold">Uang Dibayar</span><input className="input" type="number" min="0" value={paid} onChange={(e)=>setPaid(e.target.value)} placeholder="Masukkan uang dari pembeli" /></label>
          {kurang && <p className="rounded-2xl bg-red-50 p-4 font-bold text-red-700">Uang pembeli kurang.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <button disabled={loading || kurang || totalNumber <= 0 || paidNumber <= 0} onClick={submit} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Menyimpan...' : 'Proses Pembayaran'}</button>
            <button onClick={()=>{setTotal('');setPaid('');setMessage('');}} className="btn btn-light">Reset</button>
          </div>
          {message && <p className="rounded-2xl bg-green-50 p-4 font-bold text-green-800">{message}</p>}
        </div>
      </section>
      <aside className="card p-6 md:p-8">
        <h2 className="text-xl font-black text-green-950">Ringkasan Pembayaran</h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm font-bold text-slate-500">Total Penjualan</p><p className="mt-1 text-3xl font-black">{rupiah(totalNumber)}</p></div>
          <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm font-bold text-slate-500">Uang Dibayar</p><p className="mt-1 text-3xl font-black">{rupiah(paidNumber)}</p></div>
          <div className="rounded-3xl bg-green-900 p-5 text-white"><p className="text-sm font-bold text-green-100">Kembalian</p><p className="mt-1 text-4xl font-black">{rupiah(change)}</p></div>
        </div>
      </aside>
    </main>
  );
}
