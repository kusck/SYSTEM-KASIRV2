'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDate, getErrorMessage, readJsonResponse, rupiah } from '@/lib/format';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Clock,
  History,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

type DailyHistory = {
  id: string;
  resetDate: string;
  resetTime: string;
  resetAt: string;
  totalIncome: number;
  totalExpense: number;
  endingBalance: number;
  transactionCount: number;
  resetMode: string;
  createdBy: string;
};

export default function RiwayatBukuKasHarianPage() {
  const [items, setItems] = useState<DailyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/cashbook/history');
      const data = await readJsonResponse<DailyHistory[] | { message?: string }>(res);
      if (!res.ok) throw new Error(!Array.isArray(data) ? data?.message || 'Gagal memuat riwayat' : 'Gagal memuat riwayat');
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Gagal memuat riwayat'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        income: acc.income + item.totalIncome,
        expense: acc.expense + item.totalExpense,
        balance: acc.balance + item.endingBalance,
      }),
      { income: 0, expense: 0, balance: 0 },
    );
  }, [items]);

  async function manualReset() {
    const ok = window.confirm('Reset manual akan menyimpan buku kas aktif ke riwayat hari ini lalu mengosongkannya. Lanjutkan?');
    if (!ok) return;

    setResetting(true);
    setMessage('');
    try {
      const res = await fetch('/api/cashbook/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN',
        },
        body: JSON.stringify({ actor: 'Admin' }),
      });
      const data = await readJsonResponse<{ message?: string }>(res);
      if (!res.ok) throw new Error(data?.message || 'Reset manual gagal');
      setMessage(data?.message || 'Reset manual berhasil');
      await load();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Reset manual gagal'));
    } finally {
      setResetting(false);
    }
  }

  const isSuccess = message.toLowerCase().includes('berhasil');

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><BarChart3 size={14} /> Laporan</span>
          <h1>Riwayat buku kas harian</h1>
          <p>Arsip reset harian dengan ringkasan pemasukan, pengeluaran, saldo akhir, dan mode reset.</p>
        </div>
        <button className="btn btn-primary btn-mobile-full" onClick={manualReset} disabled={resetting}>
          {resetting ? <span className="button-spinner spinner" /> : <RefreshCw size={17} />}
          {resetting ? 'Mereset...' : 'Reset Manual'}
        </button>
      </div>

      {message && (
        <div className={`toast ${isSuccess ? 'success' : 'error'}`}>
          <ShieldCheck size={17} />
          {message}
        </div>
      )}

      <section className="summary-grid summary-scroll">
        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Total Pemasukan Arsip</p>
              <p className="stat-value" style={{ color: '#047857' }}>{rupiah(summary.income)}</p>
            </div>
            <span className="stat-icon"><ArrowUpRight size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend">Masuk</span><div className="mini-chart"><span /><span /><span /><span /><span /></div></div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Total Pengeluaran Arsip</p>
              <p className="stat-value" style={{ color: '#dc2626' }}>{rupiah(summary.expense)}</p>
            </div>
            <span className="stat-icon" style={{ color: '#dc2626', background: 'rgba(239,68,68,0.1)' }}><ArrowDownRight size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend down">Keluar</span><div className="mini-chart"><span /><span /><span /><span /><span /></div></div>
        </article>

        <article className="stat-card premium-panel" style={{ color: '#fff' }}>
          <div className="stat-top">
            <div>
              <p className="stat-label" style={{ color: 'rgba(255,255,255,0.68)' }}>Akumulasi Saldo Arsip</p>
              <p className="stat-value" style={{ color: '#bbf7d0' }}>{rupiah(summary.balance)}</p>
            </div>
            <span className="stat-icon" style={{ color: '#bbf7d0', background: 'rgba(255,255,255,0.12)' }}><Wallet size={22} /></span>
          </div>
          <div className="stat-meta"><span className={`trend ${summary.balance < 0 ? 'down' : ''}`}>{summary.balance < 0 ? 'Minus' : 'Aman'}</span></div>
        </article>
      </section>

      <section className="section-card">
        <div className="toolbar">
          <div className="section-heading">
            <span className="section-heading-icon"><History size={20} /></span>
            <div className="section-title">
              <h2>Catatan Pengeluaran dan Pemasukan Harian</h2>
              <p>Timezone mengikuti Asia/Jakarta.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <span className="spinner" />
            <strong>Memuat riwayat</strong>
            <span>Mohon tunggu sebentar.</span>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={34} />
            <strong>Belum ada arsip harian</strong>
            <span>Riwayat reset buku kas akan tampil setelah reset berjalan.</span>
          </div>
        ) : (
          <>
            <div className="data-table-wrap desktop-table">
              <table className="data-table" style={{ minWidth: 820 }}>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Total Pemasukan</th>
                    <th>Total Pengeluaran</th>
                    <th>Saldo Akhir</th>
                    <th>Transaksi</th>
                    <th>Jam Reset</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 850 }}>
                        {formatDate(`${item.resetDate}T00:00:00+07:00`)}
                      </td>
                      <td style={{ color: '#047857', fontWeight: 900, whiteSpace: 'nowrap' }}>{rupiah(item.totalIncome)}</td>
                      <td style={{ color: '#dc2626', fontWeight: 900, whiteSpace: 'nowrap' }}>{rupiah(item.totalExpense)}</td>
                      <td style={{ color: item.endingBalance < 0 ? '#b91c1c' : '#0b3d2e', fontWeight: 950, whiteSpace: 'nowrap' }}>{rupiah(item.endingBalance)}</td>
                      <td style={{ color: '#6b7280', fontWeight: 800 }}>{item.transactionCount}</td>
                      <td style={{ color: '#6b7280', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} /> {item.resetTime} WIB
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${item.resetMode === 'AUTO' ? 'badge-income' : 'badge-warning'}`}>
                          {item.resetMode === 'AUTO' ? 'Otomatis' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-card-list">
              {items.map((item) => (
                <article className="mobile-data-card" key={item.id}>
                  <div className="mobile-data-row">
                    <span>Tanggal</span>
                    <strong>{formatDate(`${item.resetDate}T00:00:00+07:00`)}</strong>
                  </div>
                  <div className="mobile-data-row"><span>Pemasukan</span><strong>{rupiah(item.totalIncome)}</strong></div>
                  <div className="mobile-data-row"><span>Pengeluaran</span><strong>{rupiah(item.totalExpense)}</strong></div>
                  <div className="mobile-data-row"><span>Saldo Akhir</span><strong>{rupiah(item.endingBalance)}</strong></div>
                  <div className="mobile-data-row"><span>Transaksi</span><strong>{item.transactionCount}</strong></div>
                  <div className="mobile-data-row"><span>Jam Reset</span><strong>{item.resetTime} WIB</strong></div>
                  <div className="mobile-data-row">
                    <span>Mode</span>
                    <strong>
                      <span className={`badge ${item.resetMode === 'AUTO' ? 'badge-income' : 'badge-warning'}`}>
                        {item.resetMode === 'AUTO' ? 'Otomatis' : 'Manual'}
                      </span>
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
