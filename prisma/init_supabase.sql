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
  "cashierName" TEXT NOT NULL DEFAULT 'Kasir',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cashbook_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
