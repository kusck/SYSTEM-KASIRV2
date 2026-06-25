import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const q = searchParams.get('q') || '';

  const data = await prisma.cashbook.findMany({
    where: {
      ...(type === 'INCOME' || type === 'EXPENSE' ? { type } : {}),
      ...(q ? { OR: [{ description: { contains: q, mode: 'insensitive' } }, { category: { contains: q, mode: 'insensitive' } }] } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body.amount || 0);
    const type = body.type;
    const category = String(body.category || '').trim();
    const description = String(body.description || '').trim();
    const cashierName = String(body.cashierName || 'Admin');

    if (type !== 'INCOME' && type !== 'EXPENSE') return NextResponse.json({ message: 'Jenis transaksi tidak valid' }, { status: 400 });
    if (amount <= 0) return NextResponse.json({ message: 'Nominal wajib lebih dari 0' }, { status: 400 });
    if (!category) return NextResponse.json({ message: 'Kategori wajib diisi' }, { status: 400 });
    if (!description) return NextResponse.json({ message: 'Keterangan wajib diisi' }, { status: 400 });

    const item = await prisma.cashbook.create({ data: { type, category, description, amount, cashierName } });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal menyimpan buku kas' }, { status: 500 });
  }
}
