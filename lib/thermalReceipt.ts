export type ReceiptData = {
  invoiceNo: string;
  cashierName: string;
  total: number;
  paidAmount: number;
  change: number;
  createdAt: string;
};

const LINE_WIDTH = 32;

function money(value: number) {
  const amount = Math.max(0, Math.round(Number(value || 0)));
  return `Rp ${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function receiptDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function clean(text: string) {
  return text.normalize('NFKD').replace(/[^\x20-\x7E]/g, '');
}

function center(text: string) {
  const normalized = clean(text).slice(0, LINE_WIDTH);
  const left = Math.max(0, Math.floor((LINE_WIDTH - normalized.length) / 2));
  return `${' '.repeat(left)}${normalized}`;
}

function pair(left: string, right: string) {
  const normalizedLeft = clean(left);
  const normalizedRight = clean(right);
  const rightWidth = Math.min(normalizedRight.length, LINE_WIDTH - 1);
  const leftWidth = LINE_WIDTH - rightWidth - 1;
  return `${normalizedLeft.slice(0, leftWidth).padEnd(leftWidth, ' ')} ${normalizedRight.slice(-rightWidth)}`;
}

export function buildReceiptText(receipt: ReceiptData) {
  return [
    center('PASUNDAN POS'),
    center('STRUK PEMBAYARAN'),
    '-'.repeat(LINE_WIDTH),
    pair('No', receipt.invoiceNo),
    pair('Tanggal', receiptDate(receipt.createdAt)),
    pair('Kasir', receipt.cashierName || 'Kasir'),
    '-'.repeat(LINE_WIDTH),
    pair('Penjualan Manual', money(receipt.total)),
    '-'.repeat(LINE_WIDTH),
    pair('TOTAL', money(receipt.total)),
    pair('TUNAI', money(receipt.paidAmount)),
    pair('KEMBALI', money(receipt.change)),
    '-'.repeat(LINE_WIDTH),
    center('Terima kasih'),
    center('PASUNDAN POS'),
    '',
    '',
  ].join('\n');
}

export function buildEscPosReceipt(receipt: ReceiptData) {
  const encoder = new TextEncoder();
  const text = buildReceiptText(receipt);
  const initialize = [0x1b, 0x40];
  const codePage = [0x1b, 0x74, 0x00];
  const feed = [0x0a, 0x0a, 0x0a];
  const partialCut = [0x1d, 0x56, 0x42, 0x00];

  return new Uint8Array([
    ...initialize,
    ...codePage,
    ...encoder.encode(text),
    ...feed,
    ...partialCut,
  ]);
}
