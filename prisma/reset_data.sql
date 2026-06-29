-- Reset data operasional untuk persiapan pemakaian final.
-- Struktur tabel, enum, constraint, dan index tetap dipertahankan.

TRUNCATE TABLE
  "stock_movements",
  "products",
  "cashbook",
  "cashbook_daily_history",
  "transactions"
RESTART IDENTITY CASCADE;
