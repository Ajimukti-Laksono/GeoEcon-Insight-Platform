import React, { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { MapPin, Info, ArrowUpRight, ArrowDownRight, Layers, Eye } from 'lucide-react';
import { INDICATORS, BREAKPOINTS, getFeatureColor } from '../utils/colorScales';
import { formatRupiah, formatPercent, getQuadrantMeta } from '../utils/formatters';

function MapController({ centerZoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (centerZoom) map.setView(centerZoom.center, centerZoom.zoom, { animate: true, duration: 0.8 });
  }, [centerZoom, map]);
  return null;
}

export default function ChoroplethMap({ geojsonData, provinces, selectedProvince, onSelectProvince, onOpenDetail }) {
  const [indicator, setIndicator] = useState('pengeluaran_total');
  const [centerZoom, setCenterZoom] = useState({ center: [-2.2, 118.0], zoom: 5 });
  const [activeRegion, setActiveRegion] = useState('Semua');
  const geoJsonRef = useRef(null);

  const REGIONS = [
    { name: 'Semua', center: [-2.2, 118.0], zoom: 5 },
    { name: 'Sumatera', center: [0.5, 101.5], zoom: 6 },
    { name: 'Jawa', center: [-7.2, 110.0], zoom: 7 },
    { name: 'Kalimantan', center: [0.0, 114.0], zoom: 6 },
    { name: 'Sulawesi', center: [-2.0, 121.5], zoom: 6 },
    { name: 'Papua', center: [-4.2, 138.5], zoom: 6 },
  ];

  const currentIndicator = useMemo(() => INDICATORS.find(i => i.id === indicator) || INDICATORS[0], [indicator]);
  const currentScale = BREAKPOINTS[indicator] || [];

  const styleFeature = (feature) => {
    const props = feature.properties || {};
    const val = props[indicator];
    const isSelected = selectedProvince && (selectedProvince.provinsi_id === props.provinsi_id || selectedProvince.provinsi === props.provinsi);
    return {
      fillColor: getFeatureColor(indicator, val, props.kuadran),
      weight: isSelected ? 2.5 : 1,
      opacity: 1,
      color: isSelected ? '#143D30' : '#FFFFFF',
      fillOpacity: isSelected ? 0.95 : 0.82,
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    const name = props.provinsi || props.PROVINSI || '';
    const q = getQuadrantMeta(props.kuadran);

    layer.bindTooltip(`
      <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:160px;padding:2px">
        <div style="font-weight:700;font-size:13px;color:#111827;margin-bottom:4px">${name}</div>
        <div style="font-size:11px;color:#475569;line-height:1.6">
          Total: <b style="color:#143D30">${formatRupiah(props.pengeluaran_total)}</b><br/>
          Pangan: <b style="color:#D97706">${formatPercent(props.persen_makanan)}</b><br/>
          <span style="display:inline-block;margin-top:3px;padding:1px 6px;border-radius:4px;background:${q.softBg};color:${q.color};font-weight:600;font-size:10px">
            Q${props.kuadran}: ${q.title}
          </span>
        </div>
      </div>
    `, { className: 'map-tooltip', sticky: true, direction: 'top', opacity: 1 });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 2.5, color: '#143D30', fillOpacity: 0.95 });
        e.target.bringToFront();
      },
      mouseout: (e) => { if (geoJsonRef.current) geoJsonRef.current.resetStyle(e.target); },
      click: () => onSelectProvince?.(props.provinsi_id || props.PROVINSI),
    });
  };

  return (
    <div className="card overflow-hidden isolate relative z-0">
      {/* Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-txt-primary">Peta Spasial 38 Provinsi</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-100">
              Choropleth Interaktif
            </span>
          </div>
          <p className="text-[12px] text-txt-muted mt-0.5">
            Eksplorasi disparitas geografis belanja makanan vs non-makanan seluruh provinsi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Region buttons */}
          <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-full border border-surface-border">
            {REGIONS.map((r, i) => {
              const isActive = activeRegion === r.name;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setActiveRegion(r.name);
                    setCenterZoom({ center: r.center, zoom: r.zoom });
                  }}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                    isActive 
                      ? 'bg-forest-800 text-white shadow-soft' 
                      : 'text-txt-secondary hover:text-forest-800 hover:bg-white'
                  }`}
                >
                  {r.name}
                </button>
              );
            })}
          </div>

          {/* Indicator selector */}
          <select
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
            className="bg-white text-txt-primary text-[12px] font-medium rounded-full px-4 py-1.5 border border-surface-border shadow-soft focus:outline-none focus:ring-2 focus:ring-forest-800/20 cursor-pointer"
          >
            {INDICATORS.map((ind) => (
              <option key={ind.id} value={ind.id}>{ind.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map + Inspector Panel */}
      <div className="flex flex-col lg:flex-row">
        
        {/* Map Container */}
        <div className="flex-1 h-[500px] relative bg-[#EBF1ED] isolate z-0">
          {geojsonData ? (
            <MapContainer 
              center={centerZoom.center} 
              zoom={centerZoom.zoom} 
              scrollWheelZoom={false} 
              className="w-full h-full"
            >
              <MapController centerZoom={centerZoom} />
              
              {/* Clean Esri World Light Gray Base Tiles — No API Key Required, Clean & Professional */}
              <TileLayer
                attribution='&copy; Esri &copy; BPS Susenas 2025'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                maxZoom={12} 
                minZoom={4}
              />
              
              <GeoJSON
                key={`${indicator}-${geojsonData.features?.length}`}
                ref={geoJsonRef}
                data={geojsonData}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            </MapContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-txt-muted text-sm">
              Memuat data poligon 38 provinsi...
            </div>
          )}
        </div>

        {/* Right Inspector Panel */}
        <div className="w-full lg:w-[300px] border-t lg:border-t-0 lg:border-l border-surface-border p-5 space-y-5 bg-white">
          
          {/* Legend */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] uppercase tracking-wider text-txt-muted font-bold">
                Legenda Tematik
              </span>
              <span className="text-[10px] text-txt-muted font-medium">{currentIndicator.unit}</span>
            </div>

            <div className="space-y-1.5">
              {indicator === 'kuadran' ? (
                ['I', 'II', 'III', 'IV'].map(q => {
                  const m = getQuadrantMeta(q);
                  return (
                    <div key={q} className="flex items-center gap-2.5 text-[11px]">
                      <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: m.color }} />
                      <span className="text-txt-primary font-medium">Q{q}: {m.title}</span>
                    </div>
                  );
                })
              ) : (
                currentScale.map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[11px]">
                    <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-txt-secondary font-medium">{s.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Province Quick Inspector */}
          {selectedProvince ? (
            <div className="pt-4 border-t border-surface-border space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-txt-muted font-semibold uppercase tracking-wider block">
                    Wilayah Terpilih
                  </span>
                  <h4 className="text-[15px] font-bold text-txt-primary mt-0.5">
                    {selectedProvince.provinsi}
                  </h4>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${getQuadrantMeta(selectedProvince.kuadran).bg}`}>
                  Q{selectedProvince.kuadran}
                </span>
              </div>

              {/* Mini Stats Box */}
              <div className="bg-surface-ground p-3 rounded-xl space-y-2 border border-surface-border">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-txt-muted">Pengeluaran Total</span>
                  <span className="text-[13px] text-forest-800 font-extrabold font-sans">
                    {formatRupiah(selectedProvince.pengeluaran_total)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[11px]">
                  <span className="text-txt-muted">Pangan ({formatPercent(selectedProvince.persen_makanan)})</span>
                  <span className="text-txt-secondary font-semibold">
                    {formatRupiah(selectedProvince.pengeluaran_makanan)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[11px]">
                  <span className="text-txt-muted">Non-Makanan ({formatPercent(selectedProvince.persen_non_makanan)})</span>
                  <span className="text-txt-secondary font-semibold">
                    {formatRupiah(selectedProvince.pengeluaran_non_makanan)}
                  </span>
                </div>

                {/* Progress ratio */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex mt-1">
                  <div style={{ width: `${selectedProvince.persen_makanan}%` }} className="bg-amber-500" />
                  <div style={{ width: `${selectedProvince.persen_non_makanan}%` }} className="bg-forest-700" />
                </div>
              </div>

              {/* Deviasi vs Median */}
              <div className="flex items-center justify-between text-[11px] px-1">
                <span className="text-txt-muted">Deviasi Median:</span>
                <span className={`font-bold ${selectedProvince.deviasi_median_total_rp >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {selectedProvince.deviasi_median_total_rp >= 0 ? '+' : ''}{formatRupiah(selectedProvince.deviasi_median_total_rp)}
                </span>
              </div>

              {/* Action Button */}
              {onOpenDetail && (
                <button
                  onClick={() => onOpenDetail(selectedProvince.provinsi_id)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-[12px] font-semibold transition-all shadow-soft flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-mint-300" />
                  <span>Lihat Lembar Analisis</span>
                </button>
              )}
            </div>
          ) : (
            <div className="pt-4 border-t border-surface-border text-center py-6">
              <div className="w-10 h-10 rounded-full bg-forest-50 text-forest-800 flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-[12px] text-txt-muted font-medium">
                Klik salah satu provinsi di peta untuk menganalisis metriknya
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
