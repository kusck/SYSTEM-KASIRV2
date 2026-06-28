import {
  Edit3,
  Package,
  PlusCircle,
  Search,
  ShoppingBasket,
  Trash2,
} from 'lucide-react';
import { rupiah } from '@/lib/format';

const products = [
  { name: 'Produk Retail Utama', category: 'Katalog', price: 0, stock: 0, status: 'Template' },
  { name: 'Paket Penjualan Cepat', category: 'Bundling', price: 0, stock: 0, status: 'Template' },
  { name: 'Item Stok Harian', category: 'Operasional', price: 0, stock: 0, status: 'Template' },
  { name: 'Produk Konsinyasi', category: 'Mitra', price: 0, stock: 0, status: 'Template' },
];

export default function ProdukPage() {
  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Package size={14} /> Produk</span>
          <h1>Katalog produk premium</h1>
          <p>UI katalog produk sudah responsif dengan card, image placeholder, harga, stok, dan aksi cepat.</p>
        </div>
        <button className="btn btn-primary btn-mobile-full" type="button">
          <PlusCircle size={17} />
          Tambah Produk
        </button>
      </div>

      <section className="section-card">
        <div className="toolbar">
          <div className="section-heading">
            <span className="section-heading-icon"><ShoppingBasket size={20} /></span>
            <div className="section-title">
              <h2>Daftar Produk</h2>
              <p>Card otomatis menyesuaikan desktop, tablet, dan mobile.</p>
            </div>
          </div>
          <div className="input-shell" style={{ minWidth: 260 }}>
            <span className="input-icon"><Search size={16} /></span>
            <input className="input" placeholder="Cari produk..." />
          </div>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-image">
                <Package size={46} />
              </div>
              <div className="product-card-body">
                <div className="product-title">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.category}</p>
                  </div>
                  <span className="badge badge-info">{product.status}</span>
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

                <div className="button-row">
                  <button className="btn btn-secondary btn-mobile-full" type="button">
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button className="btn btn-danger btn-mobile-full" type="button">
                    <Trash2 size={16} />
                    Hapus
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
