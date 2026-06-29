function toFiniteNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function fallbackGroupedNumber(value: number) {
  const rounded = Math.round(toFiniteNumber(value));
  return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function rupiah(value: number) {
  const amount = toFiniteNumber(Number(value || 0));

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `Rp ${fallbackGroupedNumber(amount)}`;
  }
}

export function formatInputNumber(value: string | number) {
  if (value === '' || value === null || typeof value === 'undefined') return '';

  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';

  try {
    return amount.toLocaleString('id-ID');
  } catch {
    return fallbackGroupedNumber(amount);
  }
}

function toValidDate(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | number | Date) {
  const date = toValidDate(value);
  if (!date) return '-';

  try {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function formatTime(value: string | number | Date) {
  const date = toValidDate(value);
  if (!date) return '-';

  try {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date.toISOString().slice(11, 16);
  }
}

export function formatDateTime(value: string | number | Date) {
  const date = toValidDate(value);
  if (!date) return '-';

  return `${formatDate(date)} ${formatTime(date)}`;
}

export async function readJsonResponse<T = unknown>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Server mengirim response tidak valid. Coba muat ulang halaman.');
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}
