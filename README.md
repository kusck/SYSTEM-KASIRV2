# PASUNDAN POS - Kasir Manual + Buku Kas

Fitur:
- Input harga manual di halaman Kasir
- Kembalian otomatis realtime
- Transaksi kasir otomatis masuk Buku Kas sebagai Uang Masuk
- Buku Kas bisa tambah Uang Masuk dan Uang Keluar
- Dashboard pendapatan, pengeluaran, saldo harian/bulanan
- Siap deploy Vercel + Supabase PostgreSQL

## Cara pakai lokal

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

## Setup Supabase

Pilihan paling mudah:
1. Buka Supabase > SQL Editor
2. Copy isi file `prisma/init_supabase.sql`
3. Run SQL
4. Ambil connection string Supabase lalu isi di Vercel Environment Variables:
   - `DATABASE_URL`
   - `DIRECT_URL`

## Deploy ke Vercel

1. Upload project ke GitHub
2. Import repo di Vercel
3. Tambahkan Environment Variables dari `.env.example`
4. Deploy

## Catatan penting

Jangan pakai `prisma migrate reset` di database production karena bisa menghapus data.
