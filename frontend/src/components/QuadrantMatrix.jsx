import React from 'react';
import { formatRupiah, formatPercent, getQuadrantMeta } from '../utils/formatters';
import { Compass, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function QuadrantMatrix({ quadrants, selectedProvince, onSelectProvince }) {
  if (!quadrants?.length) return null;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-txt-primary">Matriks 4 Kuadran Kebijakan</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-100">
              Tipologi Wilayah Susenas 2025
            </span>
          </div>
          <p className="text-[12px] text-txt-muted mt-0.5">
            Dikelompokkan berdasarkan Median Total (Rp 1.495.638) dan Median Porsi Makanan (51.21%)
          </p>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-txt-secondary font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-800" />
          <span>Total: 38 Provinsi Terpetakan</span>
        </div>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b border-surface-border">
        {quadrants.map((q, idx) => {
          const meta = getQuadrantMeta(q.kuadran);
          const isBottom = idx >= 2;

          return (
            <div
              key={q.kuadran}
              className={`p-6 transition-all ${isBottom ? 'border-t border-surface-border' : ''} hover:bg-surface-ground/50`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] shadow-soft"
                    style={{ backgroundColor: meta.softBg, color: meta.color, border: `1px solid ${meta.border}` }}
                  >
                    Q{q.kuadran}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-txt-primary">{q.nama}</h3>
                    <p className="text-[11px] text-txt-muted">{q.karakteristik}</p>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.bg}`}>
                  {q.jumlah_provinsi} Provinsi
                </span>
              </div>

              {/* Rerata Metrics */}
              <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-surface-ground border border-surface-border">
                <div>
                  <span className="text-[11px] text-txt-muted block">Rerata Pengeluaran</span>
                  <p className="text-[14px] font-extrabold text-forest-800 font-sans mt-0.5">
                    {formatRupiah(q.rata_rata_total)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-txt-muted block">Rerata Porsi Pangan</span>
                  <p className="text-[14px] font-extrabold text-txt-primary font-sans mt-0.5">
                    {formatPercent(q.rata_rata_persen_makanan)}
                  </p>
                </div>
              </div>

              {/* Rekomendasi Inti */}
              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-wider text-txt-muted font-bold block mb-1">
                  Arah Intervensi Utama:
                </span>
                <p className="text-[12px] text-txt-secondary leading-relaxed line-clamp-2" title={q.rekomendasi_strategis}>
                  {q.rekomendasi_strategis}
                </p>
              </div>

              {/* Province Chips */}
              <div>
                <span className="text-[11px] uppercase tracking-wider text-txt-muted font-bold block mb-2">
                  Daftar Provinsi ({q.jumlah_provinsi}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(q.provinsi_items || []).map((prov) => {
                    const isSel = selectedProvince?.provinsi_id === prov.provinsi_id;
                    return (
                      <button
                        key={prov.provinsi_id}
                        onClick={() => onSelectProvince?.(prov.provinsi_id)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg transition-all font-medium border ${
                          isSel
                            ? 'bg-forest-800 text-white border-forest-800 shadow-soft'
                            : 'bg-white text-txt-secondary border-surface-border hover:border-forest-600 hover:text-forest-800 hover:bg-forest-50/50'
                        }`}
                      >
                        {prov.provinsi}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
