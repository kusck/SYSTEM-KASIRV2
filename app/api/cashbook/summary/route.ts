import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function startOfMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth(), 1); }

async function sums(from: Date) {
  const [income, expense, trx] = await Promise.all([
    prisma.cashbook.aggregate({ where: { type: 'INCOME', createdAt: { gte: from } }, _sum: { amount: true } }),
    prisma.cashbook.aggregate({ where: { type: 'EXPENSE', createdAt: { gte: from } }, _sum: { amount: true } }),
    prisma.transaction.count({ where: { createdAt: { gte: from } } }),
  ]);
  return { income: income._sum.amount || 0, expense: expense._sum.amount || 0, balance: (income._sum.amount || 0) - (expense._sum.amount || 0), transactions: trx };
}

export async function GET() {
  const [today, month, recent] = await Promise.all([
    sums(startOfDay()),
    sums(startOfMonth()),
    prisma.cashbook.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);
  return NextResponse.json({ today, month, recent });
}
