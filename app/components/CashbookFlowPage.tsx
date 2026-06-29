'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDateTime, getErrorMessage, readJsonResponse, rupiah } from '@/lib/format';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  FileText,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

type FlowType = 'INCOME' | 'EXPENSE';

type Item = {
  id: string;
  type: FlowType;
  category: string;
  description: string;
  amount: number;
  cashierName: string;
  createdAt: string;
};

export default function CashbookFlowPage({ type }: { type: FlowType }) {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isIncome = type === 'INCOME';
  const pageTitle = isIncome ? 'Pemasukan' : 'Pengeluaran';
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
  const TrendIcon = isIncome ? TrendingUp : TrendingDown;

  async function load() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/cashbook');
      const data = await readJsonResponse<Item[]>(res);
      if (!res.ok) throw new Error('Gagal memuat buku kas');
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (loadError) {
      setItems([]);
      setError(getErrorMessage(loadError, 'Gagal memuat buku kas'));
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items
      .filter((item) => item.type === type)
      .filter((item) => !date || item.createdAt.slice(0, 10) === date)
      .filter((item) => {
        if (!query) return true;
        return [item.category, item.description, item.cashierName].some((value) => value?.toLowerCase().includes(query));
      });
  }, [date, items, q, type]);

  const total = filtered.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Icon size={14} /> {pageTitle}</span>
          <h1>{isIncome ? 'Audit pemasukan usaha' : 'Audit pengeluaran usaha'}</h1>
          <p>{isIncome ? 'Pantau semua uang masuk dari kasir dan catatan manual.' : 'Pantau semua uang keluar untuk operasional dan kebutuhan stok.'}</p>
        </div>
        <a className="btn btn-primary btn-mobile-full" href="/buku-kas">
          <FileText size={17} />
          Tambah di Buku Kas
        </a>
      </div>

      <section className="summary-grid summary-scroll">
        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Total {pageTitle}</p>
              <p className="stat-value" style={{ color: isIncome ? '#047857' : '#dc2626' }}>{rupiah(total)}</p>
            </div>
            <span className="stat-icon" style={{ color: isIncome ? '#0b3d2e' : '#dc2626', background: isIncome ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)' }}>
              <Icon size={22} />
            </span>
          </div>
          <div className="stat-meta">
            <span className={`trend ${isIncome ? '' : 'down'}`}>
              <TrendIcon size={14} />
              {filtered.length} transaksi
            </span>
            <div className="mini-chart"><span /><span /><span /><span /><span /></div>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Rata-rata Nominal</p>
              <p className="stat-value">{rupiah(filtered.length ? total / filtered.length : 0)}</p>
            </div>
            <span className="stat-icon"><CalendarDays size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend neutral">Filter aktif</span></div>
        </article>

        <article className="stat-card premium-panel" style={{ color: '#fff' }}>
          <div className="stat-top">
            <div>
              <p className="stat-label" style={{ color: 'rgba(255,255,255,0.68)' }}>Data Tampil</p>
              <p className="stat-value" style={{ color: '#bbf7d0' }}>{filtered.length}</p>
            </div>
            <span className="stat-icon" style={{ background: 'rgba(255,255,255,0.12)', color: '#bbf7d0' }}><FileText size={22} /></span>
          </div>
        </article>
      </section>

      <section className="section-card">
        <div className="toolbar">
          <div className="section-heading">
            <span className="section-heading-icon"><FileText size={20} /></span>
            <div className="section-title">
              <h2>Daftar {pageTitle}</h2>
              <p>Tampilan tabel desktop dan card list di mobile.</p>
            </div>
          </div>
          <div className="toolbar-actions">
            <div className="input-shell">
              <span className="input-icon"><Search size={16} /></span>
              <input className="input" placeholder="Cari kategori atau operator" value={q} onChange={(event) => setQ(event.target.value)} />
            </div>
            <div className="input-shell">
              <span className="input-icon"><CalendarDays size={16} /></span>
              <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
          </div>
        </div>

        {error && (
          <div className="toast error" style={{ marginBottom: 14 }}>
            <FileText size={17} />
            <span>{error}</span>
            <button className="btn btn-secondary" type="button" onClick={load}>
              Coba Lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <span className="spinner" />
            <strong>Memuat {pageTitle.toLowerCase()}</strong>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={34} />
            <strong>Belum ada data</strong>
            <span>Data akan muncul dari transaksi Buku Kas yang sudah tersimpan.</span>
          </div>
        ) : (
          <>
            <div className="data-table-wrap desktop-table">
              <table className="data-table" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Keterangan</th>
                    <th>Operator</th>
                    <th style={{ textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: '#6b7280', fontWeight: 750, whiteSpace: 'nowrap' }}>
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td style={{ fontWeight: 850 }}>{item.category}</td>
                      <td style={{ color: '#6b7280', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description || '-'}</td>
                      <td style={{ color: '#6b7280', fontWeight: 750 }}>{item.cashierName || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: isIncome ? '#047857' : '#dc2626', whiteSpace: 'nowrap' }}>
                        {isIncome ? '+' : '-'} {rupiah(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-card-list">
              {filtered.map((item) => (
                <article className="mobile-data-card" key={item.id}>
                  <div className="mobile-data-row"><span>Kategori</span><strong>{item.category}</strong></div>
                  <div className="mobile-data-row"><span>Nominal</span><strong>{isIncome ? '+' : '-'} {rupiah(item.amount)}</strong></div>
                  <div className="mobile-data-row"><span>Keterangan</span><strong>{item.description || '-'}</strong></div>
                  <div className="mobile-data-row"><span>Operator</span><strong>{item.cashierName || '-'}</strong></div>
                  <div className="mobile-data-row"><span>Tanggal</span><strong>{formatDateTime(item.createdAt)}</strong></div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
