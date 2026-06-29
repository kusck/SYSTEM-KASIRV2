'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { formatDate, formatTime } from '@/lib/format';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Bell,
  BookOpenText,
  Boxes,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Search,
  Settings,
  UserRound,
  Users,
  X,
} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kasir', label: 'Kasir', icon: ReceiptText },
  { href: '/produk', label: 'Produk', icon: Package },
  { href: '/stok', label: 'Stok', icon: Boxes },
  { href: '/buku-kas', label: 'Buku Kas', icon: BookOpenText },
  { href: '/laporan', label: 'Laporan', icon: BarChart3, aliases: ['/riwayat-buku-kas-harian'] },
  { href: '/pemasukan', label: 'Pemasukan', icon: ArrowDownToLine },
  { href: '/pengeluaran', label: 'Pengeluaran', icon: ArrowUpFromLine },
  { href: '/pengguna', label: 'Pengguna', icon: Users },
  { href: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

const titles: Record<string, string> = {
  '/': 'Beranda',
  '/dashboard': 'Dashboard',
  '/kasir': 'Kasir',
  '/produk': 'Produk',
  '/stok': 'Stok',
  '/buku-kas': 'Buku Kas',
  '/laporan': 'Laporan',
  '/riwayat-buku-kas-harian': 'Laporan',
  '/pemasukan': 'Pemasukan',
  '/pengeluaran': 'Pengeluaran',
  '/pengguna': 'Pengguna',
  '/pengaturan': 'Pengaturan',
};

function getTitle(pathname: string) {
  return titles[pathname] || 'PASUNDAN POS';
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="brand" aria-label="PASUNDAN POS Dashboard">
      <span className="brand-mark">
        <CircleDollarSign size={22} strokeWidth={2.4} />
      </span>
      {!collapsed && (
        <span className="brand-copy">
          <strong>PASUNDAN POS</strong>
          <small>Premium Retail Suite</small>
        </span>
      )}
    </Link>
  );
}

export default function NavbarClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const isLogin = pathname === '/login';
  const pageTitle = useMemo(() => getTitle(pathname), [pathname]);

  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setDrawerOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [drawerOpen]);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('[PASUNDAN POS] Logout request failed:', error);
    } finally {
      window.location.href = '/login';
    }
  }

  function openDrawer() {
    setProfileOpen(false);
    setDrawerOpen(true);
  }

  if (isLogin) return <>{children}</>;

  const nav = (
    <nav className="sidebar-nav" aria-label="Navigasi utama">
      {links.map(({ href, label, icon: Icon, aliases }) => {
        const active = pathname === href || aliases?.includes(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${active ? 'is-active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={`pos-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className="pos-sidebar" aria-label="Sidebar desktop">
        <div className="sidebar-top">
          <Brand collapsed={collapsed} />
          <button
            type="button"
            className="sidebar-collapse"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Perbesar sidebar' : 'Perkecil sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {nav}

        <div className="sidebar-footer">
          {!collapsed && (
            <div>
              <span>Mode SaaS</span>
              <strong>Aktif</strong>
            </div>
          )}
          <button type="button" className="sidebar-logout" onClick={logout} aria-label="Logout">
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="pos-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={openDrawer}
              onPointerUp={(event) => {
                if (event.pointerType !== 'mouse') {
                  event.preventDefault();
                  openDrawer();
                }
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                openDrawer();
              }}
              aria-label="Buka menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="page-kicker">PASUNDAN POS</p>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="topbar-search" role="search">
            <Search size={17} />
            <input aria-label="Cari di aplikasi" placeholder="Cari transaksi, produk, laporan..." />
          </div>

          <div className="topbar-actions">
            <div className="clock-pill" aria-label="Jam dan tanggal">
              <ClockDisplay now={now} />
            </div>

            <button type="button" className="topbar-icon" aria-label="Notifikasi">
              <Bell size={18} />
              <span aria-hidden="true" />
            </button>

            <div className="profile-menu">
              <button
                type="button"
                className="profile-button"
                onClick={() => setProfileOpen((value) => !value)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="avatar"><UserRound size={17} /></span>
                <span className="profile-copy">
                  <strong>Admin</strong>
                  <small>Owner</small>
                </span>
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="profile-dropdown" role="menu">
                  <div className="mobile-clock">
                    <ClockDisplay now={now} />
                  </div>
                  <Link href="/pengaturan" role="menuitem">Pengaturan Akun</Link>
                  <button type="button" onClick={logout} role="menuitem">
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      <div className={`drawer-overlay ${drawerOpen ? 'is-open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside
        id="mobile-navigation-drawer"
        className={`mobile-drawer ${drawerOpen ? 'is-open' : ''}`}
        aria-label="Menu mobile"
        aria-hidden={!drawerOpen}
      >
        <div className="mobile-drawer-head">
          <Brand />
          <button type="button" className="topbar-icon" onClick={() => setDrawerOpen(false)} aria-label="Tutup menu">
            <X size={20} />
          </button>
        </div>
        <nav className="mobile-nav" aria-label="Navigasi mobile">
          {links.map(({ href, label, icon: Icon, aliases }) => {
            const active = pathname === href || aliases?.includes(pathname);
            return (
              <Link key={href} href={href} className={`mobile-nav-link ${active ? 'is-active' : ''}`}>
                <Icon size={19} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <button type="button" className="mobile-logout" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </div>
  );
}

function ClockDisplay({ now }: { now: Date | null }) {
  if (!now) {
    return (
      <>
        <CalendarDays size={16} />
        <span>Memuat waktu</span>
      </>
    );
  }

  return (
    <>
      <CalendarDays size={16} />
      <span>{formatDate(now)}</span>
      <strong>{formatTime(now)}</strong>
    </>
  );
}
