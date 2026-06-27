'use client';

import { useEffect, useState } from 'react';
import { rupiah } from '@/lib/format';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';

type Summary = {
  today: { income: number; expense: number; balance: number; transactions: number };
  month: { income: number; expense: number; balance: number; transactions: number };
  recent: { id: string; type: 'INCOME' | 'EXPENSE'; category: string; description: string; amount: number; createdAt: string }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    fetch('/api/cashbook/summary').then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:360, gap:14 }}>
        <div style={{
          width:40, height:40, borderRadius:'50%',
          border:'3.5px solid rgba(16,185,129,0.18)',
          borderTopColor:'#10b981',
          animation:'spin 0.75s linear infinite',
        }} />
        <p style={{ fontSize:13.5, color:'#94a3b8', fontWeight:500, margin:0 }}>Memuat laporan dashboard...</p>
      </div>
    );
  }

  const todayCards = [
    { label:'Pendapatan Hari Ini',  value:data.today.income,       icon:ArrowUpRight,   bg:'#ecfdf5', border:'#a7f3d0', iconColor:'#059669', valColor:'#047857',  isCurrency:true  },
    { label:'Pengeluaran Hari Ini', value:data.today.expense,      icon:ArrowDownRight, bg:'#fef2f2', border:'#fecaca', iconColor:'#dc2626', valColor:'#b91c1c',  isCurrency:true  },
    { label:'Saldo Hari Ini',       value:data.today.balance,      icon:Wallet,         bg:'#f0fdfa', border:'#99f6e4', iconColor:'#0d9488', valColor:'#0f766e',  isCurrency:true  },
    { label:'Transaksi Kasir',      value:data.today.transactions, icon:Receipt,        bg:'#eef2ff', border:'#c7d2fe', iconColor:'#6366f1', valColor:'#4338ca',  isCurrency:false },
  ];

  const monthCards = [
    { label:'Pendapatan Bulan Ini', value:data.month.income,   icon:ArrowUpRight,   bg:'#ecfdf5', border:'#a7f3d0', iconColor:'#059669', valColor:'#047857', isCurrency:true },
    { label:'Pengeluaran Bulan Ini',value:data.month.expense,  icon:ArrowDownRight, bg:'#fef2f2', border:'#fecaca', iconColor:'#dc2626', valColor:'#b91c1c', isCurrency:true },
    { label:'Saldo Bulan Ini',      value:data.month.balance,  icon:Wallet,         bg:'#f0fdfa', border:'#99f6e4', iconColor:'#0d9488', valColor:'#0f766e', isCurrency:true },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      {/* ── Page header ── */}
      <div>
        <h1 style={{
          margin:0, display:'flex', alignItems:'center', gap:10,
          fontSize:26, fontWeight:800, letterSpacing:'-0.025em', color:'#0b1a13',
        }}>
          <Sparkles size={24} color="#10b981" style={{ flexShrink:0 }} />
          Dashboard Laporan
        </h1>
        <p style={{ margin:'6px 0 0', fontSize:13.5, color:'#94a3b8' }}>
          Laporan otomatis real-time dari sirkulasi kasir dan buku kas.
        </p>
      </div>

      {/* ── Today ── */}
      <section>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
          <Calendar size={14} color="#94a3b8" />
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.10em', textTransform:'uppercase', color:'#94a3b8' }}>
            Ikhtisar Hari Ini
          </span>
        </div>
        <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))' }}>
          {todayCards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="card card-hover" style={{ padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                  <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#64748b', lineHeight:1.4 }}>{c.label}</p>
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    background:c.bg, border:`1px solid ${c.border}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Icon size={16} color={c.iconColor} />
                  </div>
                </div>
                <p style={{ margin:'12px 0 0', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', color: c.value < 0 ? '#b91c1c' : c.valColor }}>
                  {c.isCurrency ? rupiah(c.value) : `${c.value} Transaksi`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Month ── */}
      <section>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
          <Calendar size={14} color="#94a3b8" />
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.10em', textTransform:'uppercase', color:'#94a3b8' }}>
            Ikhtisar Bulan Ini
          </span>
        </div>
        <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))' }}>
          {monthCards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="card card-hover" style={{ padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                  <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#64748b', lineHeight:1.4 }}>{c.label}</p>
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    background:c.bg, border:`1px solid ${c.border}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Icon size={16} color={c.iconColor} />
                  </div>
                </div>
                <p style={{ margin:'12px 0 0', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', color:c.valColor }}>
                  {rupiah(c.value)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Recent Table ── */}
      <section className="card" style={{ padding:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{
            width:38, height:38, borderRadius:11,
            background:'rgba(16,185,129,0.10)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Clock size={18} color="#059669" />
          </div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#0b1a13' }}>Riwayat Transaksi Terbaru</h2>
        </div>

        {data.recent.length === 0 ? (
          <div style={{ textAlign:'center', padding:'36px 0' }}>
            <p style={{ color:'#94a3b8', fontWeight:500, margin:0 }}>Belum ada riwayat transaksi saat ini.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-custom" style={{ minWidth:640 }}>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Jenis</th>
                  <th>Kategori</th>
                  <th>Keterangan</th>
                  <th style={{ textAlign:'right' }}>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((i) => (
                  <tr key={i.id}>
                    <td style={{ color:'#64748b', fontSize:12, fontWeight:500, whiteSpace:'nowrap' }}>
                      {new Date(i.createdAt).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })}
                    </td>
                    <td>
                      <span className={i.type === 'INCOME' ? 'badge-income' : 'badge-expense'}>
                        {i.type === 'INCOME'
                          ? <><ArrowUpRight size={11} />Uang Masuk</>
                          : <><ArrowDownRight size={11} />Uang Keluar</>}
                      </span>
                    </td>
                    <td style={{ fontWeight:600, color:'#334155' }}>{i.category}</td>
                    <td style={{ color:'#64748b', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {i.description || '-'}
                    </td>
                    <td style={{ textAlign:'right', fontWeight:700, whiteSpace:'nowrap', color: i.type === 'INCOME' ? '#059669' : '#dc2626' }}>
                      {i.type === 'INCOME' ? '+' : '-'} {rupiah(i.amount)}
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
