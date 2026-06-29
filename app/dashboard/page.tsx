'use client';

import { useEffect, useState } from 'react';
import { formatDateTime, getErrorMessage, readJsonResponse, rupiah } from '@/lib/format';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  Package,
  ReceiptText,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

type Summary = {
  today: { income: number; expense: number; balance: number; transactions: number };
  month: { income: number; expense: number; balance: number; transactions: number };
  recent: {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    amount: number;
    cashierName: string;
    createdAt: string;
  }[];
};

function MiniChart() {
  return (
    <div className="mini-chart" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/cashbook/summary');
      const payload = await readJsonResponse<Summary>(res);
      if (!res.ok || !payload) throw new Error('Gagal memuat ringkasan dashboard');
      setData(payload);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Gagal memuat ringkasan dashboard'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading && !data) {
    return (
      <div className="page-stack">
        <div className="page-header">
          <div>
            <span className="eyebrow"><Activity size={14} /> Dashboard</span>
            <h1>Memuat performa kasir</h1>
            <p>Data laporan real-time sedang disiapkan.</p>
          </div>
        </div>
        <div className="stats-grid">
          {Array.from({ length: 7 }).map((_, index) => (
            <div className="stat-card" key={index}>
              <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 17 }} />
              <div className="skeleton" style={{ width: '62%', height: 13, borderRadius: 999, marginTop: 18 }} />
              <div className="skeleton" style={{ width: '80%', height: 30, borderRadius: 999, marginTop: 14 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="page-stack">
        <div className="page-header">
          <div>
            <span className="eyebrow"><Activity size={14} /> Dashboard</span>
            <h1>Dashboard belum bisa dimuat</h1>
            <p>{error}</p>
          </div>
          <button className="btn btn-primary btn-mobile-full" type="button" onClick={load}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-stack">
        <div className="page-header">
          <div>
            <span className="eyebrow"><Activity size={14} /> Dashboard</span>
            <h1>Data dashboard kosong</h1>
            <p>Coba muat ulang ringkasan bisnis.</p>
          </div>
          <button className="btn btn-primary btn-mobile-full" type="button" onClick={load}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Penjualan',
      value: rupiah(data.today.income),
      helper: 'Hari ini',
      icon: ShoppingBag,
      trend: '+ realtime',
      tone: 'up',
    },
    {
      label: 'Total Pendapatan',
      value: rupiah(data.month.income),
      helper: 'Bulan berjalan',
      icon: ArrowUpRight,
      trend: '+ masuk',
      tone: 'up',
    },
    {
      label: 'Laba Bersih',
      value: rupiah(data.month.balance),
      helper: 'Pendapatan dikurangi pengeluaran',
      icon: BarChart3,
      trend: data.month.balance < 0 ? 'minus' : 'sehat',
      tone: data.month.balance < 0 ? 'down' : 'up',
    },
    {
      label: 'Pengeluaran',
      value: rupiah(data.month.expense),
      helper: 'Bulan berjalan',
      icon: ArrowDownRight,
      trend: 'kontrol',
      tone: 'down',
    },
    {
      label: 'Saldo Kas',
      value: rupiah(data.today.balance),
      helper: 'Saldo aktif hari ini',
      icon: Wallet,
      trend: data.today.balance < 0 ? 'perlu cek' : 'aman',
      tone: data.today.balance < 0 ? 'down' : 'up',
    },
    {
      label: 'Jumlah Produk',
      value: '0 SKU',
      helper: 'UI katalog siap diaktifkan',
      icon: Package,
      trend: 'frontend',
      tone: 'neutral',
    },
    {
      label: 'Transaksi Hari Ini',
      value: `${data.today.transactions}`,
      helper: 'Struk tercatat',
      icon: ReceiptText,
      trend: `${data.month.transactions} bulan ini`,
      tone: 'neutral',
    },
  ];

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Activity size={14} /> Luxury Dashboard</span>
          <h1>Ringkasan bisnis hari ini</h1>
          <p>Monitor penjualan, pendapatan, saldo, dan aktivitas kasir dari satu layar.</p>
        </div>
        <a className="btn btn-primary btn-mobile-full" href="/kasir">
          <ReceiptText size={17} />
          Buka Kasir
        </a>
      </div>

      <section className="stats-grid" aria-label="Ringkasan dashboard">
        {stats.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.tone === 'down' ? TrendingDown : TrendingUp;
          return (
            <article className="stat-card" key={card.label}>
              <div className="stat-top">
                <div>
                  <p className="stat-label">{card.label}</p>
                  <p className="stat-value">{card.value}</p>
                </div>
                <span className="stat-icon">
                  <Icon size={22} />
                </span>
              </div>
              <div className="stat-meta">
                <span className={`trend ${card.tone === 'down' ? 'down' : card.tone === 'neutral' ? 'neutral' : ''}`}>
                  <TrendIcon size={14} />
                  {card.trend}
                </span>
                <MiniChart />
              </div>
              <p style={{ margin: '12px 0 0', color: '#6b7280', fontSize: 12, fontWeight: 750 }}>
                {card.helper}
              </p>
            </article>
          );
        })}
      </section>

      <section className="premium-panel" style={{ padding: 24 }}>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <div>
            <span className="eyebrow" style={{ color: '#bbf7d0' }}>
              <Wallet size={14} />
              Saldo Operasional
            </span>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 950, color: '#fff' }}>
              {rupiah(data.today.balance)}
            </h2>
            <p style={{ margin: '8px 0 0', maxWidth: 560, color: 'rgba(255,255,255,0.68)', lineHeight: 1.65 }}>
              Saldo dihitung dari pemasukan dan pengeluaran yang tercatat hari ini.
            </p>
          </div>
          <div className="button-row">
            <a className="btn btn-secondary" href="/buku-kas">Buku Kas</a>
            <a className="btn btn-outline" href="/laporan" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.28)' }}>
              Laporan
            </a>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="toolbar">
          <div className="section-heading">
            <span className="section-heading-icon"><Clock3 size={20} /></span>
            <div className="section-title">
              <h2>Riwayat Transaksi Terbaru</h2>
              <p>Aktivitas kas masuk dan keluar paling baru.</p>
            </div>
          </div>
        </div>

        {data.recent.length === 0 ? (
          <div className="empty-state">
            <ReceiptText size={34} />
            <strong>Belum ada transaksi</strong>
            <span>Transaksi kasir dan buku kas akan muncul di sini.</span>
          </div>
        ) : (
          <>
            <div className="data-table-wrap desktop-table">
              <table className="data-table" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Jenis</th>
                    <th>Kategori</th>
                    <th>Keterangan</th>
                    <th>Kasir</th>
                    <th style={{ textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: '#6b7280', fontWeight: 750, whiteSpace: 'nowrap' }}>
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td>
                        <span className={`badge ${item.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                          {item.type === 'INCOME' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          {item.type === 'INCOME' ? 'Uang Masuk' : 'Uang Keluar'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 850 }}>{item.category}</td>
                      <td style={{ color: '#6b7280', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description || '-'}
                      </td>
                      <td style={{ color: '#6b7280', fontWeight: 750, whiteSpace: 'nowrap' }}>{item.cashierName || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 900, whiteSpace: 'nowrap', color: item.type === 'INCOME' ? '#047857' : '#dc2626' }}>
                        {item.type === 'INCOME' ? '+' : '-'} {rupiah(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-card-list">
              {data.recent.map((item) => (
                <article className="mobile-data-card" key={item.id}>
                  <div className="mobile-data-row">
                    <span>Jenis</span>
                    <strong>
                      <span className={`badge ${item.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                        {item.type === 'INCOME' ? 'Uang Masuk' : 'Uang Keluar'}
                      </span>
                    </strong>
                  </div>
                  <div className="mobile-data-row"><span>Nominal</span><strong>{item.type === 'INCOME' ? '+' : '-'} {rupiah(item.amount)}</strong></div>
                  <div className="mobile-data-row"><span>Kategori</span><strong>{item.category}</strong></div>
                  <div className="mobile-data-row"><span>Keterangan</span><strong>{item.description || '-'}</strong></div>
                  <div className="mobile-data-row"><span>Waktu</span><strong>{formatDateTime(item.createdAt)}</strong></div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
