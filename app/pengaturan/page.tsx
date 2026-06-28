'use client';

import type { ReactNode } from 'react';
import { Bell, Building2, MonitorSmartphone, Printer, Save, Settings, ShieldCheck } from 'lucide-react';

export default function PengaturanPage() {
  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Settings size={14} /> Pengaturan</span>
          <h1>Preferensi aplikasi</h1>
          <p>Panel pengaturan visual untuk identitas toko, printer, keamanan, dan notifikasi.</p>
        </div>
        <button className="btn btn-primary btn-mobile-full" type="button">
          <Save size={17} />
          Simpan Tampilan
        </button>
      </div>

      <div className="settings-grid">
        <section className="section-card">
          <div className="toolbar">
            <div className="section-heading">
              <span className="section-heading-icon"><Building2 size={20} /></span>
              <div className="section-title">
                <h2>Profil Bisnis</h2>
                <p>Form rounded dengan fokus hijau untuk identitas aplikasi.</p>
              </div>
            </div>
          </div>

          <div className="form-stack">
            <label className="field">
              <span className="field-label">Nama Aplikasi</span>
              <input className="input" defaultValue="PASUNDAN POS" />
            </label>
            <label className="field">
              <span className="field-label">Nama Toko</span>
              <input className="input" placeholder="Masukkan nama toko" />
            </label>
            <label className="field">
              <span className="field-label">Alamat Struk</span>
              <textarea className="textarea" placeholder="Alamat toko untuk struk transaksi" />
            </label>
          </div>
        </section>

        <aside className="section-card">
          <div className="section-heading">
            <span className="section-heading-icon"><ShieldCheck size={20} /></span>
            <div className="section-title">
              <h2>Preferensi Sistem</h2>
              <p>Toggle besar dan mudah ditekan di mobile.</p>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <SettingRow icon={<Printer size={18} />} title="Cetak otomatis" desc="Aktifkan alur cetak struk setelah pembayaran." defaultChecked />
            <SettingRow icon={<Bell size={18} />} title="Notifikasi transaksi" desc="Tampilkan alert saat transaksi berhasil atau gagal." defaultChecked />
            <SettingRow icon={<MonitorSmartphone size={18} />} title="Mode mobile kasir" desc="Optimalkan tombol dan input untuk penggunaan satu tangan." defaultChecked />
            <SettingRow icon={<ShieldCheck size={18} />} title="Konfirmasi reset" desc="Tampilkan dialog sebelum reset Buku Kas harian." defaultChecked />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  desc,
  defaultChecked,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="settings-row">
      <div style={{ display: 'flex', gap: 12 }}>
        <span className="section-heading-icon" style={{ width: 38, height: 38, flexBasis: 38 }}>{icon}</span>
        <div>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
      </div>
      <label className="switch" aria-label={title}>
        <input type="checkbox" defaultChecked={defaultChecked} />
        <span />
      </label>
    </div>
  );
}
