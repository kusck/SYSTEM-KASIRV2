import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import NavbarClient from './components/NavbarClient';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'PASUNDAN POS',
  description: 'Kasir manual dan buku kas untuk bisnis modern',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <NavbarClient />
        {/* Single, consistent content wrapper — DO NOT add max-w / px inside children pages */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 pt-6">
          {children}
        </div>
      </body>
    </html>
  );
}
