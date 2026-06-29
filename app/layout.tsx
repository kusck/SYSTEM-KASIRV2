import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { AppErrorBoundary, ClientDiagnostics } from './components/AppErrorBoundary';
import NavbarClient from './components/NavbarClient';
import PwaRegister from './pwa-register';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  applicationName: 'PASUNDAN POS',
  title: 'PASUNDAN POS',
  description: 'Kasir manual dan buku kas untuk bisnis modern',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PASUNDAN POS',
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0B3D2E',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <Script id="legacy-browser-polyfills" strategy="beforeInteractive">
          {`
            (function () {
              if (!Array.prototype.at) {
                Object.defineProperty(Array.prototype, 'at', {
                  value: function (index) {
                    var length = this == null ? 0 : this.length >>> 0;
                    var relativeIndex = index < 0 ? Math.ceil(index) : Math.floor(index);
                    var k = relativeIndex >= 0 ? relativeIndex : length + relativeIndex;
                    if (k < 0 || k >= length) return undefined;
                    return this[k];
                  },
                  writable: true,
                  configurable: true
                });
              }

              if (!Object.fromEntries) {
                Object.fromEntries = function (entries) {
                  var obj = {};
                  var iterator = entries && entries[Symbol.iterator];

                  if (typeof iterator === 'function') {
                    var iterable = iterator.call(entries);
                    var step = iterable.next();
                    while (!step.done) {
                      obj[step.value[0]] = step.value[1];
                      step = iterable.next();
                    }
                    return obj;
                  }

                  for (var i = 0; i < entries.length; i += 1) {
                    obj[entries[i][0]] = entries[i][1];
                  }
                  return obj;
                };
              }

              if (!Object.hasOwn) {
                Object.hasOwn = function (obj, prop) {
                  return Object.prototype.hasOwnProperty.call(obj, prop);
                };
              }
            })();
          `}
        </Script>
        <AppErrorBoundary>
          <ClientDiagnostics />
          <PwaRegister />
          <NavbarClient>
            {children}
          </NavbarClient>
        </AppErrorBoundary>
      </body>
    </html>
  );
}
