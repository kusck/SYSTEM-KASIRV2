'use client';

import { useEffect, useMemo, useState } from 'react';
import { rupiah } from '@/lib/format';
import {
  ArrowDownRight,
  ArrowUpRight,
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

async function readJsonResponse(res: Response) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Server mengirim response tidak valid. Cek migration Supabase dan log Vercel.');
  }
}

export default function RiwayatBukuKasHarianPage() {
  const [items, setItems] = useState<DailyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/cashbook/history');
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data?.message || 'Gagal memuat riwayat');
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat riwayat');
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
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || 'Reset manual gagal');
      setMessage(data.message || 'Reset manual berhasil');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Reset manual gagal');
    } finally {
      setResetting(false);
    }
  }

  const statCards = [
    { label:'Total Pemasukan Arsip', value:rupiah(summary.income), icon:ArrowUpRight, color:'#047857', bg:'#ecfdf5', border:'#a7f3d0' },
    { label:'Total Pengeluaran Arsip', value:rupiah(summary.expense), icon:ArrowDownRight, color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
    { label:'Akumulasi Saldo Arsip', value:rupiah(summary.balance), icon:Wallet, color:'#0d9488', bg:'#f0fdfa', border:'#99f6e4' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
        <div>
          <h1 style={{ margin:0, display:'flex', alignItems:'center', gap:10, fontSize:26, fontWeight:800, letterSpacing:'-0.025em', color:'#0b1a13' }}>
            <History size={24} color="#10b981" />
            Riwayat Buku Kas Harian
          </h1>
          <p style={{ margin:'6px 0 0', fontSize:13.5, color:'#64748b' }}>
            Catatan otomatis reset buku kas harian memakai timezone Asia/Jakarta.
          </p>
        </div>

        <button className="btn btn-primary" onClick={manualReset} disabled={resetting}>
          {resetting ? (
            <>
              <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.30)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }} />
              Mereset...
            </>
          ) : (
            <>
              <RefreshCw size={15} />
              Reset Manual
            </>
          )}
        </button>
      </div>

      {message && (
        <div className="card animate-fade-up" style={{ padding:'13px 16px', display:'flex', alignItems:'center', gap:10, color:message.toLowerCase().includes('berhasil') ? '#047857' : '#b91c1c', fontSize:13.5, fontWeight:700 }}>
          <ShieldCheck size={16} />
          {message}
        </div>
      )}

      <div className="summary-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card" style={{ padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <div>
                <p style={{ margin:'0 0 6px', fontSize:11.5, fontWeight:600, color:'#64748b' }}>{card.label}</p>
                <p style={{ margin:0, fontSize:22, fontWeight:800, color:card.color, letterSpacing:'-0.02em' }}>{card.value}</p>
              </div>
              <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:card.bg, border:`1px solid ${card.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={18} color={card.color} />
              </div>
            </div>
          );
        })}
      </div>

      <section className="card" style={{ padding:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'rgba(16,185,129,0.10)', color:'#059669', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <CalendarDays size={18} />
          </div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#0b1a13' }}>Catatan Pengeluaran dan Pemasukan Harian</h2>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#94a3b8', fontWeight:600 }}>Memuat riwayat...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <p style={{ color:'#94a3b8', fontWeight:500, margin:0 }}>Belum ada riwayat reset buku kas harian.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-custom" style={{ minWidth:760 }}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Total Pemasukan</th>
                  <th>Total Pengeluaran</th>
                  <th>Saldo Akhir</th>
                  <th>Jumlah Transaksi</th>
                  <th>Jam Reset</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ whiteSpace:'nowrap', fontWeight:700, color:'#334155' }}>
                      {new Date(`${item.resetDate}T00:00:00+07:00`).toLocaleDateString('id-ID', { dateStyle:'medium', timeZone:'Asia/Jakarta' })}
                    </td>
                    <td style={{ color:'#047857', fontWeight:800, whiteSpace:'nowrap' }}>{rupiah(item.totalIncome)}</td>
                    <td style={{ color:'#dc2626', fontWeight:800, whiteSpace:'nowrap' }}>{rupiah(item.totalExpense)}</td>
                    <td style={{ color:item.endingBalance < 0 ? '#b91c1c' : '#0d9488', fontWeight:900, whiteSpace:'nowrap' }}>{rupiah(item.endingBalance)}</td>
                    <td style={{ color:'#64748b', fontWeight:700 }}>{item.transactionCount}</td>
                    <td style={{ whiteSpace:'nowrap', color:'#64748b', fontWeight:700 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                        <Clock size={12} color="#94a3b8" />
                        {item.resetTime} WIB
                      </span>
                    </td>
                    <td>
                      <span className={item.resetMode === 'AUTO' ? 'badge-income' : 'badge-expense'}>
                        {item.resetMode === 'AUTO' ? 'Otomatis' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
