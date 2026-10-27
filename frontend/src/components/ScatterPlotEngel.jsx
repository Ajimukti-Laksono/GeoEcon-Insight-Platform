import React, { useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Scatter, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea
} from 'recharts';
import { formatRupiah, formatPercent, getQuadrantMeta } from '../utils/formatters';
import { TrendingDown, Info, Sparkles } from 'lucide-react';

const OUTLIERS = ['DKI Jakarta', 'Papua Pegunungan', 'Kepulauan Riau', 'Nusa Tenggara Timur', 'DI Yogyakarta'];

export default function ScatterPlotEngel({ provinces, summary, selectedProvince, onSelectProvince }) {
  const medTotJt = summary ? summary.median_pengeluaran_total / 1e6 : 1.496;
  const medPm = summary ? summary.median_proporsi_pangan : 51.21;
  const slope = summary?.regresi_slope || -7.6401;
  const intercept = summary?.regresi_intercept || 62.888;

  const chartData = useMemo(() => {
    if (!provinces?.length) return [];
    return [...provinces]
      .sort((a, b) => a.pengeluaran_total - b.pengeluaran_total)
      .map((p) => ({
        ...p,
        x: +(p.pengeluaran_total / 1e6).toFixed(3),
        y: p.persen_makanan,
        trendY: +(slope * (p.pengeluaran_total / 1e6) + intercept).toFixed(2),
        isOutlier: OUTLIERS.includes(p.provinsi),
        isSel: selectedProvince?.provinsi_id === p.provinsi_id,
      }));
  }, [provinces, slope, intercept, selectedProvince]);

  const renderDot = (props) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    const q = getQuadrantMeta(payload.kuadran);
    const r = payload.isSel ? 7 : payload.isOutlier ? 5.5 : 4;

    return (
      <g 
        key={payload.provinsi_id} 
        className="cursor-pointer transition-all" 
        onClick={() => onSelectProvince?.(payload.provinsi_id)}
      >
        {payload.isSel && (
          <circle cx={cx} cy={cy} r={r + 4} fill={q.color} opacity={0.3} className="animate-pulse" />
        )}
        <circle 
          cx={cx} 
          cy={cy} 
          r={r} 
          fill={q.color}
          stroke={payload.isSel ? '#143D30' : '#FFFFFF'}
          strokeWidth={payload.isSel ? 2.5 : 1.5}
        />
        {payload.isOutlier && (
          <text 
            x={cx + 8} 
            y={cy - 4} 
            fill="#334155" 
            fontSize="10" 
            fontWeight="600"
            className="select-none pointer-events-none drop-shadow-sm font-sans"
          >
            {payload.provinsi}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const q = getQuadrantMeta(d.kuadran);
    return (
      <div className="bg-white border border-surface-border rounded-xl p-3.5 shadow-card-hover text-[12px] space-y-2 max-w-[240px]">
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-txt-primary">{d.provinsi}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${q.bg}`}>
            Q{d.kuadran}
          </span>
        </div>
        <div className="space-y-1 text-txt-secondary text-[11px]">
          <div className="flex justify-between">
            <span className="text-txt-muted">Pengeluaran:</span>
            <span className="text-txt-primary font-bold">{formatRupiah(d.pengeluaran_total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-txt-muted">Porsi Pangan:</span>
            <span className="text-amber-700 font-bold">{formatPercent(d.persen_makanan)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-surface-border">
            <span className="text-txt-muted">Ekspektasi Engel:</span>
            <span className="text-forest-800 font-bold">{formatPercent(d.trendY)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-txt-primary">Kurva Regresi Hukum Engel</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
              Uji Hipotesis Terverifikasi
            </span>
          </div>
          <p className="text-[12px] text-txt-muted mt-0.5">
            Makin tinggi pengeluaran total, makin rendah persentase belanja yang dialokasikan untuk pangan
          </p>
        </div>

        {/* Statistical Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="px-3 py-1 rounded-full bg-surface-ground border border-surface-border font-medium text-txt-secondary">
            Korelasi: <strong className="text-forest-800">r = {summary?.korelasi_engel_r}</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-surface-ground border border-surface-border font-medium text-txt-secondary">
            Determinasi: <strong className="text-forest-800">R² = {((summary?.korelasi_engel_r2 || 0) * 100).toFixed(1)}%</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-forest-50 border border-forest-100 font-mono text-[11px] text-forest-800 font-semibold">
            Y = {slope}X + {intercept.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[440px] p-5">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 30, left: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.7} />

            {/* Quadrant Background Tints */}
            <ReferenceArea x1={0.8} x2={medTotJt} y1={medPm} y2={70} fill="#FFF1F2" fillOpacity={0.7} />
            <ReferenceArea x1={medTotJt} x2={3.2} y1={medPm} y2={70} fill="#FFFBEB" fillOpacity={0.7} />
            <ReferenceArea x1={0.8} x2={medTotJt} y1={34} y2={medPm} fill="#F0FDFA" fillOpacity={0.7} />
            <ReferenceArea x1={medTotJt} x2={3.2} y1={34} y2={medPm} fill="#ECFDF5" fillOpacity={0.7} />

            <XAxis 
              type="number" 
              dataKey="x" 
              domain={[0.9, 3.1]}
              stroke="#94A3B8" 
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(v) => `Rp ${v.toFixed(1)} jt`}
              label={{ value: 'Total Pengeluaran per Kapita (Juta Rupiah/Bulan)', position: 'insideBottom', offset: -18, fill: '#64748B', fontSize: 12 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              domain={[35, 68]}
              stroke="#94A3B8" 
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              label={{ value: 'Porsi Makanan (%)', angle: -90, position: 'insideLeft', offset: 2, fill: '#64748B', fontSize: 12 }}
            />

            {/* Threshold Lines */}
            <ReferenceLine 
              x={medTotJt} 
              stroke="#143D30" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ value: `Median Rp ${(medTotJt).toFixed(2)} jt`, position: 'insideTopLeft', fill: '#143D30', fontSize: 11, fontWeight: 'bold' }} 
            />
            <ReferenceLine 
              y={medPm} 
              stroke="#D97706" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ value: `Median Pangan ${medPm.toFixed(2)}%`, position: 'insideBottomRight', fill: '#D97706', fontSize: 11, fontWeight: 'bold' }} 
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Linear Regression Line */}
            <Line 
              type="linear" 
              dataKey="trendY" 
              stroke="#143D30" 
              strokeWidth={2.5} 
              dot={false} 
              name="Garis Regresi Engel" 
            />

            {/* Scatter Dots */}
            <Scatter dataKey="y" shape={renderDot} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Notes */}
      <div className="p-4 bg-surface-ground border-t border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-txt-secondary">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-forest-800 shrink-0" />
          <span>Klik titik provinsi mana saja untuk melihat detail metrik dan rekomendasi kebijakan.</span>
        </div>
        <span className="font-medium text-forest-800">
          ● Kuadran I (Merah) • Kuadran II (Kuning) • Kuadran III (Toska) • Kuadran IV (Hijau)
        </span>
      </div>

    </div>
  );
}
