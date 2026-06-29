'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatInputNumber, getErrorMessage, readJsonResponse, rupiah } from '@/lib/format';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  PlusCircle,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Truck,
} from 'lucide-react';

type StockMovement = {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  note: string | null;
  actorName: string;
  createdAt: string;
};

type ProductStock = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  stockStatus: 'available' | 'low' | 'out';
  movements: StockMovement[];
};

type StockResponse = {
  products: ProductStock[];
  summary: {
    totalProducts: number;
    totalStock: number;
    lowStock: number;
    outOfStock: number;
    inventoryValue: number;
  };
};

const emptySummary = {
  totalProducts: 0,
  totalStock: 0,
  lowStock: 0,
  outOfStock: 0,
  inventoryValue: 0,
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function statusBadge(status: ProductStock['stockStatus']) {
  if (status === 'out') return { className: 'badge-expense', label: 'Habis' };
  if (status === 'low') return { className: 'badge-warning', label: 'Stok Rendah' };
  return { className: 'badge-income', label: 'Tersedia' };
}

function movementLabel(type: StockMovement['type']) {
  if (type === 'IN') return 'Masuk';
  if (type === 'OUT') return 'Keluar';
  return 'Adjustment';
}

export default function StokPage() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'available' | 'low' | 'out'>('all');
  const [productId, setProductId] = useState('');
  const [type, setType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (status !== 'all') params.set('status', status);
      const res = await fetch(`/api/stock?${params.toString()}`);
      const data = await readJsonResponse<StockResponse>(res);
      if (!res.ok || !data) throw new Error('Gagal memuat stok');
      setProducts(Array.isArray(data.products) ? data.products : []);
      setSummary(data.summary || emptySummary);
    } catch (error) {
      setProducts([]);
      setSummary(emptySummary);
      setMessage(getErrorMessage(error, 'Gagal memuat stok'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === productId) || null;
  }, [productId, products]);

  async function submit() {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          type,
          quantity: Number(quantity || 0),
          note,
          actorName: 'Admin',
        }),
      });
      const data = await readJsonResponse<{ message?: string }>(res);
      if (!res.ok) throw new Error(data?.message || 'Gagal menyimpan stok');

      setMessage('Mutasi stok berhasil disimpan');
      setQuantity('');
      setNote('');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menyimpan stok');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setProductId('');
    setType('IN');
    setQuantity('');
    setNote('');
    setMessage('');
  }

  const isSuccess = message.toLowerCase().includes('berhasil');

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Boxes size={14} /> Stok</span>
          <h1>Monitoring stok barang</h1>
          <p>Kelola stok masuk, stok keluar, adjustment, dan pantau status minimum stok.</p>
        </div>
        <a className="btn btn-primary btn-mobile-full" href="/produk">
          <PlusCircle size={17} />
          Tambah Produk
        </a>
      </div>

      <section className="summary-grid summary-scroll">
        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Total SKU</p>
              <p className="stat-value">{summary.totalProducts}</p>
            </div>
            <span className="stat-icon"><PackageCheck size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend neutral">{summary.totalStock} item</span></div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Stok Rendah</p>
              <p className="stat-value" style={{ color: '#b45309' }}>{summary.lowStock}</p>
            </div>
            <span className="stat-icon" style={{ color: '#b45309', background: 'rgba(245,158,11,0.12)' }}><AlertTriangle size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend neutral">{summary.outOfStock} habis</span></div>
        </article>

        <article className="stat-card premium-panel" style={{ color: '#fff' }}>
          <div className="stat-top">
            <div>
              <p className="stat-label" style={{ color: 'rgba(255,255,255,0.68)' }}>Nilai Inventori</p>
              <p className="stat-value" style={{ color: '#bbf7d0' }}>{rupiah(summary.inventoryValue)}</p>
            </div>
            <span className="stat-icon" style={{ color: '#bbf7d0', background: 'rgba(255,255,255,0.12)' }}><Truck size={22} /></span>
          </div>
        </article>
      </section>

      <div className="split-grid">
        <section className="section-card">
          <div className="toolbar">
            <div className="section-heading">
              <span className="section-heading-icon"><SlidersHorizontal size={20} /></span>
              <div className="section-title">
                <h2>Mutasi Stok</h2>
                <p>{selectedProduct ? selectedProduct.name : 'Pilih produk untuk memperbarui stok.'}</p>
              </div>
            </div>
          </div>

          <div className="form-stack">
            <label className="field">
              <span className="field-label">Produk</span>
              <select className="select" value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="">Pilih produk</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · {product.sku} · Stok {product.stock}
                  </option>
                ))}
              </select>
            </label>

            <div className="field">
              <span className="field-label">Jenis Mutasi</span>
              <div className="segmented">
                <button type="button" className={`segment ${type === 'IN' ? 'is-active' : ''}`} onClick={() => setType('IN')}>
                  <ArrowUpRight size={15} />
                  Masuk
                </button>
                <button type="button" className={`segment ${type === 'OUT' ? 'is-active' : ''}`} onClick={() => setType('OUT')}>
                  <ArrowDownRight size={15} />
                  Keluar
                </button>
                <button type="button" className={`segment ${type === 'ADJUSTMENT' ? 'is-active' : ''}`} onClick={() => setType('ADJUSTMENT')}>
                  Adjustment
                </button>
              </div>
            </div>

            <label className="field">
              <span className="field-label">{type === 'ADJUSTMENT' ? 'Stok Akhir' : 'Jumlah Item'}</span>
              <input className="input big-money-input" inputMode="numeric" value={formatInputNumber(quantity)} onChange={(event) => setQuantity(onlyDigits(event.target.value))} placeholder="0" />
            </label>

            {selectedProduct && (
              <div className="surface-card" style={{ padding: 14, boxShadow: 'none' }}>
                <div className="mobile-data-row"><span>Stok saat ini</span><strong>{selectedProduct.stock} Item</strong></div>
                <div className="mobile-data-row" style={{ marginTop: 10 }}><span>Minimum stok</span><strong>{selectedProduct.minStock} Item</strong></div>
                <div className="mobile-data-row" style={{ marginTop: 10 }}><span>Nilai stok</span><strong>{rupiah(selectedProduct.price * selectedProduct.stock)}</strong></div>
              </div>
            )}

            <label className="field">
              <span className="field-label">Catatan</span>
              <textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Contoh: restock supplier, barang rusak, opname stok" />
            </label>

            <div className="button-row">
              <button className="btn btn-primary btn-mobile-full" type="button" onClick={submit} disabled={saving}>
                {saving ? <span className="button-spinner spinner" /> : <Save size={17} />}
                {saving ? 'Menyimpan...' : 'Simpan Mutasi'}
              </button>
              <button className="btn btn-secondary btn-mobile-full" type="button" onClick={resetForm}>
                <RotateCcw size={17} />
                Reset
              </button>
            </div>

            {message && (
              <div className={`toast ${isSuccess ? 'success' : 'error'}`}>
                {isSuccess ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                {message}
              </div>
            )}
          </div>
        </section>

        <section className="section-card">
          <div className="toolbar">
            <div className="section-heading">
              <span className="section-heading-icon"><ClipboardList size={20} /></span>
              <div className="section-title">
                <h2>Daftar Stok</h2>
                <p>{products.length} produk tampil</p>
              </div>
            </div>
          </div>

          <div className="toolbar" style={{ alignItems: 'stretch' }}>
            <div className="toolbar-actions" style={{ flex: 1 }}>
              <div className="input-shell" style={{ minWidth: 220, flex: 1 }}>
                <span className="input-icon"><Search size={16} /></span>
                <input className="input" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Cari stok atau SKU" />
              </div>
              <div className="segmented">
                {[
                  { key: 'all', label: 'Semua' },
                  { key: 'available', label: 'Aman' },
                  { key: 'low', label: 'Rendah' },
                  { key: 'out', label: 'Habis' },
                ].map((item) => (
                  <button key={item.key} type="button" className={`segment ${status === item.key ? 'is-active' : ''}`} onClick={() => setStatus(item.key as 'all' | 'available' | 'low' | 'out')}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-secondary btn-mobile-full" type="button" onClick={load}>
              <Search size={16} />
              Cari
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner" />
              <strong>Memuat stok</strong>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Boxes size={34} />
              <strong>Belum ada stok</strong>
              <span>Tambahkan produk terlebih dahulu untuk mulai mengelola stok.</span>
            </div>
          ) : (
            <>
              <div className="data-table-wrap desktop-table">
                <table className="data-table" style={{ minWidth: 800 }}>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>SKU</th>
                      <th>Stok</th>
                      <th>Minimum</th>
                      <th>Status</th>
                      <th>Mutasi Terakhir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const badge = statusBadge(product.stockStatus);
                      const latest = product.movements[0];
                      return (
                        <tr key={product.id}>
                          <td style={{ fontWeight: 900 }}>{product.name}<br /><span style={{ color: '#6b7280', fontSize: 12 }}>{product.category}</span></td>
                          <td style={{ color: '#6b7280', fontWeight: 750 }}>{product.sku}</td>
                          <td style={{ fontWeight: 950 }}>{product.stock}</td>
                          <td>{product.minStock}</td>
                          <td><span className={`badge ${badge.className}`}>{badge.label}</span></td>
                          <td style={{ color: '#6b7280', fontWeight: 750 }}>
                            {latest
                              ? `${movementLabel(latest.type)} · ${latest.stockBefore} ke ${latest.stockAfter}`
                              : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mobile-card-list">
                {products.map((product) => {
                  const badge = statusBadge(product.stockStatus);
                  const latest = product.movements[0];
                  return (
                    <article className="mobile-data-card" key={product.id}>
                      <div className="mobile-data-row"><span>Produk</span><strong>{product.name}</strong></div>
                      <div className="mobile-data-row"><span>SKU</span><strong>{product.sku}</strong></div>
                      <div className="mobile-data-row"><span>Stok</span><strong>{product.stock} Item</strong></div>
                      <div className="mobile-data-row"><span>Minimum</span><strong>{product.minStock} Item</strong></div>
                      <div className="mobile-data-row"><span>Status</span><strong><span className={`badge ${badge.className}`}>{badge.label}</span></strong></div>
                      <div className="mobile-data-row"><span>Mutasi</span><strong>{latest ? `${movementLabel(latest.type)} · ${latest.stockBefore} ke ${latest.stockAfter}` : '-'}</strong></div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
