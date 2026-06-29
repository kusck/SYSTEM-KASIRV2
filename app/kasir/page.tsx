'use client';

import { useMemo, useState } from 'react';
import { formatInputNumber, getErrorMessage, readJsonResponse, rupiah } from '@/lib/format';
import {
  AlertTriangle,
  Banknote,
  Calculator,
  CheckCircle2,
  Coins,
  CreditCard,
  Printer,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react';

const cashierOptions = ['IBU YUNINGSIH', 'KARYAWAN'];
const quickAmounts = [50000, 100000, 150000, 200000];

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export default function KasirPage() {
  const [total, setTotal] = useState('');
  const [paid, setPaid] = useState('');
  const [cashier, setCashier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const totalNumber = Number(total || 0);
  const paidNumber = Number(paid || 0);
  const change = useMemo(() => Math.max(paidNumber - totalNumber, 0), [paidNumber, totalNumber]);
  const kurang = paidNumber > 0 && paidNumber < totalNumber;
  const isSuccess = message.toLowerCase().includes('berhasil');

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
      const data = await readJsonResponse<{ message?: string }>(res);
      if (!res.ok) throw new Error(data?.message || 'Gagal menyimpan transaksi');
      setMessage('Pembayaran berhasil. Transaksi otomatis masuk ke Buku Kas sebagai Uang Masuk.');
      setTotal('');
      setPaid('');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Terjadi error'));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setTotal('');
    setPaid('');
    setCashier('');
    setMessage('');
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Calculator size={14} /> Mesin Kasir</span>
          <h1>Transaksi cepat dan akurat</h1>
          <p>Input total belanja, uang tunai diterima, lalu sistem menghitung kembalian secara real-time.</p>
        </div>
      </div>

      <div className="cashier-grid">
        <section className="section-card">
          <div className="toolbar">
            <div className="section-heading">
              <span className="section-heading-icon"><ReceiptText size={20} /></span>
              <div className="section-title">
                <h2>Input Pembayaran</h2>
                <p>Dirancang untuk kasir yang butuh gerak cepat.</p>
              </div>
            </div>
          </div>

          <div className="form-stack">
            <label className="field">
              <span className="field-label"><UserRound size={14} /> Nama Kasir</span>
              <div className="input-shell">
                <span className="input-icon"><UserRound size={17} /></span>
                <select className="select" value={cashier} onChange={(event) => setCashier(event.target.value)}>
                  <option value="">Pilih kasir yang melayani</option>
                  {cashierOptions.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="field">
              <span className="field-label"><ReceiptText size={14} /> Total Penjualan Belanja</span>
              <div className="input-shell has-prefix">
                <span className="input-prefix">Rp</span>
                <input
                  className="input big-money-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatInputNumber(total)}
                  onChange={(event) => setTotal(onlyDigits(event.target.value))}
                  placeholder="0"
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label"><Banknote size={14} /> Jumlah Uang Dibayar</span>
              <div className="input-shell has-prefix">
                <span className="input-prefix">Rp</span>
                <input
                  className="input big-money-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatInputNumber(paid)}
                  onChange={(event) => setPaid(onlyDigits(event.target.value))}
                  placeholder="0"
                />
              </div>
            </label>

            <div className="quick-cash" aria-label="Nominal cepat">
              <button type="button" onClick={() => setPaid(String(totalNumber))} disabled={totalNumber <= 0}>
                Bayar Pas
              </button>
              {quickAmounts.map((amount) => (
                <button key={amount} type="button" onClick={() => setPaid(String(amount))}>
                  {rupiah(amount)}
                </button>
              ))}
            </div>

            {kurang && (
              <div className="toast error">
                <AlertTriangle size={17} />
                Uang tunai yang dibayarkan kurang dari total belanja.
              </div>
            )}
          </div>

          <div className="button-row" style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              disabled={loading || kurang || totalNumber <= 0 || paidNumber <= 0}
              onClick={submit}
              className="btn btn-primary btn-mobile-full"
            >
              {loading ? <span className="button-spinner spinner" /> : <CreditCard size={17} />}
              {loading ? 'Menyimpan...' : 'Bayar Sekarang'}
            </button>
            <button type="button" onClick={() => window.print()} className="btn btn-secondary btn-mobile-full">
              <Printer size={17} />
              Cetak
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost btn-mobile-full">
              <RotateCcw size={17} />
              Reset
            </button>
          </div>

          {message && (
            <div className={`toast ${isSuccess ? 'success' : 'error'}`} style={{ marginTop: 14 }}>
              {isSuccess ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
              {message}
            </div>
          )}
        </section>

        <aside className="section-card payment-summary">
          <div className="section-heading">
            <span className="section-heading-icon"><ShieldCheck size={20} /></span>
            <div className="section-title">
              <h2>Ringkasan Pembayaran</h2>
              <p>Detail struk sebelum transaksi disimpan.</p>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div className="receipt-line">
              <span>Kasir</span>
              <strong>{cashier || 'Belum dipilih'}</strong>
            </div>
            <div className="receipt-line">
              <span>Total Belanja</span>
              <strong>{rupiah(totalNumber)}</strong>
            </div>
            <div className="receipt-line">
              <span>Uang Diterima</span>
              <strong>{rupiah(paidNumber)}</strong>
            </div>
            <div className="receipt-line">
              <span>Status</span>
              <strong style={{ color: kurang ? '#dc2626' : '#047857' }}>
                {kurang ? 'Kurang Bayar' : paidNumber > 0 ? 'Siap Diproses' : 'Menunggu Input'}
              </strong>
            </div>
          </div>

          <div className="change-card">
            <span><Coins size={14} /> Uang Kembalian</span>
            <strong>{rupiah(change)}</strong>
          </div>

          <div className="surface-card" style={{ marginTop: 16, padding: 16, boxShadow: 'none' }}>
            <div className="mobile-data-row">
              <span>Metode</span>
              <strong>Tunai</strong>
            </div>
            <div className="mobile-data-row" style={{ marginTop: 10 }}>
              <span>Pencatatan</span>
              <strong>Otomatis ke Buku Kas</strong>
            </div>
            <div className="mobile-data-row" style={{ marginTop: 10 }}>
              <span>Saldo</span>
              <strong><Wallet size={13} style={{ display: 'inline', marginRight: 4 }} /> Masuk</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
