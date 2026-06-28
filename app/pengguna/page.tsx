import {
  KeyRound,
  MoreHorizontal,
  PlusCircle,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';

const users = [
  { name: 'Admin', role: 'Owner', access: 'Semua Modul', status: 'Aktif' },
  { name: 'IBU YUNINGSIH', role: 'Kasir', access: 'Kasir dan Buku Kas', status: 'Aktif' },
  { name: 'KARYAWAN', role: 'Kasir', access: 'Kasir', status: 'Aktif' },
];

export default function PenggunaPage() {
  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Users size={14} /> Pengguna</span>
          <h1>Manajemen akses operator</h1>
          <p>Daftar pengguna dan role tampil dalam layout responsif yang siap dikembangkan.</p>
        </div>
        <button className="btn btn-primary btn-mobile-full" type="button">
          <PlusCircle size={17} />
          Tambah Pengguna
        </button>
      </div>

      <section className="summary-grid summary-scroll">
        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Total Pengguna</p>
              <p className="stat-value">{users.length}</p>
            </div>
            <span className="stat-icon"><Users size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend">Aktif</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <div>
              <p className="stat-label">Role Kasir</p>
              <p className="stat-value">2</p>
            </div>
            <span className="stat-icon"><UserRound size={22} /></span>
          </div>
          <div className="stat-meta"><span className="trend neutral">Operasional</span></div>
        </article>
        <article className="stat-card premium-panel" style={{ color: '#fff' }}>
          <div className="stat-top">
            <div>
              <p className="stat-label" style={{ color: 'rgba(255,255,255,0.68)' }}>Keamanan</p>
              <p className="stat-value" style={{ color: '#bbf7d0' }}>PIN</p>
            </div>
            <span className="stat-icon" style={{ color: '#bbf7d0', background: 'rgba(255,255,255,0.12)' }}><ShieldCheck size={22} /></span>
          </div>
        </article>
      </section>

      <section className="section-card">
        <div className="toolbar">
          <div className="section-heading">
            <span className="section-heading-icon"><KeyRound size={20} /></span>
            <div className="section-title">
              <h2>Daftar Pengguna</h2>
              <p>Role dan akses disusun agar mudah dipindai.</p>
            </div>
          </div>
        </div>

        <div className="data-table-wrap desktop-table">
          <table className="data-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Role</th>
                <th>Akses</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.name}>
                  <td style={{ fontWeight: 900 }}>{user.name}</td>
                  <td>{user.role}</td>
                  <td style={{ color: '#6b7280', fontWeight: 750 }}>{user.access}</td>
                  <td><span className="badge badge-income">{user.status}</span></td>
                  <td style={{ textAlign: 'right' }}><button className="btn btn-secondary btn-icon" type="button" aria-label={`Aksi ${user.name}`}><MoreHorizontal size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-card-list">
          {users.map((user) => (
            <article className="mobile-data-card" key={user.name}>
              <div className="mobile-data-row"><span>Nama</span><strong>{user.name}</strong></div>
              <div className="mobile-data-row"><span>Role</span><strong>{user.role}</strong></div>
              <div className="mobile-data-row"><span>Akses</span><strong>{user.access}</strong></div>
              <div className="mobile-data-row"><span>Status</span><strong><span className="badge badge-income">{user.status}</span></strong></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
