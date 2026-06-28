import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.cashbookDailyHistory.findMany({
    orderBy: { resetAt: 'desc' },
    take: 365,
  });

  return NextResponse.json(data);
}
