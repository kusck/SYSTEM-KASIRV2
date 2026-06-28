import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const cashierOptions = ['IBU YUNINGSIH', 'KARYAWAN'];

function invoiceNo() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `TRX-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Date.now()}`;
}

export async function GET() {
  const data = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const total = Number(body.total || 0);
    const paidAmount = Number(body.paidAmount || 0);
    const cashierName = String(body.cashierName || '').trim();

    if (!cashierOptions.includes(cashierName)) return NextResponse.json({ message: 'Nama kasir wajib dipilih' }, { status: 400 });
    if (total <= 0) return NextResponse.json({ message: 'Total penjualan wajib lebih dari 0' }, { status: 400 });
    if (paidAmount < total) return NextResponse.json({ message: 'Uang pembeli kurang' }, { status: 400 });

    const change = paidAmount - total;

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: { invoiceNo: invoiceNo(), total, paidAmount, change, cashierName, status: 'Selesai' },
      });

      const cashbook = await tx.cashbook.create({
        data: {
          type: 'INCOME',
          category: 'Penjualan',
          description: `Penjualan Kasir Manual - ${transaction.invoiceNo}`,
          amount: total,
          transactionId: transaction.id,
          cashierName,
        },
      });

      return { transaction, cashbook };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal menyimpan transaksi' }, { status: 500 });
  }
}
