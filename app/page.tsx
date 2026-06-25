import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="card p-8 md:p-12">
        <p className="font-bold text-green-700">System Kasir Manual</p>
        <h1 className="mt-3 text-4xl font-black text-green-950 md:text-6xl">PASUNDAN POS</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">Kasir input harga manual, kembalian otomatis, transaksi masuk ke Buku Kas, dan laporan dashboard otomatis.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn btn-primary" href="/kasir">Mulai Kasir</Link>
          <Link className="btn btn-light" href="/buku-kas">Buka Buku Kas</Link>
        </div>
      </section>
    </main>
  );
}
