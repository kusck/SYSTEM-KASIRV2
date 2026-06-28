import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  PackageCheck,
  PlusCircle,
  Search,
  Truck,
} from 'lucide-react';

const stockRows = [
  { item: 'Produk Retail Utama', sku: 'SKU-001', stock: 0, min: 12, status: 'Perlu Restock' },
  { item: 'Paket Penjualan Cepat', sku: 'SKU-002', stock: 0, min: 8, status: 'Perlu Restock' },
  { item: 'Item Stok Harian', sku: 'SKU-003', stock: 0, min: 20, status: 'Perlu Restock' },
];

export default function StokPage() {
  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Boxes size={14} /> Stok</span>
          <h1>Monitoring stok barang</h1>
          <p>Layout inventori responsif untuk status stok, minimum stok, dan restock cepat.</p>
        </div>
        <button className="btn btn-primary btn-mobile-full" type="button">
          <PlusCircle size={17} />
          Tambah Stok
        </button>
      </div>

      <section className="summary-grid summary-scroll">
        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Total SKU</p>
              <p className="stat-value">0</p>
            </div>
            <span className="stat-icon"><PackageCheck size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend neutral">Template</span></div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Perlu Restock</p>
              <p className="stat-value" style={{ color: '#b45309' }}>3</p>
            </div>
            <span className="stat-icon" style={{ color: '#b45309', background: 'rgba(245,158,11,0.12)' }}><AlertTriangle size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend neutral">Pantau</span></div>
        </article>

        <article className="stat-card premium-panel" style={{ color: '#fff' }}>
          <div className="stat-top">
            <div>
              <p className="stat-label" style={{ color: 'rgba(255,255,255,0.68)' }}>Barang Masuk</p>
              <p className="stat-value" style={{ color: '#bbf7d0' }}>0</p>
            </div>
            <span className="stat-icon" style={{ color: '#bbf7d0', background: 'rgba(255,255,255,0.12)' }}><Truck size={22} /></span>
          </div>
        </article>
      </section>

      <section className="section-card">
        <div className="toolbar">
          <div className="section-heading">
            <span className="section-heading-icon"><ClipboardList size={20} /></span>
            <div className="section-title">
              <h2>Daftar Stok</h2>
              <p>Di layar kecil tabel berubah menjadi card list.</p>
            </div>
          </div>
          <div className="input-shell" style={{ minWidth: 260 }}>
            <span className="input-icon"><Search size={16} /></span>
            <input className="input" placeholder="Cari stok..." />
          </div>
        </div>

        <div className="data-table-wrap desktop-table">
          <table className="data-table" style={{ minWidth: 680 }}>
            <thead>
              <tr>
                <th>Produk</th>
                <th>SKU</th>
                <th>Stok</th>
                <th>Minimum</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stockRows.map((item) => (
                <tr key={item.sku}>
                  <td style={{ fontWeight: 900 }}>{item.item}</td>
                  <td style={{ color: '#6b7280', fontWeight: 750 }}>{item.sku}</td>
                  <td style={{ fontWeight: 900 }}>{item.stock}</td>
                  <td>{item.min}</td>
                  <td><span className="badge badge-warning">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-card-list">
          {stockRows.map((item) => (
            <article className="mobile-data-card" key={item.sku}>
              <div className="mobile-data-row"><span>Produk</span><strong>{item.item}</strong></div>
              <div className="mobile-data-row"><span>SKU</span><strong>{item.sku}</strong></div>
              <div className="mobile-data-row"><span>Stok</span><strong>{item.stock}</strong></div>
              <div className="mobile-data-row"><span>Minimum</span><strong>{item.min}</strong></div>
              <div className="mobile-data-row"><span>Status</span><strong><span className="badge badge-warning">{item.status}</span></strong></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
