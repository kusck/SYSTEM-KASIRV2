'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component, useEffect } from 'react';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  errorMessage: string;
  hasError: boolean;
};

function errorToMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return 'Terjadi error pada tampilan aplikasi.';
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    errorMessage: '',
    hasError: false,
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      errorMessage: errorToMessage(error),
      hasError: true,
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('[PASUNDAN POS] React render error', error, errorInfo);
  }

  retry = () => {
    this.setState({ errorMessage: '', hasError: false });
  };

  reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-fallback-screen">
        <section className="app-fallback-card">
          <p className="page-kicker">PASUNDAN POS</p>
          <h1>Aplikasi gagal menampilkan halaman</h1>
          <p>
            Sistem tetap aktif. Coba muat ulang halaman, atau kembali ke dashboard jika koneksi baru saja terputus.
          </p>
          <pre>{this.state.errorMessage}</pre>
          <div className="button-row">
            <button className="btn btn-primary" type="button" onClick={this.reload}>
              Muat Ulang
            </button>
            <button className="btn btn-secondary" type="button" onClick={this.retry}>
              Coba Lagi
            </button>
          </div>
        </section>
      </main>
    );
  }
}

export function ClientDiagnostics() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      console.error('[PASUNDAN POS] Window error', event.error || event.message);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[PASUNDAN POS] Unhandled promise rejection', event.reason);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
