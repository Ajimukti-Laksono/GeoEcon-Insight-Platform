import React from 'react';
import { X, Sliders, MapPin, Building, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatRupiah, formatPercent, getQuadrantMeta } from '../utils/formatters';

export default function ProvinceDetailModal({ province, onClose, onOpenSimulator, medianTotal, medianPangan }) {
  if (!province) return null;
  const q = getQuadrantMeta(province.kuadran);
  const medTot = medianTotal || 1495638;
  const devRp = province.pengeluaran_total - medTot;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white border border-surface-border max-w-lg w-full rounded-[24px] p-6 space-y-5 shadow-card-hover relative" 
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-ground hover:bg-slate-200 text-txt-secondary flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="pr-10">
          <div className="flex items-center gap-2 text-[12px] text-txt-muted mb-1">
            <span className="font-mono font-bold text-forest-800">{province.provinsi_id}</span>
            {province.pulau && (
              <>
                <span>•</span>
                <span>{province.pulau}</span>
              </>
            )}
            {province.kode_bps && (
              <>
                <span>•</span>
                <span>Kode BPS: {province.kode_bps}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-txt-primary tracking-tight font-sans">
              {province.provinsi}
            </h2>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${q.bg}`}>
              Kuadran {province.kuadran}: {q.title}
            </span>
          </div>
        </div>

        {/* Expenditure Ratio Bar */}
        <div className="bg-surface-ground rounded-2xl p-4 space-y-2.5 border border-surface-border">
          <div className="flex justify-between text-[12px]">
            <span className="text-amber-800 font-bold">
              Makanan: {formatPercent(province.persen_makanan)}
            </span>
            <span className="text-forest-800 font-bold">
              Non-Makanan: {formatPercent(province.persen_non_makanan)}
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
            <div style={{ width: `${province.persen_makanan}%` }} className="bg-amber-500 transition-all" />
            <div style={{ width: `${province.persen_non_makanan}%` }} className="bg-forest-800 transition-all" />
          </div>

          <div className="flex justify-between items-baseline text-[11px] text-txt-muted pt-1">
            <span>
              Total: <strong className="text-forest-800 font-sans text-[13px]">{formatRupiah(province.pengeluaran_total)}</strong> / kapita / bln
            </span>
            <span>
              Peringkat Nasional: <strong className="text-txt-primary">#{province.rank_total || '-'} dari 38</strong>
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-[12px]">
          <div className="bg-white border border-surface-border rounded-xl p-3 shadow-soft">
            <span className="text-txt-muted text-[11px] font-medium block">vs Median Nasional</span>
            <p className={`font-extrabold font-sans text-[14px] mt-0.5 ${devRp >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {devRp >= 0 ? '+' : ''}{formatRupiah(devRp)}
            </p>
          </div>

          <div className="bg-white border border-surface-border rounded-xl p-3 shadow-soft">
            <span className="text-txt-muted text-[11px] font-medium block">Prediksi Kurva Engel</span>
            <p className="text-forest-800 font-extrabold font-sans text-[14px] mt-0.5">
              {formatPercent(province.engel_predicted_persen_makanan)}
            </p>
          </div>

          <div className="bg-white border border-surface-border rounded-xl p-3 shadow-soft">
            <span className="text-txt-muted text-[11px] font-medium block">Residual Deviasi Engel</span>
            <p className={`font-extrabold font-sans text-[14px] mt-0.5 ${province.engel_residual > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {province.engel_residual > 0 ? '+' : ''}{province.engel_residual}%
            </p>
          </div>

          <div className="bg-white border border-surface-border rounded-xl p-3 shadow-soft">
            <span className="text-txt-muted text-[11px] font-medium block">Tipologi Wilayah</span>
            <p className="text-txt-primary font-bold text-[13px] mt-0.5 truncate">
              {province.kategori_wilayah}
            </p>
          </div>
        </div>

        {/* Policy Recommendation */}
        <div className="border-t border-surface-border pt-3">
          <span className="text-[11px] uppercase tracking-wider text-txt-muted font-bold block mb-1">
            Rekomendasi Kebijakan Bappenas:
          </span>
          <p className="text-[12px] text-txt-secondary leading-relaxed bg-forest-50/60 p-3 rounded-xl border border-forest-100">
            {province.rekomendasi_utama}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => { onClose(); onOpenSimulator?.(province.provinsi_id); }}
            className="flex-1 py-2.5 px-4 rounded-full bg-forest-800 hover:bg-forest-700 text-white text-[12px] font-semibold transition-all shadow-soft flex items-center justify-center gap-2"
          >
            <Sliders className="w-3.5 h-3.5 text-mint-300" />
            <span>Uji Intervensi di Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onClose} 
            className="py-2.5 px-4 rounded-full bg-surface-ground hover:bg-slate-200 text-txt-secondary text-[12px] font-medium transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
