import React from 'react';
import { formatRupiah, formatPercent } from '../utils/formatters';
import { 
  ArrowUpRight, ArrowDownRight, TrendingDown, 
  Coins, PieChart, AlertTriangle, ChevronRight
} from 'lucide-react';

export default function KPICards({ summary, onSelectProvince }) {
  if (!summary) return null;

  return (
    <div className="space-y-6">
      
      {/* Top Hero Section — Forest Green Featured Card + 3 Clean Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Featured Card (Directly inspired by reference dark card) */}
        <div 
          style={{ background: 'linear-gradient(135deg, #143D30 0%, #0C261C 100%)' }}
          className="lg:col-span-5 text-white rounded-[22px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between border border-emerald-900/30"
        >
          {/* Subtle Organic Background Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#9FE870]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Header chip & signal icon */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9FE870] animate-pulse" />
                <span className="text-[12px] font-bold text-[#D4F7C5] tracking-wide uppercase">
                  Benchmark Nasional
                </span>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-5 bg-[#9FE870]/40 rounded-full" />
                <div className="w-1.5 h-5 bg-[#9FE870]/70 rounded-full" />
                <div className="w-1.5 h-5 bg-[#9FE870] rounded-full" />
              </div>
            </div>

            <p className="text-[13px] text-emerald-100 font-semibold">Median Pengeluaran Per Kapita Sebulan</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-white drop-shadow-sm">
                {formatRupiah(summary.median_pengeluaran_total)}
              </h2>
            </div>
            <p className="text-[12px] text-emerald-200/80 mt-1 font-medium">
              Ambang batas garis pembagi kuadran konsumsi (38 Provinsi BPS)
            </p>
          </div>

          {/* Quick Action Navigation Pills */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/15">
            <p className="text-[11px] text-[#D4F7C5] uppercase font-bold tracking-wider mb-2.5">
              Sorotan Ekstrem & Anomali
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSelectProvince?.(summary.provinsi_tertinggi_total?.provinsi_id)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-2.5 px-2.5 text-center transition-all group border border-white/15 cursor-pointer"
              >
                <div className="text-[10px] text-[#9FE870] font-bold">Tertinggi</div>
                <div className="text-[11px] font-bold truncate mt-0.5 text-white">DKI Jakarta</div>
              </button>

              <button
                onClick={() => onSelectProvince?.(summary.provinsi_terendah_total?.provinsi_id)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-2.5 px-2.5 text-center transition-all group border border-white/15 cursor-pointer"
              >
                <div className="text-[10px] text-rose-300 font-bold">Terendah</div>
                <div className="text-[11px] font-bold truncate mt-0.5 text-white">NTT</div>
              </button>

              <button
                onClick={() => onSelectProvince?.('ID-PP')}
                className="bg-[#9FE870] text-[#071E15] font-extrabold hover:bg-[#8EE05E] rounded-xl py-2.5 px-2.5 text-center transition-all shadow-md cursor-pointer"
              >
                <div className="text-[10px] text-[#0C261C] font-black">Anomali 3TP</div>
                <div className="text-[11px] font-black truncate mt-0.5">P. Pegunungan</div>
              </button>
            </div>
          </div>

        </div>

        {/* 3 Clean High-Contrast White KPI Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Proporsi Pangan */}
          <div className="card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#EAF6EE] text-[#143D30] flex items-center justify-center border border-[#D1E7DD]">
                <PieChart className="w-5 h-5 text-[#143D30]" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Pangan
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[12px] text-slate-500 font-bold">Median Porsi Makanan</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-sans">
                {formatPercent(summary.median_proporsi_pangan)}
              </h3>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">
                Garis batas horizontal ketahanan pangan
              </p>
            </div>
          </div>

          {/* Card 2: Validasi Hukum Engel */}
          <div className="card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
                <TrendingDown className="w-5 h-5 text-teal-700" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                r = {summary.korelasi_engel_r}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[12px] text-slate-500 font-bold">Validasi Hukum Engel</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-sans">
                {((summary.korelasi_engel_r2 || 0) * 100).toFixed(1)}% <span className="text-sm font-semibold text-slate-500">R²</span>
              </h3>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">
                Hubungan negatif kuat & terverifikasi
              </p>
            </div>
          </div>

          {/* Card 3: Rasio Disparitas */}
          <div className="card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
                <Coins className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Kesenjangan
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[12px] text-slate-500 font-bold">Disparitas Antarwilayah</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-sans">
                {summary.disparitas_rasio}× <span className="text-sm font-semibold text-slate-500">lipat</span>
              </h3>
              <p className="text-[11px] text-slate-600 mt-1 font-medium truncate" title={formatRupiah(summary.disparitas_selisih_rp)}>
                Selisih {formatRupiah(summary.disparitas_selisih_rp)}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Extreme Provinces Comparison Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* DKI Jakarta Card */}
        <div 
          onClick={() => onSelectProvince?.(summary.provinsi_tertinggi_total?.provinsi_id)}
          className="card p-5 cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-[12px] font-bold text-emerald-800 uppercase tracking-wide">
                Pengeluaran Tertinggi Nasional
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Peringkat #1
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-xl font-extrabold text-slate-900 group-hover:text-[#143D30] transition-colors">
              {summary.provinsi_tertinggi_total?.provinsi}
            </h4>
            <span className="text-xl font-extrabold text-[#143D30] font-sans">
              {formatRupiah(summary.provinsi_tertinggi_total?.nilai)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
              <span>Makanan: <strong className="text-slate-900 font-extrabold">{formatPercent(summary.provinsi_tertinggi_total?.persen_makanan)}</strong></span>
              <span>Non-Makanan: <strong className="text-emerald-800 font-extrabold">61.07%</strong></span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div style={{ width: '38.93%' }} className="bg-amber-400" />
              <div style={{ width: '61.07%' }} className="bg-emerald-700" />
            </div>
          </div>

          <p className="text-[12px] text-slate-600 mt-3 leading-relaxed font-medium">
            Struktur pengeluaran didominasi kebutuhan non-makanan perkotaan (biaya sewa hunian, jasa utilitas, dan transportasi).
          </p>
        </div>

        {/* NTT Card */}
        <div 
          onClick={() => onSelectProvince?.(summary.provinsi_terendah_total?.provinsi_id)}
          className="card p-5 cursor-pointer hover:border-rose-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span className="text-[12px] font-bold text-rose-800 uppercase tracking-wide">
                Pengeluaran Terendah Nasional
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Peringkat #38
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-xl font-extrabold text-slate-900 group-hover:text-rose-800 transition-colors">
              {summary.provinsi_terendah_total?.provinsi}
            </h4>
            <span className="text-xl font-extrabold text-rose-700 font-sans">
              {formatRupiah(summary.provinsi_terendah_total?.nilai)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
              <span>Makanan: <strong className="text-rose-800 font-extrabold">{formatPercent(summary.provinsi_terendah_total?.persen_makanan)}</strong></span>
              <span>Non-Makanan: <strong className="text-slate-900 font-extrabold">45.20%</strong></span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div style={{ width: '54.80%' }} className="bg-rose-500" />
              <div style={{ width: '45.20%' }} className="bg-slate-300" />
            </div>
          </div>

          <p className="text-[12px] text-slate-600 mt-3 leading-relaxed font-medium">
            Daya beli riil per kapita terendah di Indonesia — lebih dari separuh pendapatan terserap untuk memenuhi pangan pokok harian.
          </p>
        </div>

      </div>

      {/* Anomaly Spotlight Card — Papua Pegunungan (Cost-Push Inflation) */}
      <div 
        onClick={() => onSelectProvince?.('ID-PP')}
        className="card p-5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border-l-4 border-l-amber-500 cursor-pointer hover:shadow-lg transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-extrabold text-amber-950">
                  Deteksi Anomali 3TP: Papua Pegunungan
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Kuadran II
                </span>
              </div>
              <p className="text-[12px] text-slate-700 mt-1 leading-relaxed max-w-3xl font-medium">
                Pengeluaran makanan mencapai <strong className="text-slate-900">64.71% ({formatRupiah(1256747)})</strong> — tertinggi di seluruh Indonesia.
                Tingginya porsi pangan di wilayah ini bukan tanda kemakmuran, melainkan anomali akibat <em>cost-push inflation</em> dan distorsi logistik kargo udara pegunungan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-[12px] font-bold text-amber-900 group-hover:underline">
              Buka Lembar Analisis
            </span>
            <ChevronRight className="w-4 h-4 text-amber-800" />
          </div>
        </div>
      </div>

    </div>
  );
}
