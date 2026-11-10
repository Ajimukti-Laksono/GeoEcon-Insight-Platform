import { CheckCircle2, Database, Download, ExternalLink, FileSpreadsheet, ShieldCheck, X } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const BPS_MAIN_URL = 'https://www.bps.go.id';
const BPS_AVG_TABLE_URL =
  'https://www.bps.go.id/id/statistics-table/1/OTQ1IzE=/rata---rata-pengeluaran-per-kapita-sebulan-untuk-makanan-dan-bukan-makanan-di-daerah-perkotaan-dan-perdesaan-menurut-provinsi--rupiah---2011-2024.html';
const BPS_SHARE_TABLE_URL =
  'https://www.bps.go.id/id/statistics-table/3/YkhNcmNWWllSVFZNVEcxWUwxb3dNWHA2VXk5V2R6MDkjMw==/persentase-pengeluaran-per-kapita-sebulan-makanan-dan-bukan-makanan-di-daerah-perkotaan-dan-perdesaan-menurut-provinsi.html';

export default function SourceModal({ open, onClose, sources }) {
  if (!open) return null;

  const files = sources?.files || [
    {
      key: 'total_2024',
      filename: 'Rata-rata Pengeluaran per Kapita Sebulan Makanan dan Bukan Makanan di Daerah Perkotaan dan Perdesaan Menurut Provinsi (rupiah), 2024.csv',
      title: 'Rata-Rata Pengeluaran per Kapita Sebulan Untuk Makanan dan Bukan Makanan di Daerah Perkotaan dan Perdesaan Menurut Provinsi (rupiah), 2024',
      year: 2024,
      bps_url: BPS_AVG_TABLE_URL,
      download_url: '/api/sources/download/total_2024',
    },
    {
      key: 'total_2025',
      filename: 'Rata-rata Pengeluaran per Kapita Sebulan Makanan dan Bukan Makanan di Daerah Perkotaan dan Perdesaan Menurut Provinsi (rupiah), 2025.csv',
      title: 'Rata-Rata Pengeluaran per Kapita Sebulan Untuk Makanan dan Bukan Makanan di Daerah Perkotaan dan Perdesaan Menurut Provinsi (rupiah), 2025',
      year: 2025,
      bps_url: BPS_AVG_TABLE_URL,
      download_url: '/api/sources/download/total_2025',
    },
    {
      key: 'share_2025',
      filename: 'Persentase Pengeluaran per Kapita Sebulan Makanan dan Bukan Makanan di Daerah Perkotaan dan Perdesaan Menurut Provinsi, 2025.csv',
      title: 'Persentase Pengeluaran per Kapita Sebulan Makanan dan Bukan Makanan di Daerah Perkotaan dan Perdesaan Menurut Provinsi, 2025',
      year: 2025,
      bps_url: BPS_SHARE_TABLE_URL,
      download_url: '/api/sources/download/share_2025',
    },
  ];

  return (
    <div className="source-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="source-modal-title" onClick={onClose}>
      <div className="source-modal" onClick={e => e.stopPropagation()}>
        <div className="source-modal-head">
          <div className="source-modal-badge">
            <ShieldCheck size={18} />
            <div>
              <span className="source-eyebrow">VERIFIKASI SUMBER DATA RESMI</span>
              <h2 id="source-modal-title">Dataset Resmi Badan Pusat Statistik (BPS)</h2>
            </div>
          </div>
          <button className="source-close" onClick={onClose} aria-label="Tutup dialog sumber data">
            <X size={18} />
          </button>
        </div>

        <div className="source-modal-body">
          <div className="source-summary-box">
            <div className="source-summary-item">
              <CheckCircle2 size={16} />
              <div>
                <strong>{sources?.institution || 'Badan Pusat Statistik (BPS) Republik Indonesia'}</strong>
                <p>{sources?.survey || 'Survei Sosial Ekonomi Nasional (Susenas) Maret 2024–2025 · 38 Provinsi'}</p>
              </div>
            </div>
            <div className="source-portal-actions">
              <a href={sources?.portal_url || BPS_MAIN_URL} target="_blank" rel="noopener noreferrer" className="bps-btn-primary">
                Portal Resmi BPS (bps.go.id) <ExternalLink size={13} />
              </a>
              <a href={sources?.statistics_catalog_url || 'https://www.bps.go.id/id/statistics-table'} target="_blank" rel="noopener noreferrer" className="bps-btn-outline">
                Katalog Tabel Statistik <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <div className="source-section-label">
            <Database size={14} />
            <span>3 BERKAS DATASET ASLI YANG DIPROSES BACKEND</span>
          </div>

          <div className="source-file-list">
            {files.map(file => (
              <article className="source-file-card" key={file.key}>
                <div className="source-file-top">
                  <span className="source-file-icon"><FileSpreadsheet size={16} /></span>
                  <div className="source-file-info">
                    <div className="source-file-meta">
                      <span className="source-year-pill">SUSENAS {file.year}</span>
                      <span className="source-origin-pill">BPS.GO.ID</span>
                    </div>
                    <h3>{file.title}</h3>
                    <code>{file.filename}</code>
                  </div>
                </div>
                <div className="source-file-actions">
                  <a href={file.bps_url} target="_blank" rel="noopener noreferrer" className="bps-link-chip">
                    <ExternalLink size={12} /> Cek Tabel di BPS
                  </a>
                  <a href={`${API_BASE_URL}${file.download_url}`} download={file.filename} className="bps-download-chip">
                    <Download size={12} /> Unduh CSV Mentah
                  </a>
                </div>
              </article>
            ))}
          </div>

          <p className="source-footnote">
            Seluruh indikator (pengeluaran total, porsi makanan/non-makanan, median antarprovinsi, dan korelasi Hukum Engel)
            dihitung secara deterministik oleh backend dari tiga berkas CSV resmi BPS di atas tanpa mengubah angka dasar.
          </p>
        </div>
      </div>
    </div>
  );
}

