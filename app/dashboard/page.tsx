'use client';

import { useEffect, useState } from 'react';
import { rupiah } from '@/lib/format';

type Summary = { today:{income:number;expense:number;balance:number;transactions:number}; month:{income:number;expense:number;balance:number;transactions:number}; recent:{id:string;type:'INCOME'|'EXPENSE';category:string;description:string;amount:number;createdAt:string}[] };

export default function DashboardPage(){
 const [data,setData]=useState<Summary|null>(null);
 useEffect(()=>{fetch('/api/cashbook/summary').then(r=>r.json()).then(setData)},[]);
 if(!data) return <main className="mx-auto max-w-6xl px-4 py-8 font-bold">Loading...</main>;
 const cards=[['Pendapatan Hari Ini',data.today.income],['Pengeluaran Hari Ini',data.today.expense],['Saldo Hari Ini',data.today.balance],['Pendapatan Bulan Ini',data.month.income],['Pengeluaran Bulan Ini',data.month.expense],['Saldo Bulan Ini',data.month.balance]];
 return <main className="mx-auto max-w-6xl px-4 py-8"><h1 className="text-3xl font-black text-green-950">Dashboard</h1><p className="mt-2 text-slate-600">Laporan otomatis dari transaksi kasir dan buku kas.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([t,v])=><div key={String(t)} className="card p-5"><p className="font-bold text-slate-500">{t}</p><p className="mt-2 text-2xl font-black text-green-900">{rupiah(Number(v))}</p></div>)}<div className="card p-5"><p className="font-bold text-slate-500">Jumlah Transaksi Kasir Hari Ini</p><p className="mt-2 text-2xl font-black text-green-900">{data.today.transactions}</p></div></div><section className="card mt-6 p-6"><h2 className="text-2xl font-black text-green-950">Riwayat Terbaru</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Waktu</th><th className="p-3">Jenis</th><th className="p-3">Kategori</th><th className="p-3">Keterangan</th><th className="p-3">Nominal</th></tr></thead><tbody>{data.recent.map(i=><tr key={i.id} className="border-b"><td className="p-3">{new Date(i.createdAt).toLocaleString('id-ID')}</td><td className="p-3"><span className={i.type==='INCOME'?'badge-income':'badge-expense'}>{i.type==='INCOME'?'Uang Masuk':'Uang Keluar'}</span></td><td className="p-3">{i.category}</td><td className="p-3">{i.description}</td><td className="p-3 font-bold">{rupiah(i.amount)}</td></tr>)}</tbody></table></div></section></main>;
}
