CREATE TABLE IF NOT EXISTS "cashbook_daily_history" (
  "id" TEXT NOT NULL,
  "resetDate" TEXT NOT NULL,
  "resetTime" TEXT NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "totalIncome" INTEGER NOT NULL,
  "totalExpense" INTEGER NOT NULL,
  "endingBalance" INTEGER NOT NULL,
  "transactionCount" INTEGER NOT NULL,
  "resetMode" TEXT NOT NULL DEFAULT 'AUTO',
  "createdBy" TEXT NOT NULL DEFAULT 'System',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "cashbook_daily_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "cashbook_daily_history_resetDate_key"
  ON "cashbook_daily_history"("resetDate");

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
