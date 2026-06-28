'use client';

import { useMemo, useState } from 'react';
import { rupiah } from '@/lib/format';
import {
  Calculator,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Banknote,
  Coins,
  UserRound,
} from 'lucide-react';

const cashierOptions = ['IBU YUNINGSIH', 'KARYAWAN'];

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatInputNumber(value: string) {
  if (!value) return '';
  return Number(value).toLocaleString('id-ID');
}

export default function KasirPage() {
  const [total,   setTotal]   = useState('');
  const [paid,    setPaid]    = useState('');
  const [cashier, setCashier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const totalNumber = Number(total || 0);
  const paidNumber  = Number(paid  || 0);
  const change      = useMemo(() => Math.max(paidNumber - totalNumber, 0), [paidNumber, totalNumber]);
  const kurang      = paidNumber > 0 && paidNumber < totalNumber;

  async function submit() {
    setMessage('');
    if (!cashier) {
      setMessage('Pilih nama kasir terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: totalNumber, paidAmount: paidNumber, cashierName: cashier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan transaksi');
      setMessage('Pembayaran berhasil. Transaksi otomatis masuk ke Buku Kas sebagai Uang Masuk.');
      setTotal('');
      setPaid('');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Terjadi error');
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = message.toLowerCase().includes('berhasil');

  return (
    <div className="page-grid-2 page-section-gap">

      {/* ── Left: Form ── */}
      <section className="card form-card">
        {/* header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{
            width:42, height:42, borderRadius:12, flexShrink:0,
            background:'linear-gradient(135deg,#10b981,#0d9488)',
            color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(16,185,129,0.30)',
          }}>
            <Calculator size={20} />
          </div>
          <div>
            <p style={{ margin:0, fontSize:10.5, fontWeight:700, letterSpacing:'0.10em', textTransform:'uppercase', color:'#10b981' }}>
              Mesin Kasir Manual
            </p>
            <h1 style={{ margin:0, fontSize:21, fontWeight:800, letterSpacing:'-0.02em', color:'#0b1a13' }}>
              Input Belanja &amp; Kembalian
            </h1>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {/* Kasir */}
          <div>
            <label style={{
              display:'flex', alignItems:'center', gap:7,
              fontSize:13, fontWeight:600, color:'#475569', marginBottom:8,
            }}>
              <UserRound size={14} color="#94a3b8" />
              Nama Kasir
            </label>
            <select
              className="input"
              value={cashier}
              onChange={(e) => setCashier(e.target.value)}
              style={{ cursor:'pointer', fontWeight:700 }}
            >
              <option value="">Pilih kasir yang melayani</option>
              {cashierOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Total penjualan */}
          <div>
            <label style={{
              display:'flex', alignItems:'center', gap:7,
              fontSize:13, fontWeight:600, color:'#475569', marginBottom:8,
            }}>
              <Receipt size={14} color="#94a3b8" />
              Total Penjualan Belanja
            </label>
            <div style={{ position:'relative' }}>
              <span style={{
                position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
                fontWeight:700, color:'#94a3b8', fontSize:14, pointerEvents:'none',
              }}>Rp</span>
              <input
                className="input"
                style={{ paddingLeft:42, fontSize:16, fontWeight:700 }}
                type="text"
                inputMode="numeric"
                value={formatInputNumber(total)}
                onChange={(e) => setTotal(onlyDigits(e.target.value))}
                placeholder="Masukkan total nominal belanja"
              />
            </div>
          </div>

          {/* Uang dibayar */}
          <div>
            <label style={{
              display:'flex', alignItems:'center', gap:7,
              fontSize:13, fontWeight:600, color:'#475569', marginBottom:8,
            }}>
              <Banknote size={14} color="#94a3b8" />
              Jumlah Uang Dibayar (Tunai)
            </label>
            <div style={{ position:'relative' }}>
              <span style={{
                position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
                fontWeight:700, color:'#94a3b8', fontSize:14, pointerEvents:'none',
              }}>Rp</span>
              <input
                className="input"
                style={{ paddingLeft:42, fontSize:16, fontWeight:700 }}
                type="text"
                inputMode="numeric"
                value={formatInputNumber(paid)}
                onChange={(e) => setPaid(onlyDigits(e.target.value))}
                placeholder="Masukkan nominal tunai pembeli"
              />
            </div>
          </div>

          {/* Warning kurang */}
          {kurang && (
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              background:'#fef2f2', border:'1px solid #fecaca',
              borderRadius:12, padding:'12px 16px',
              fontSize:13, fontWeight:600, color:'#b91c1c',
            }} className="animate-fade-up">
              <AlertTriangle size={16} style={{ flexShrink:0 }} />
              Uang tunai yang dibayarkan kurang dari total belanja.
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid #f1f5f9' }}>
          <div className="kasir-btn-group">
            <button
              disabled={loading || kurang || totalNumber <= 0 || paidNumber <= 0}
              onClick={submit}
              className="btn btn-primary"
              style={{ fontSize:13.5, padding:'11px 0' }}
            >
              {loading ? (
                <>
                  <div style={{
                    width:14, height:14, borderRadius:'50%',
                    border:'2px solid rgba(255,255,255,0.25)',
                    borderTopColor:'#fff', animation:'spin 0.7s linear infinite',
                  }} />
                  Menyimpan...
                </>
              ) : 'Proses Pembayaran'}
            </button>
            <button
              onClick={() => { setTotal(''); setPaid(''); setCashier(''); setMessage(''); }}
              className="btn btn-light"
              style={{ fontSize:13.5, padding:'11px 0' }}
            >
              <RotateCcw size={14} />
              Reset Form
            </button>
          </div>

          {/* Feedback message */}
          {message && (
            <div
              style={{
                marginTop:14, display:'flex', alignItems:'flex-start', gap:10,
                background: isSuccess ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'}`,
                borderRadius:12, padding:'12px 16px',
                fontSize:13, fontWeight:600,
                color: isSuccess ? '#15803d' : '#b91c1c',
              }}
              className="animate-fade-up"
            >
              {isSuccess
                ? <CheckCircle2 size={16} style={{ flexShrink:0, marginTop:1 }} />
                : <AlertTriangle size={16} style={{ flexShrink:0, marginTop:1 }} />
              }
              {message}
            </div>
          )}
        </div>
      </section>

      {/* ── Right: Summary ── */}
      <aside className="card form-card">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
          <Receipt size={18} color="#10b981" />
          <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#0b1a13' }}>Struk Ringkasan</h2>
        </div>
        <p style={{ margin:'0 0 22px', fontSize:12, color:'#94a3b8' }}>Detail kalkulasi pembayaran POS</p>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{
            background:'#f8faf9', border:'1px solid #e2e8f0',
            borderRadius:14, padding:'14px 16px',
          }}>
            <p style={{ margin:'0 0 4px', fontSize:10.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8' }}>
              Kasir
            </p>
            <p style={{ margin:0, fontSize:17, fontWeight:800, color:'#0f172a' }}>
              {cashier || 'Belum dipilih'}
            </p>
          </div>

          {/* Total penjualan */}
          <div style={{
            background:'#f8faf9', border:'1px solid #e2e8f0',
            borderRadius:14, padding:'14px 16px',
          }}>
            <p style={{ margin:'0 0 4px', fontSize:10.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8' }}>
              Total Penjualan
            </p>
            <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>
              {rupiah(totalNumber)}
            </p>
          </div>

          {/* Uang diterima */}
          <div style={{
            background:'#f8faf9', border:'1px solid #e2e8f0',
            borderRadius:14, padding:'14px 16px',
          }}>
            <p style={{ margin:'0 0 4px', fontSize:10.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8' }}>
              Uang Tunai Diterima
            </p>
            <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>
              {rupiah(paidNumber)}
            </p>
          </div>

          {/* Kembalian highlight */}
          <div style={{
            position:'relative', overflow:'hidden',
            background:'linear-gradient(135deg,#064e3b,#065f46)',
            borderRadius:18, padding:'18px 20px',
            boxShadow:'0 8px 24px rgba(6,78,59,0.25)',
          }}>
            <div style={{
              position:'absolute', top:-30, right:-30,
              width:100, height:100, borderRadius:'50%',
              background:'rgba(16,185,129,0.12)', filter:'blur(20px)', pointerEvents:'none',
            }} />
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, position:'relative' }}>
              <Coins size={13} color="#6ee7b7" />
              <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.10em', textTransform:'uppercase', color:'rgba(110,231,183,0.80)' }}>
                Uang Kembalian
              </span>
            </div>
            <p style={{ margin:0, fontSize:30, fontWeight:900, color:'#6ee7b7', letterSpacing:'-0.03em', position:'relative' }}>
              {rupiah(change)}
            </p>
          </div>
        </div>

        <div style={{ marginTop:22, paddingTop:18, borderTop:'1px dashed #e2e8f0', textAlign:'center', fontSize:11, color:'#94a3b8', fontWeight:500 }}>
          * Terima kasih atas transaksi Anda *
        </div>
      </aside>
    </div>
  );
}
