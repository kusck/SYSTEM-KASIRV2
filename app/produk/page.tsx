'use client';

import { useEffect, useMemo, useState } from 'react';
import { rupiah } from '@/lib/format';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Image,
  Package,
  PlusCircle,
  RotateCcw,
  Save,
  Search,
  ShoppingBasket,
  Trash2,
} from 'lucide-react';

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  sku: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  minStock: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  sku: '',
  name: '',
  category: '',
  price: '',
  stock: '',
  minStock: '',
  imageUrl: '',
  description: '',
  isActive: true,
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatInputNumber(value: string) {
  if (!value) return '';
  return Number(value).toLocaleString('id-ID');
}

function stockBadge(product: Product) {
  if (product.stock <= 0) return { className: 'badge-expense', label: 'Habis' };
  if (product.stock <= product.minStock) return { className: 'badge-warning', label: 'Stok Rendah' };
  return { className: 'badge-income', label: 'Tersedia' };
}

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (status !== 'all') params.set('status', status);
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category).filter(Boolean))).slice(0, 8);
  }, [products]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setMessage('');
  }

  function startEdit(product: Product) {
    setEditing(product);
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      minStock: String(product.minStock),
      imageUrl: product.imageUrl || '',
      description: product.description || '',
      isActive: product.isActive,
    });
    setMessage('');
  }

  async function submit() {
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        sku: form.sku,
        name: form.name,
        category: form.category,
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        minStock: Number(form.minStock || 0),
        imageUrl: form.imageUrl,
        description: form.description,
        isActive: form.isActive,
      };

      const res = await fetch(editing ? `/api/products/${editing.id}` : '/api/products', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan produk');

      setMessage(editing ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
      if (!editing) setForm(emptyForm);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product: Product) {
    const ok = window.confirm(`Hapus produk ${product.name}?`);
    if (!ok) return;

    setMessage('');
    const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || 'Gagal menghapus produk');
      return;
    }
    if (editing?.id === product.id) startCreate();
    setMessage('Produk berhasil dihapus');
    await load();
  }

  const isSuccess = message.toLowerCase().includes('berhasil');

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Package size={14} /> Produk</span>
          <h1>Katalog produk</h1>
          <p>Kelola SKU, kategori, harga, status aktif, dan stok awal produk.</p>
        </div>
        <button className="btn btn-primary btn-mobile-full" type="button" onClick={startCreate}>
          <PlusCircle size={17} />
          Tambah Produk
        </button>
      </div>

      <div className="split-grid">
        <section className="section-card">
          <div className="toolbar">
            <div className="section-heading">
              <span className="section-heading-icon"><Save size={20} /></span>
              <div className="section-title">
                <h2>{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
                <p>{editing ? editing.name : 'Produk baru akan masuk ke database.'}</p>
              </div>
            </div>
          </div>

          <div className="form-stack">
            <div className="two-grid">
              <label className="field">
                <span className="field-label">SKU</span>
                <input className="input" value={form.sku} onChange={(event) => setForm((state) => ({ ...state, sku: event.target.value }))} placeholder="AUTO-SKU" />
              </label>
              <label className="field">
                <span className="field-label">Kategori</span>
                <input className="input" list="product-categories" value={form.category} onChange={(event) => setForm((state) => ({ ...state, category: event.target.value }))} placeholder="Contoh: Minuman" />
                <datalist id="product-categories">
                  {categories.map((category) => <option key={category} value={category} />)}
                </datalist>
              </label>
            </div>

            <label className="field">
              <span className="field-label">Nama Produk</span>
              <input className="input" value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} placeholder="Nama produk" />
            </label>

            <div className="two-grid">
              <label className="field">
                <span className="field-label">Harga Jual</span>
                <div className="input-shell has-prefix">
                  <span className="input-prefix">Rp</span>
                  <input className="input" inputMode="numeric" value={formatInputNumber(form.price)} onChange={(event) => setForm((state) => ({ ...state, price: onlyDigits(event.target.value) }))} placeholder="0" />
                </div>
              </label>
              <label className="field">
                <span className="field-label">Minimum Stok</span>
                <input className="input" inputMode="numeric" value={formatInputNumber(form.minStock)} onChange={(event) => setForm((state) => ({ ...state, minStock: onlyDigits(event.target.value) }))} placeholder="0" />
              </label>
            </div>

            {!editing && (
              <label className="field">
                <span className="field-label">Stok Awal</span>
                <input className="input" inputMode="numeric" value={formatInputNumber(form.stock)} onChange={(event) => setForm((state) => ({ ...state, stock: onlyDigits(event.target.value) }))} placeholder="0" />
              </label>
            )}

            {editing && (
              <div className="surface-card" style={{ padding: 14, boxShadow: 'none' }}>
                <div className="mobile-data-row"><span>Stok saat ini</span><strong>{editing.stock} Item</strong></div>
                <div className="mobile-data-row" style={{ marginTop: 10 }}><span>Nilai stok</span><strong>{rupiah(editing.price * editing.stock)}</strong></div>
              </div>
            )}

            <label className="field">
              <span className="field-label"><Image size={14} /> URL Gambar</span>
              <input className="input" value={form.imageUrl} onChange={(event) => setForm((state) => ({ ...state, imageUrl: event.target.value }))} placeholder="https://..." />
            </label>

            <label className="field">
              <span className="field-label">Deskripsi</span>
              <textarea className="textarea" value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} placeholder="Catatan produk" />
            </label>

            <div className="field">
              <span className="field-label">Status Produk</span>
              <div className="segmented">
                <button type="button" className={`segment ${form.isActive ? 'is-active' : ''}`} onClick={() => setForm((state) => ({ ...state, isActive: true }))}>Aktif</button>
                <button type="button" className={`segment ${!form.isActive ? 'is-active' : ''}`} onClick={() => setForm((state) => ({ ...state, isActive: false }))}>Nonaktif</button>
              </div>
            </div>

            <div className="button-row">
              <button className="btn btn-primary btn-mobile-full" type="button" onClick={submit} disabled={saving}>
                {saving ? <span className="button-spinner spinner" /> : <Save size={17} />}
                {saving ? 'Menyimpan...' : editing ? 'Update Produk' : 'Simpan Produk'}
              </button>
              <button className="btn btn-secondary btn-mobile-full" type="button" onClick={startCreate}>
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
              <span className="section-heading-icon"><ShoppingBasket size={20} /></span>
              <div className="section-title">
                <h2>Daftar Produk</h2>
                <p>{products.length} produk tampil</p>
              </div>
            </div>
          </div>

          <div className="toolbar" style={{ alignItems: 'stretch' }}>
            <div className="toolbar-actions" style={{ flex: 1 }}>
              <div className="input-shell" style={{ minWidth: 220, flex: 1 }}>
                <span className="input-icon"><Search size={16} /></span>
                <input className="input" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Cari produk atau SKU" />
              </div>
              <div className="segmented">
                {[
                  { key: 'all', label: 'Semua' },
                  { key: 'active', label: 'Aktif' },
                  { key: 'inactive', label: 'Nonaktif' },
                ].map((item) => (
                  <button key={item.key} type="button" className={`segment ${status === item.key ? 'is-active' : ''}`} onClick={() => setStatus(item.key as 'all' | 'active' | 'inactive')}>
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
              <strong>Memuat produk</strong>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Package size={34} />
              <strong>Belum ada produk</strong>
              <span>Produk baru akan tampil setelah disimpan.</span>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => {
                const badge = stockBadge(product);
                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Package size={46} />
                      )}
                    </div>
                    <div className="product-card-body">
                      <div className="product-title">
                        <div>
                          <h3>{product.name}</h3>
                          <p>{product.sku} · {product.category}</p>
                        </div>
                        <span className={`badge ${product.isActive ? 'badge-income' : 'badge-expense'}`}>
                          {product.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>

                      <div className="product-meta">
                        <div className="meta-box">
                          <span>Harga</span>
                          <strong>{rupiah(product.price)}</strong>
                        </div>
                        <div className="meta-box">
                          <span>Stok</span>
                          <strong>{product.stock} Item</strong>
                        </div>
                      </div>

                      <span className={`badge ${badge.className}`}>{badge.label}</span>

                      <div className="button-row">
                        <button className="btn btn-secondary btn-mobile-full" type="button" onClick={() => startEdit(product)}>
                          <Edit3 size={16} />
                          Edit
                        </button>
                        <button className="btn btn-danger btn-mobile-full" type="button" onClick={() => removeProduct(product)}>
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
