import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  CircleDollarSign,
  Clock3,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

const actions = [
  {
    title: 'Kasir',
    desc: 'Input belanja, hitung kembalian, dan simpan transaksi.',
    href: '/kasir',
    icon: ReceiptText,
    cta: 'Buka Kasir',
  },
  {
    title: 'Buku Kas',
    desc: 'Catat pemasukan dan pengeluaran operasional.',
    href: '/buku-kas',
    icon: BookOpenText,
    cta: 'Kelola Kas',
  },
  {
    title: 'Dashboard',
    desc: 'Pantau pendapatan, saldo, dan transaksi terbaru.',
    href: '/dashboard',
    icon: BarChart3,
    cta: 'Lihat Ringkasan',
  },
];

const highlights = [
  { label: 'Pencatatan Cepat', icon: Clock3 },
  { label: 'Saldo Terpantau', icon: TrendingUp },
  { label: 'Akses Aman', icon: ShieldCheck },
];

export default function Home() {
  return (
    <div className="page-stack">
      <section className="premium-panel" style={{ padding: 28 }}>
        <div className="toolbar" style={{ alignItems: 'end', marginBottom: 0 }}>
          <div>
            <span className="eyebrow" style={{ color: '#bbf7d0' }}>
              <Sparkles size={14} />
              PASUNDAN POS V2
            </span>
            <h1 style={{ margin: 0, maxWidth: 720, color: '#fff', fontSize: 36, lineHeight: 1.12, fontWeight: 950 }}>
              Sistem kasir premium untuk transaksi dan buku kas harian.
            </h1>
            <p style={{ margin: '14px 0 0', maxWidth: 620, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7 }}>
              Semua workflow utama tersedia dari layar ini dengan layout responsif untuk desktop, tablet, dan smartphone.
            </p>
          </div>
          <Link className="btn btn-secondary btn-mobile-full" href="/kasir">
            <ReceiptText size={17} />
            Mulai Transaksi
          </Link>
        </div>

        <div className="three-grid" style={{ marginTop: 26 }}>
          {highlights.map(({ label, icon: Icon }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.72)' }}>
              <span style={{ width: 38, height: 38, borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.12)', color: '#bbf7d0' }}>
                <Icon size={18} />
              </span>
              <strong style={{ fontSize: 13 }}>{label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="product-grid">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className="surface-card card-hover" style={{ padding: 22, textDecoration: 'none' }}>
              <span className="stat-icon"><Icon size={22} /></span>
              <h2 style={{ margin: '18px 0 8px', fontSize: 19, fontWeight: 950 }}>{item.title}</h2>
              <p style={{ margin: 0, minHeight: 46, color: '#6b7280', lineHeight: 1.6, fontSize: 14 }}>{item.desc}</p>
              <span className="btn btn-ghost" style={{ marginTop: 18, width: '100%' }}>
                {item.cta}
                <ArrowRight size={16} />
              </span>
            </Link>
          );
        })}

        <Link href="/laporan" className="surface-card premium-panel card-hover" style={{ padding: 22, textDecoration: 'none' }}>
          <span style={{ width: 48, height: 48, borderRadius: 17, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.12)', color: '#bbf7d0' }}>
            <CircleDollarSign size={22} />
          </span>
          <h2 style={{ margin: '18px 0 8px', color: '#fff', fontSize: 19, fontWeight: 950 }}>Laporan Harian</h2>
          <p style={{ margin: 0, minHeight: 46, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6, fontSize: 14 }}>
            Buka arsip reset buku kas harian dan saldo akhir.
          </p>
          <span className="btn btn-secondary" style={{ marginTop: 18, width: '100%' }}>
            Buka Laporan
            <ArrowRight size={16} />
          </span>
        </Link>
      </section>
    </div>
  );
}
