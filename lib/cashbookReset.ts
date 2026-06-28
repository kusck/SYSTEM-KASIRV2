import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const JAKARTA_TIME_ZONE = 'Asia/Jakarta';
const RESET_HOUR = 22;

type ResetMode = 'AUTO' | 'MANUAL';

type JakartaNow = {
  dateKey: string;
  timeLabel: string;
  hour: number;
};

function jakartaNow(date = new Date()): JakartaNow {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: JAKARTA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const value = (type: string) => parts.find((part) => part.type === type)?.value || '00';
  const dateKey = `${value('year')}-${value('month')}-${value('day')}`;

  return {
    dateKey,
    timeLabel: `${value('hour')}:${value('minute')}:${value('second')}`,
    hour: Number(value('hour')),
  };
}

export async function resetDailyCashbook({
  mode,
  actor = 'System',
  now = new Date(),
}: {
  mode: ResetMode;
  actor?: string;
  now?: Date;
}) {
  const jakarta = jakartaNow(now);

  if (mode === 'AUTO' && jakarta.hour < RESET_HOUR) {
    return {
      skipped: true,
      message: 'Reset otomatis belum waktunya. Jadwal reset adalah 22:00 WIB.',
      resetDate: jakarta.dateKey,
    };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.cashbookDailyHistory.findUnique({
        where: { resetDate: jakarta.dateKey },
      });

      if (existing) {
        return {
          skipped: true,
          message: 'Buku kas untuk tanggal ini sudah pernah di-reset.',
          history: existing,
        };
      }

      const [income, expense, transactionCount] = await Promise.all([
        tx.cashbook.aggregate({
          where: { resetHistoryId: null, type: 'INCOME' },
          _sum: { amount: true },
        }),
        tx.cashbook.aggregate({
          where: { resetHistoryId: null, type: 'EXPENSE' },
          _sum: { amount: true },
        }),
        tx.cashbook.count({ where: { resetHistoryId: null } }),
      ]);

      const totalIncome = income._sum.amount || 0;
      const totalExpense = expense._sum.amount || 0;

      const history = await tx.cashbookDailyHistory.create({
        data: {
          resetDate: jakarta.dateKey,
          resetTime: jakarta.timeLabel,
          resetAt: now,
          totalIncome,
          totalExpense,
          endingBalance: totalIncome - totalExpense,
          transactionCount,
          resetMode: mode,
          createdBy: actor,
        },
      });

      await tx.cashbook.updateMany({
        where: { resetHistoryId: null },
        data: {
          resetHistoryId: history.id,
          archivedAt: now,
        },
      });

      return {
        skipped: false,
        message: 'Buku kas berhasil disimpan ke riwayat dan di-reset.',
        history,
      };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.cashbookDailyHistory.findUnique({
        where: { resetDate: jakarta.dateKey },
      });

      return {
        skipped: true,
        message: 'Buku kas untuk tanggal ini sudah pernah di-reset.',
        history: existing,
      };
    }

    throw error;
  }
}

export { JAKARTA_TIME_ZONE };
