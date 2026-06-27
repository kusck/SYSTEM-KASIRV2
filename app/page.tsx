import Link from 'next/link';
import { Receipt, BookOpen, LayoutDashboard, ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react';

const features = [
  {
    title: 'Kasir Manual',
    desc: 'Input harga belanja, masukkan uang pembayaran, dan hitung uang kembalian secara otomatis dengan cepat.',
    icon: Receipt,
    href: '/kasir',
    grad: 'linear-gradient(135deg,#10b981,#0d9488)',
    glow: 'rgba(16,185,129,0.28)',
    badge: 'Fitur Unggulan',
    badgeBg: 'rgba(16,185,129,0.10)',
    badgeColor: '#047857',
    badgeBorder: 'rgba(16,185,129,0.20)',
    linkColor: '#047857',
  },
  {
    title: 'Buku Kas & Transaksi',
    desc: 'Catat uang masuk dan uang keluar. Atur kategori transaksi dan pantau sirkulasi saldo keuangan Anda secara detail.',
    icon: BookOpen,
    href: '/buku-kas',
    grad: 'linear-gradient(135deg,#0d9488,#0891b2)',
    glow: 'rgba(13,148,136,0.28)',
    badge: 'Pembukuan',
    badgeBg: 'rgba(13,148,136,0.10)',
    badgeColor: '#0f766e',
    badgeBorder: 'rgba(13,148,136,0.20)',
    linkColor: '#0f766e',
  },
  {
    title: 'Dashboard Laporan',
    desc: 'Laporan otomatis pendapatan, pengeluaran, saldo, serta riwayat aktivitas harian dan bulanan yang terupdate instan.',
    icon: LayoutDashboard,
    href: '/dashboard',
    grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    glow: 'rgba(99,102,241,0.28)',
    badge: 'Analitik',
    badgeBg: 'rgba(99,102,241,0.10)',
    badgeColor: '#4338ca',
    badgeBorder: 'rgba(99,102,241,0.20)',
    linkColor: '#4338ca',
  },
];

const stats = [
  { label: 'Pencatatan Otomatis', icon: TrendingUp },
  { label: 'Data Aman Tersimpan', icon: Shield },
  { label: 'Input Super Cepat',   icon: Zap },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-section">
        {/* decorative blobs */}
        <div style={{
          position:'absolute', top:-80, right:-80,
          width:320, height:320, borderRadius:'50%',
          background:'rgba(16,185,129,0.08)', filter:'blur(60px)', pointerEvents:'none',
        }} />
        <div style={{
          position:'absolute', bottom:-60, left:-60,
          width:260, height:260, borderRadius:'50%',
          background:'rgba(13,148,136,0.07)', filter:'blur(50px)', pointerEvents:'none',
        }} />

        {/* badge */}
        <span style={{
          display:'inline-flex', alignItems:'center', gap:6,
          background:'rgba(16,185,129,0.14)', border:'1px solid rgba(16,185,129,0.22)',
          borderRadius:9999, padding:'5px 14px',
          fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
          color:'#6ee7b7',
        }}>
          <Zap size={11} /> PASUNDAN POS V2
        </span>

        <h1 style={{
          margin:'20px 0 0',
          fontSize: 'clamp(28px,5vw,54px)',
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: '-0.025em',
          color: '#ffffff',
        }}>
          Kelola Penjualan &amp;{' '}
          <span style={{
            background:'linear-gradient(90deg,#34d399,#2dd4bf)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
          }}>
            Buku Kas
          </span>{' '}
          Lebih Mudah
        </h1>

        <p style={{
          marginTop:18, fontSize:16, color:'rgba(255,255,255,0.55)',
          lineHeight:1.65, maxWidth:540,
        }}>
          Aplikasi pencatatan transaksi manual, penghitungan kembalian otomatis, dan pembukuan kas instan untuk bisnis modern Anda.
        </p>

        <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:32 }}>
          <Link href="/kasir" className="btn btn-primary" style={{ fontSize:14, padding:'11px 26px' }}>
            Mulai Kasir Manual <ArrowRight size={16} />
          </Link>
          <Link href="/buku-kas" style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'11px 26px', borderRadius:12, fontSize:14, fontWeight:600,
            color:'rgba(255,255,255,0.80)', textDecoration:'none',
            background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
            transition:'background 0.18s ease',
          }}>
            Buka Buku Kas
          </Link>
        </div>

        {/* mini stats */}
        <div style={{
          display:'flex', flexWrap:'wrap', gap:28, marginTop:40,
          paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.07)',
        }}>
          {stats.map(({ label, icon: Icon }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Icon size={14} color="#34d399" />
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:500 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section style={{ marginTop:56 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:6,
            background:'rgba(16,185,129,0.09)', border:'1px solid rgba(16,185,129,0.18)',
            borderRadius:9999, padding:'4px 14px',
            fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:'#065f46',
            textTransform:'uppercase', marginBottom:12,
          }}>
            Fitur Lengkap
          </span>
          <h2 style={{ margin:'10px 0 8px', fontSize:28, fontWeight:800, color:'#0b1a13', letterSpacing:'-0.02em' }}>
            Fitur Utama Aplikasi
          </h2>
          <p style={{ fontSize:15, color:'#64748b', margin:0 }}>
            Nikmati kemudahan pencatatan terintegrasi untuk usaha Anda
          </p>
        </div>

        <div className="feat-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card feature-card"
                style={{
                  display:'flex', flexDirection:'column',
                  overflow:'hidden', padding:0,
                }}
              >
                {/* top gradient accent bar */}
                <div style={{ height:3, background:f.grad }} />

                <div style={{ padding:'24px 24px 22px', display:'flex', flexDirection:'column', flex:1 }}>
                  {/* icon + badge */}
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                    <div style={{
                      width:48, height:48, borderRadius:14,
                      background:f.grad, color:'#fff',
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      boxShadow:`0 6px 18px ${f.glow}`, flexShrink:0,
                    }}>
                      <Icon size={22} />
                    </div>
                    <span style={{
                      display:'inline-block', padding:'3px 10px', borderRadius:9999,
                      fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
                      background:f.badgeBg, color:f.badgeColor, border:`1px solid ${f.badgeBorder}`,
                      whiteSpace:'nowrap', marginTop:4,
                    }}>
                      {f.badge}
                    </span>
                  </div>

                  {/* text */}
                  <h3 style={{ margin:'18px 0 8px', fontSize:18, fontWeight:700, color:'#0b1a13' }}>
                    {f.title}
                  </h3>
                  <p style={{ margin:0, fontSize:13.5, color:'#64748b', lineHeight:1.65, flex:1 }}>
                    {f.desc}
                  </p>

                  {/* CTA */}
                  <div style={{ marginTop:22, paddingTop:18, borderTop:'1px solid #f1f5f9' }}>
                    <Link
                      href={f.href}
                      style={{
                        display:'inline-flex', alignItems:'center', gap:8,
                        fontSize:13.5, fontWeight:700, color:f.linkColor,
                        textDecoration:'none', transition:'gap 0.18s ease',
                      }}
                    >
                      Buka Fitur
                      <span style={{
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                        width:26, height:26, borderRadius:'50%',
                        background:f.grad, color:'#fff',
                        boxShadow:`0 4px 10px ${f.glow}`,
                        transition:'transform 0.18s ease',
                        flexShrink:0,
                      }}>
                        <ArrowRight size={12} />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
