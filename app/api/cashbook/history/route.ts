import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.cashbookDailyHistory.findMany({
      orderBy: { resetAt: 'desc' },
      take: 365,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal memuat riwayat. Pastikan tabel Supabase sudah di-migrate.' }, { status: 500 });
  }
}
