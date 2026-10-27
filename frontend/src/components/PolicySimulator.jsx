import React, { useState, useMemo } from 'react';
import { RotateCcw, ArrowRight, CheckCircle2, Sliders, TrendingUp, Sparkles, Building, ArrowUpRight } from 'lucide-react';
import { formatRupiah, formatPercent, getQuadrantMeta } from '../utils/formatters';

const POLICY_RECS = {
  I: [
    'Penyaluran bantuan sosial pangan beras & sembako reguler terfokus rumah tangga desil 1-4',
    'Program stimulus padat karya tunai desa (PKTD) untuk mendorong pendapatan riil perdesaan',
    'Penguatan cadangan pangan pemerintah daerah (CPPD) untuk mengantisipasi gejolak harga pangan',
  ],
  II: [
    'Subsidi biaya logistik kargo udara perintis (Tol Udara Pangan) ke bandara pedalaman',
    'Pembangunan hub cold-chain logistics di titik simpul bandara/pelabuhan transit',
    'Pengembangan dan industrialisasi pangan lokal endemik (sagu, hipere/ubi jalar lokal)',
  ],
  III: [
    'Akselerasi hilirisasi dan industrialisasi berbasis komoditas pertanian lokal',
    'Peningkatan infrastruktur sanitasi, air bersih, dan akses pasar perdesaan',
    'Pemberdayaan klaster UMKM pangan olahan dan formalisasi tenaga kerja informal',
  ],
  IV: [
    'Pengendalian inflasi biaya hidup perkotaan (housing affordability & rusunawa sewa terjangkau)',
    'Subsidi integrasi tarif angkutan umum massal antarmoda perkotaan',
    'Pengawasan tarif jasa utilitas (listrik, air, telekomunikasi) bagi masyarakat kelas menengah',
  ],
};

export default function PolicySimulator({ provinces, selectedProvince, onSelectProvince, medianTotal, medianPangan }) {
  const [selectedId, setSelectedId] = useState(selectedProvince?.provinsi_id || 'ID-PP');
  const [foodCut, setFoodCut] = useState(25);
  const [incomeBoost, setIncomeBoost] = useState(10);

  React.useEffect(() => {
    if (selectedProvince && selectedProvince.provinsi_id !== selectedId) {
      setSelectedId(selectedProvince.provinsi_id);
    }
  }, [selectedProvince]);

  const prov = useMemo(() => provinces.find(p => p.provinsi_id === selectedId) || provinces[0], [provinces, selectedId]);

  const sim = useMemo(() => {
    if (!prov) return null;
    const mt = medianTotal || 1495638;
    const mp = medianPangan || 51.21;

    const newMkn = Math.round(prov.pengeluaran_makanan * (1 - foodCut / 100));
    const newNmkn = Math.round(prov.pengeluaran_non_makanan * (1 + incomeBoost / 100));
    const newTot = newMkn + newNmkn;
    const newPm = +((newMkn / newTot) * 100).toFixed(2);

    let newQ = 'IV';
    if (newTot < mt && newPm > mp) newQ = 'I';
    else if (newTot >= mt && newPm > mp) newQ = 'II';
    else if (newTot < mt && newPm <= mp) newQ = 'III';

    return {
      newMkn, newNmkn, newTot, newPm, newQ,
      shifted: prov.kuadran !== newQ,
      savings: prov.pengeluaran_makanan - newMkn,
      pctPanganChange: (newPm - prov.persen_makanan).toFixed(2),
    };
  }, [prov, foodCut, incomeBoost, medianTotal, medianPangan]);

  if (!prov || !sim) return null;

  const oldMeta = getQuadrantMeta(prov.kuadran);
  const newMeta = getQuadrantMeta(sim.newQ);
  const recs = POLICY_RECS[prov.kuadran] || [];

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-txt-primary">Simulator Intervensi Kebijakan</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-100">
              Model Simulasi Dinamis
            </span>
          </div>
          <p className="text-[12px] text-txt-muted mt-0.5">
            Uji dampak efisiensi logistik pangan dan stimulus upah terhadap pergeseran kuadran provinsi
          </p>
        </div>

        {/* Province Picker */}
        <select
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); onSelectProvince?.(e.target.value); }}
          className="bg-white text-txt-primary text-[12px] font-semibold rounded-full px-4 py-2 border border-surface-border shadow-soft focus:outline-none focus:ring-2 focus:ring-forest-800/20 cursor-pointer"
        >
          {provinces.map((p) => (
            <option key={p.provinsi_id} value={p.provinsi_id}>
              {p.provinsi} (Q{p.kuadran} - {formatPercent(p.persen_makanan)})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-surface-border">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase font-bold tracking-wider text-txt-muted">
              Parameter Intervensi
            </span>
            <button 
              onClick={() => { setFoodCut(25); setIncomeBoost(10); }}
              className="text-[11px] text-forest-800 font-medium hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Default
            </button>
          </div>

          {/* Slider 1: Food Cost Reduction */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[13px] font-semibold text-txt-primary">
                Efisiensi / Subsidi Logistik Pangan
              </span>
              <span className="text-[13px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                -{foodCut}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={foodCut}
              onChange={(e) => setFoodCut(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-txt-muted">
              <span>0% (Status Quo)</span>
              <span>-25% (Rekomendasi Tol Udara)</span>
              <span>-50% (Subsidi Penuh)</span>
            </div>
          </div>

          {/* Slider 2: Non-Food Income Boost */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[13px] font-semibold text-txt-primary">
                Stimulus Daya Beli & Upah Riil
              </span>
              <span className="text-[13px] font-extrabold text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-100">
                +{incomeBoost}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={incomeBoost}
              onChange={(e) => setIncomeBoost(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-txt-muted">
              <span>0% (Tetap)</span>
              <span>+15% (Upah Padat Karya)</span>
              <span>+30% (Akselerasi)</span>
            </div>
          </div>

          {/* Policy Recommendations for Current Province */}
          <div className="p-4 rounded-xl bg-surface-ground border border-surface-border">
            <p className="text-[11px] uppercase font-bold tracking-wider text-forest-800 mb-2">
              Paket Rekomendasi Kebijakan Bappenas:
            </p>
            <ul className="space-y-2 text-[12px] text-txt-secondary">
              {recs.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase font-bold tracking-wider text-txt-muted">
              Proyeksi Hasil Simulasi
            </span>
            {sim.shifted ? (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Terjadi Pergeseran Kuadran!
              </span>
            ) : (
              <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                Posisi Kuadran Tetap
              </span>
            )}
          </div>

          {/* Before & After Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Before Box */}
            <div className="p-4 rounded-2xl bg-surface-ground border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-txt-muted font-bold uppercase">Kondisi Aktual 2025</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${oldMeta.bg}`}>
                  Q{prov.kuadran}
                </span>
              </div>
              <div>
                <p className="text-xl font-extrabold text-txt-primary font-sans">
                  {formatRupiah(prov.pengeluaran_total)}
                </p>
                <p className="text-[12px] text-txt-muted">per kapita sebulan</p>
              </div>
              <div className="space-y-1 text-[11px] text-txt-secondary pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Porsi Makanan:</span>
                  <strong className="text-txt-primary">{formatPercent(prov.persen_makanan)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Makanan:</span>
                  <span>{formatRupiah(prov.pengeluaran_makanan)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Non-Makanan:</span>
                  <span>{formatRupiah(prov.pengeluaran_non_makanan)}</span>
                </div>
              </div>
            </div>

            {/* After Box */}
            <div className="p-4 rounded-2xl bg-white border-2 border-forest-800/20 shadow-soft space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-forest-800 font-bold uppercase">Hasil Simulasi</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${newMeta.bg}`}>
                  Q{sim.newQ}: {newMeta.title}
                </span>
              </div>
              <div>
                <p className="text-xl font-extrabold text-forest-800 font-sans">
                  {formatRupiah(sim.newTot)}
                </p>
                <p className="text-[12px] text-txt-muted">total tertata ulang</p>
              </div>
              <div className="space-y-1 text-[11px] text-txt-secondary pt-2 border-t border-surface-border">
                <div className="flex justify-between">
                  <span>Porsi Makanan Baru:</span>
                  <strong className="text-forest-800 font-bold">{formatPercent(sim.newPm)} ({sim.pctPanganChange}%)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Makanan Baru:</span>
                  <span>{formatRupiah(sim.newMkn)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Non-Makanan Baru:</span>
                  <span>{formatRupiah(sim.newNmkn)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Efficiency Summary Pill */}
          <div className="p-4 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-mint-300 flex items-center justify-center font-bold">
                Rp
              </div>
              <div>
                <p className="text-[13px] font-bold text-forest-900">
                  Potensi Penghematan Belanja Pangan: {formatRupiah(sim.savings)} / kapita / bln
                </p>
                <p className="text-[11px] text-txt-secondary">
                  Dapat dialihkan untuk tabungan, pendidikan, atau kebutuhan produktif non-makanan.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
