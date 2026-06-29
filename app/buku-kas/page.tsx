'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDateTime, formatInputNumber, getErrorMessage, readJsonResponse, rupiah } from '@/lib/format';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  FileText,
  PlusCircle,
  Search,
  User,
  Wallet,
} from 'lucide-react';

type Item = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number;
  cashierName: string;
  createdAt: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export default function BukuKasPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cashbook?q=${encodeURIComponent(q)}`);
      const data = await readJsonResponse<Item[]>(res);
      if (!res.ok) throw new Error('Gagal memuat buku kas');
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setItems([]);
      setMsg(`Error: ${getErrorMessage(error, 'Gagal memuat buku kas')}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const summary = useMemo(() => {
    const income = items.filter((item) => item.type === 'INCOME').reduce((acc, item) => acc + item.amount, 0);
    const expense = items.filter((item) => item.type === 'EXPENSE').reduce((acc, item) => acc + item.amount, 0);
    return { income, expense, balance: income - expense };
  }, [items]);

  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      const typeMatch = filterType === 'ALL' || item.type === filterType;
      const dateMatch = !filterDate || item.createdAt.slice(0, 10) === filterDate;
      return typeMatch && dateMatch;
    });
  }, [filterDate, filterType, items]);

  async function submit() {
    setMsg('');
    if (!amount || Number(amount) <= 0) { setMsg('Error: Masukkan nominal yang valid'); return; }
    if (!category) { setMsg('Error: Pilih kategori transaksi'); return; }

    try {
      const res = await fetch('/api/cashbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount: Number(amount), category, description, cashierName: 'Admin' }),
      });
      const data = await readJsonResponse<{ message?: string }>(res);
      if (!res.ok) { setMsg(data?.message || 'Gagal menyimpan'); return; }
      setAmount('');
      setCategory('');
      setDescription('');
      setMsg('Berhasil disimpan ke Buku Kas');
      await load();
    } catch (error) {
      setMsg(`Error: ${getErrorMessage(error, 'Gagal menyimpan')}`);
    }
  }

  const categories =
    type === 'INCOME'
      ? ['Penjualan', 'Modal Tambahan', 'Piutang Dibayar', 'Lainnya']
      : ['Belanja Stok', 'Bayar Listrik', 'Bayar Air', 'Gaji Karyawan', 'Transportasi', 'Operasional', 'Lainnya'];

  const isOk = msg.toLowerCase().includes('berhasil');

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><BookOpenText size={14} /> Buku Kas</span>
          <h1>Kontrol arus kas harian</h1>
          <p>Catat pemasukan dan pengeluaran dengan tampilan finance yang mudah dipantau.</p>
        </div>
        <button className="btn btn-primary btn-mobile-full" type="button" onClick={submit}>
          <PlusCircle size={17} />
          Simpan Transaksi
        </button>
      </div>

      <section className="summary-grid summary-scroll">
        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Pemasukan</p>
              <p className="stat-value" style={{ color: '#047857' }}>{rupiah(summary.income)}</p>
            </div>
            <span className="stat-icon"><ArrowUpRight size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend"><ArrowUpRight size={14} /> Masuk</span><div className="mini-chart"><span /><span /><span /><span /><span /></div></div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Pengeluaran</p>
              <p className="stat-value" style={{ color: '#dc2626' }}>{rupiah(summary.expense)}</p>
            </div>
            <span className="stat-icon" style={{ color: '#dc2626', background: 'rgba(239,68,68,0.1)' }}><ArrowDownRight size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend down"><ArrowDownRight size={14} /> Keluar</span><div className="mini-chart"><span /><span /><span /><span /><span /></div></div>
        </article>

        <article className="stat-card premium-panel" style={{ color: '#fff' }}>
          <div className="stat-top">
            <div>
              <p className="stat-label" style={{ color: 'rgba(255,255,255,0.68)' }}>Saldo Kas</p>
              <p className="stat-value" style={{ color: '#bbf7d0' }}>{rupiah(summary.balance)}</p>
            </div>
            <span className="stat-icon" style={{ background: 'rgba(255,255,255,0.12)', color: '#bbf7d0' }}><Wallet size={22} /></span>
          </div>
          <div className="stat-meta"><span className={`trend ${summary.balance < 0 ? 'down' : ''}`}>{summary.balance < 0 ? 'Perlu cek' : 'Sehat'}</span></div>
        </article>
      </section>

      <div className="split-grid">
        <section className="section-card">
          <div className="toolbar">
            <div className="section-heading">
              <span className="section-heading-icon"><PlusCircle size={20} /></span>
              <div className="section-title">
                <h2>Tambah Catatan</h2>
                <p>Input manual untuk transaksi di luar kasir.</p>
              </div>
            </div>
          </div>

          <div className="form-stack">
            <div className="field">
              <span className="field-label">Jenis Transaksi</span>
              <div className="segmented">
                <button
                  type="button"
                  className={`segment ${type === 'INCOME' ? 'is-active' : ''}`}
                  onClick={() => { setType('INCOME'); setCategory(''); }}
                >
                  <ArrowUpRight size={15} />
                  Masuk
                </button>
                <button
                  type="button"
                  className={`segment ${type === 'EXPENSE' ? 'is-active' : ''}`}
                  onClick={() => { setType('EXPENSE'); setCategory(''); }}
                >
                  <ArrowDownRight size={15} />
                  Keluar
                </button>
              </div>
            </div>

            <label className="field">
              <span className="field-label">Kategori</span>
              <select className="select" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">Pilih kategori</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Nominal Rupiah</span>
              <div className="input-shell has-prefix">
                <span className="input-prefix">Rp</span>
                <input
                  className="input big-money-input"
                  type="text"
                  inputMode="numeric"
                  value={formatInputNumber(amount)}
                  onChange={(event) => setAmount(onlyDigits(event.target.value))}
                  placeholder="0"
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Keterangan</span>
              <textarea
                className="textarea"
                placeholder="Contoh: belanja stok pagi, pembayaran listrik, modal tambahan"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            {msg && (
              <div className={`toast ${isOk ? 'success' : 'error'}`}>
                {isOk ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                {msg}
              </div>
            )}
          </div>
        </section>

        <section className="section-card">
          <div className="toolbar">
            <div className="section-heading">
              <span className="section-heading-icon"><FileText size={20} /></span>
              <div className="section-title">
                <h2>Riwayat Buku Kas</h2>
                <p>Filter cepat untuk audit pemasukan dan pengeluaran.</p>
              </div>
            </div>
          </div>

          <div className="toolbar" style={{ alignItems: 'stretch' }}>
            <div className="toolbar-actions" style={{ flex: 1 }}>
              <div className="input-shell" style={{ minWidth: 220, flex: 1 }}>
                <span className="input-icon"><Search size={16} /></span>
                <input className="input" placeholder="Cari keterangan..." value={q} onChange={(event) => setQ(event.target.value)} />
              </div>
              <div className="input-shell" style={{ minWidth: 170 }}>
                <span className="input-icon"><CalendarDays size={16} /></span>
                <input className="input" type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} />
              </div>
            </div>
            <button className="btn btn-secondary btn-mobile-full" type="button" onClick={load}>
              <Search size={16} />
              Cari
            </button>
          </div>

          <div className="segmented" style={{ marginBottom: 16 }}>
            {[
              { key: 'ALL', label: 'Semua' },
              { key: 'INCOME', label: 'Masuk' },
              { key: 'EXPENSE', label: 'Keluar' },
            ].map((item) => (
              <button
                key={item.key}
                className={`segment ${filterType === item.key ? 'is-active' : ''}`}
                type="button"
                onClick={() => setFilterType(item.key as 'ALL' | 'INCOME' | 'EXPENSE')}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner" />
              <strong>Memuat buku kas</strong>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="empty-state">
              <FileText size={34} />
              <strong>Tidak ada data</strong>
              <span>Transaksi yang cocok dengan filter belum tersedia.</span>
            </div>
          ) : (
            <>
              <div className="data-table-wrap desktop-table" style={{ maxHeight: 560 }}>
                <table className="data-table" style={{ minWidth: 760 }}>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jenis</th>
                      <th>Kategori</th>
                      <th>Keterangan</th>
                      <th>Nominal</th>
                      <th>Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((item) => (
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
                        <td style={{ color: '#6b7280', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.description}>
                          {item.description || '-'}
                        </td>
                        <td style={{ fontWeight: 900, whiteSpace: 'nowrap', color: item.type === 'INCOME' ? '#047857' : '#dc2626' }}>
                          {item.type === 'INCOME' ? '+' : '-'} {rupiah(item.amount)}
                        </td>
                        <td style={{ color: '#6b7280', fontWeight: 750, whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <User size={13} /> {item.cashierName}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-card-list">
                {displayedItems.map((item) => (
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
                    <div className="mobile-data-row"><span>Tanggal</span><strong>{formatDateTime(item.createdAt)}</strong></div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
