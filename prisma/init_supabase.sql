-- Jalankan di Supabase SQL Editor jika kamu belum ingin pakai Prisma migration.
-- Aman untuk database kosong atau yang belum punya tabel ini.

DO $$ BEGIN
  CREATE TYPE "CashType" AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('CASH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" TEXT PRIMARY KEY,
  "invoiceNo" TEXT UNIQUE NOT NULL,
  "total" INTEGER NOT NULL,
  "paidAmount" INTEGER NOT NULL,
  "change" INTEGER NOT NULL,
  "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
  "cashierName" TEXT NOT NULL DEFAULT 'Kasir',
  "status" TEXT NOT NULL DEFAULT 'Selesai',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "cashbook" (
  "id" TEXT PRIMARY KEY,
  "type" "CashType" NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "transactionId" TEXT,
  "resetHistoryId" TEXT,
  "cashierName" TEXT NOT NULL DEFAULT 'Kasir',
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cashbook_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "cashbook_daily_history" (
  "id" TEXT PRIMARY KEY,
  "resetDate" TEXT UNIQUE NOT NULL,
  "resetTime" TEXT NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "totalIncome" INTEGER NOT NULL,
  "totalExpense" INTEGER NOT NULL,
  "endingBalance" INTEGER NOT NULL,
  "transactionCount" INTEGER NOT NULL,
  "resetMode" TEXT NOT NULL DEFAULT 'AUTO',
  "createdBy" TEXT NOT NULL DEFAULT 'System',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "cashbook"
  ADD COLUMN IF NOT EXISTS "resetHistoryId" TEXT,
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

DO $$ BEGIN
  ALTER TABLE "cashbook"
    ADD CONSTRAINT "cashbook_resetHistoryId_fkey"
    FOREIGN KEY ("resetHistoryId") REFERENCES "cashbook_daily_history"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
