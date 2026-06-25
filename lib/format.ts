export function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function onlyNumber(value: string) {
  return Number(value.replace(/[^0-9]/g, '')) || 0;
}
