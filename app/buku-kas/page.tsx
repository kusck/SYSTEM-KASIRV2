'use client';

import { useEffect, useMemo, useState } from 'react';
import { rupiah } from '@/lib/format';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  User,
  FileText,
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

export default function BukuKasPage() {
  const [items,       setItems]       = useState<Item[]>([]);
  const [type,        setType]        = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amount,      setAmount]      = useState('');
  const [category,    setCategory]    = useState('');
  const [description, setDescription] = useState('');
  const [q,           setQ]           = useState('');
  const [msg,         setMsg]         = useState('');

  async function load() {
    const res = await fetch(`/api/cashbook?q=${encodeURIComponent(q)}`);
    setItems(await res.json());
  }

  useEffect(() => { load(); }, []);

  const summary = useMemo(() => {
    const income  = items.filter((i) => i.type === 'INCOME') .reduce((a, b) => a + b.amount, 0);
    const expense = items.filter((i) => i.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
    return { income, expense, balance: income - expense };
  }, [items]);

  async function submit() {
    setMsg('');
    if (!amount || Number(amount) <= 0) { setMsg('Error: Masukkan nominal yang valid'); return; }
    if (!category)                       { setMsg('Error: Pilih kategori transaksi');    return; }

    const res = await fetch('/api/cashbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, amount: Number(amount), category, description, cashierName: 'Admin' }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data.message || 'Gagal menyimpan'); return; }
    setAmount(''); setCategory(''); setDescription('');
    setMsg('Berhasil disimpan ke Buku Kas');
    load();
  }

  const categories =
    type === 'INCOME'
      ? ['Penjualan', 'Modal Tambahan', 'Piutang Dibayar', 'Lainnya']
      : ['Belanja Stok', 'Bayar Listrik', 'Bayar Air', 'Gaji Karyawan', 'Transportasi', 'Operasional', 'Lainnya'];

  const isOk = msg.toLowerCase().includes('berhasil');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── Summary cards ── */}
      <div className="summary-grid">
        {/* Uang Masuk */}
        <div className="card" style={{ padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div>
            <p style={{ margin:'0 0 6px', fontSize:11.5, fontWeight:600, color:'#64748b' }}>Uang Masuk (Kredit)</p>
            <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#047857', letterSpacing:'-0.02em' }}>{rupiah(summary.income)}</p>
          </div>
          <div style={{
            width:40, height:40, borderRadius:12, flexShrink:0,
            background:'#ecfdf5', border:'1px solid #a7f3d0',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <ArrowUpRight size={18} color="#059669" />
          </div>
        </div>

        {/* Uang Keluar */}
        <div className="card" style={{ padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div>
            <p style={{ margin:'0 0 6px', fontSize:11.5, fontWeight:600, color:'#64748b' }}>Uang Keluar (Debit)</p>
            <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#dc2626', letterSpacing:'-0.02em' }}>{rupiah(summary.expense)}</p>
          </div>
          <div style={{
            width:40, height:40, borderRadius:12, flexShrink:0,
            background:'#fef2f2', border:'1px solid #fecaca',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <ArrowDownRight size={18} color="#dc2626" />
          </div>
        </div>

        {/* Saldo */}
        <div style={{
          padding:'18px 20px', borderRadius:20,
          background:'linear-gradient(135deg,#064e3b,#065f46)',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
          boxShadow:'0 8px 24px rgba(6,78,59,0.22)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{
            position:'absolute', top:-20, right:-20, width:80, height:80,
            borderRadius:'50%', background:'rgba(16,185,129,0.12)', filter:'blur(16px)', pointerEvents:'none',
          }} />
          <div style={{ position:'relative' }}>
            <p style={{ margin:'0 0 6px', fontSize:11.5, fontWeight:600, color:'rgba(110,231,183,0.75)' }}>Total Saldo Saat Ini</p>
            <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#6ee7b7', letterSpacing:'-0.02em' }}>{rupiah(summary.balance)}</p>
          </div>
          <div style={{
            width:40, height:40, borderRadius:12, flexShrink:0,
            background:'rgba(16,185,129,0.18)',
            display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
          }}>
            <Wallet size={18} color="#6ee7b7" />
          </div>
        </div>
      </div>

      {/* ── Main section: Form + History ── */}
      <div className="page-grid-2">

        {/* Form */}
        <div className="card" style={{ padding:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22 }}>
            <div style={{
              width:38, height:38, borderRadius:11, flexShrink:0,
              background:'linear-gradient(135deg,#10b981,#0d9488)',
              color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 12px rgba(16,185,129,0.28)',
            }}>
              <PlusCircle size={18} />
            </div>
            <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#0b1a13' }}>Tambah Buku Kas</h2>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Jenis */}
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8', marginBottom:6 }}>
                Jenis Transaksi
              </label>
              <select className="input" style={{ cursor:'pointer' }} value={type}
                onChange={(e) => { setType(e.target.value as 'INCOME' | 'EXPENSE'); setCategory(''); }}>
                <option value="INCOME">Uang Masuk (Kredit)</option>
                <option value="EXPENSE">Uang Keluar (Debit)</option>
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8', marginBottom:6 }}>
                Kategori
              </label>
              <select className="input" style={{ cursor:'pointer' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Pilih Kategori</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Nominal */}
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8', marginBottom:6 }}>
                Nominal (Rupiah)
              </label>
              <input className="input" type="number" placeholder="Masukkan nominal angka"
                value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            {/* Keterangan */}
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8', marginBottom:6 }}>
                Keterangan Tambahan
              </label>
              <textarea className="input" style={{ minHeight:90, resize:'none' }}
                placeholder="Keterangan rincian transaksi"
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop:18 }}>
            <button className="btn btn-primary" style={{ width:'100%', fontSize:14, padding:'12px 0' }} onClick={submit}>
              Simpan Transaksi
            </button>

            {msg && (
              <div style={{
                marginTop:12, display:'flex', alignItems:'flex-start', gap:9,
                background: isOk ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${isOk ? '#bbf7d0' : '#fecaca'}`,
                borderRadius:11, padding:'11px 14px',
                fontSize:13, fontWeight:600,
                color: isOk ? '#15803d' : '#b91c1c',
              }} className="animate-fade-up">
                {isOk
                  ? <CheckCircle2 size={15} style={{ flexShrink:0, marginTop:1 }} />
                  : <AlertCircle  size={15} style={{ flexShrink:0, marginTop:1 }} />
                }
                {msg}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="card" style={{ padding:'24px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{
                width:38, height:38, borderRadius:11, flexShrink:0,
                background:'rgba(16,185,129,0.10)',
                color:'#059669', display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <FileText size={18} />
              </div>
              <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#0b1a13' }}>Riwayat Buku Kas</h2>
            </div>

            {/* Search */}
            <div className="cashbook-search">
              <div style={{ position:'relative', flex:1 }}>
                <Search size={14} color="#94a3b8" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                <input
                  className="input"
                  style={{ paddingLeft:34, paddingTop:9, paddingBottom:9, fontSize:13 }}
                  placeholder="Cari keterangan..."
                  value={q} onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <button className="btn btn-light" style={{ fontSize:13, padding:'9px 16px', whiteSpace:'nowrap' }} onClick={load}>
                Cari
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <p style={{ color:'#94a3b8', fontWeight:500, margin:0 }}>Tidak ada data transaksi Buku Kas.</p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight:520, overflowY:'auto' }}>
              <table className="table-custom" style={{ minWidth:640 }}>
                <thead style={{ position:'sticky', top:0, zIndex:1 }}>
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
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td style={{ color:'#64748b', fontSize:12, fontWeight:500, whiteSpace:'nowrap' }}>
                        {new Date(i.createdAt).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })}
                      </td>
                      <td>
                        <span className={i.type === 'INCOME' ? 'badge-income' : 'badge-expense'}>
                          {i.type === 'INCOME' ? <><ArrowUpRight size={11} />Uang Masuk</> : <><ArrowDownRight size={11} />Uang Keluar</>}
                        </span>
                      </td>
                      <td style={{ fontWeight:600, color:'#334155' }}>{i.category}</td>
                      <td style={{ color:'#64748b', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={i.description}>
                        {i.description || '-'}
                      </td>
                      <td style={{ fontWeight:700, color: i.type === 'INCOME' ? '#059669' : '#dc2626', whiteSpace:'nowrap' }}>
                        {i.type === 'INCOME' ? '+' : '-'} {rupiah(i.amount)}
                      </td>
                      <td style={{ color:'#94a3b8', fontSize:12, fontWeight:600 }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                          <User size={11} color="#cbd5e1" /> {i.cashierName}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
