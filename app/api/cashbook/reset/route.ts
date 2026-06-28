import { NextResponse } from 'next/server';
import { resetDailyCashbook } from '@/lib/cashbookReset';

function isAllowedCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

function isOwnerOrAdmin(req: Request) {
  const role = req.headers.get('x-user-role')?.toUpperCase();
  return role === 'OWNER' || role === 'ADMIN';
}

export async function GET(req: Request) {
  if (!isAllowedCron(req)) {
    return NextResponse.json({ message: 'Akses cron tidak valid' }, { status: 401 });
  }

  const result = await resetDailyCashbook({ mode: 'AUTO' });
  return NextResponse.json(result, { status: result.skipped ? 200 : 201 });
}

export async function POST(req: Request) {
  if (!isOwnerOrAdmin(req)) {
    return NextResponse.json({ message: 'Reset manual hanya untuk Owner/Admin' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const actor = String(body.actor || 'Admin').trim() || 'Admin';
  const result = await resetDailyCashbook({ mode: 'MANUAL', actor });

  return NextResponse.json(result, { status: result.skipped ? 409 : 201 });
}
