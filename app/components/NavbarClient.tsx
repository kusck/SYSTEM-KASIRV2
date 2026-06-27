'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, BookOpen, Menu, X, Zap } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kasir',     label: 'Kasir',     icon: Receipt },
  { href: '/buku-kas',  label: 'Buku Kas',  icon: BookOpen },
];

export default function NavbarClient() {
  const pathname   = usePathname();
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled
          ? 'rgba(255,255,255,0.92)'
          : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(16,185,129,0.10)',
        boxShadow: scrolled ? '0 2px 20px rgba(11,26,19,0.06)' : 'none',
        transition: 'background 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-14">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#10b981,#0d9488)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            className="group-hover:scale-105"
          >
            <Zap size={16} strokeWidth={2.5} />
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg,#065f46,#0d9488)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            PASUNDAN POS
          </span>
        </Link>

        {/* ── Desktop nav pill ── */}
        <nav
          className="hidden sm:flex items-center gap-0.5"
          style={{
            background: 'rgba(241,245,249,0.85)',
            border: '1px solid rgba(203,213,225,0.6)',
            borderRadius: 14,
            padding: '4px',
          }}
        >
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#047857' : '#64748b',
                  boxShadow: active ? '0 1px 8px rgba(0,0,0,0.08)' : 'none',
                  border: active ? '1px solid rgba(16,185,129,0.12)' : '1px solid transparent',
                }}
              >
                <Icon size={14} style={{ color: active ? '#10b981' : '#94a3b8', flexShrink: 0 }} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 9,
            background: 'rgba(16,185,129,0.07)',
            border: '1px solid rgba(16,185,129,0.14)',
            color: '#047857',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? 220 : 0,
          opacity: open ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.25s ease',
          borderTop: open ? '1px solid rgba(16,185,129,0.08)' : 'none',
          background: 'rgba(255,255,255,0.97)',
        }}
        className="sm:hidden"
      >
        <div style={{ padding: '10px 16px 14px' }}>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 11,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginBottom: 4,
                  color: active ? '#047857' : '#475569',
                  background: active ? 'rgba(16,185,129,0.07)' : 'transparent',
                  border: active ? '1px solid rgba(16,185,129,0.12)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} style={{ color: active ? '#10b981' : '#94a3b8', flexShrink: 0 }} />
                {label}
                {active && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#10b981',
                      flexShrink: 0,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
