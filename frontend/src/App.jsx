import { useEffect, useMemo, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, ArrowUp, ArrowUpRight, BarChart3, ChevronDown, Download, ExternalLink, Menu, MoveUpRight, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles, TrendingDown, Wallet, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import ChoroplethMap from './components/ChoroplethMap';
import TypewriterTitle from './components/TypewriterTitle';
import SourceModal from './components/SourceModal';
import AnimatedNumber from './components/AnimatedNumber';
import { fetchHealth, fetchSummary, fetchProvinces, fetchQuadrants, fetchGeoJSON, fetchDataSources } from './services/api';
import { formatRupiah, formatPercent, getQuadrantMeta } from './utils/formatters';

const moneyAxis = n => `${(Number(n || 0) / 1e6).toFixed(1)} jt`;
const rupiahCompact = n => `Rp ${(Number(n || 0) / 1e6).toFixed(2)} jt`;

const SECTIONS = [
  { id: 'overview', label: 'Ikhtisar' },
  { id: 'map', label: 'Peta' },
  { id: 'trend', label: 'Perubahan' },
  { id: 'engel', label: 'Pola konsumsi' },
  { id: 'groups', label: 'Kelompok' },
  { id: 'simulator', label: 'Simulasi' },
  { id: 'table', label: 'Data' },
];

const SIM_PRESETS = [
  { label: 'Reset (0%)', discount: 0, stimulus: 0 },
  { label: 'Efisiensi Logistik (-10%)', discount: 10, stimulus: 0 },
  { label: 'Subsidi + Stimulus (-15% / +10%)', discount: 15, stimulus: 10 },
  { label: 'Transformasi (-20% / +15%)', discount: 20, stimulus: 15 },
];

function EngelTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  const meta = getQuadrantMeta(p.kuadran);
  return (
    <div className="engel-tooltip">
      <div className="engel-tooltip-head">
        <strong>{p.provinsi}</strong>
        <span style={{ backgroundColor: meta.softBg, color: meta.color }}>Q{p.kuadran}</span>
      </div>
      <div className="engel-tooltip-row">
        <span>Total pengeluaran</span>
        <b>{formatRupiah(p.pengeluaran_total)}</b>
      </div>
      <div className="engel-tooltip-row">
        <span>Porsi makanan</span>
        <b>{formatPercent(p.persen_makanan)}</b>
      </div>
      <small>Klik titik untuk memilih provinsi</small>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [summary, setSummary] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [quadrants, setQuadrants] = useState([]);
  const [geojsonData, setGeojsonData] = useState(null);
  const [selectedId, setSelectedId] = useState('ID-PP');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('pengeluaran_total');
  const [filterQ, setFilterQ] = useState('all');
  const [discount, setDiscount] = useState(0);
  const [stimulus, setStimulus] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [sources, setSources] = useState(null);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchHealth(),
      fetchSummary(),
      fetchProvinces(),
      fetchQuadrants(),
      fetchGeoJSON(),
      fetchDataSources().catch(() => null),
    ]).then(([health, sum, prov, quad, geo, src]) => {
      if (!alive) return;
      setBackendStatus(health.status === 'healthy' ? 'healthy' : 'error');
      setSummary(sum);
      setProvinces(prov);
      setQuadrants(quad);
      setGeojsonData(geo);
      if (src) setSources(src);
    }).catch(e => {
      if (alive) {
        const rawMsg = e?.message || '';
        const userFriendlyMsg = rawMsg.toLowerCase().includes('fetch') || rawMsg.toLowerCase().includes('network')
          ? 'Sedang menghubungkan ke server backend (http://127.0.0.1:8000)... Sistem otomatis mencoba ulang.'
          : (rawMsg || 'Tidak dapat memuat data. Menunggu backend siap...');
        setError(userFriendlyMsg);
        setBackendStatus('error');
        setTimeout(() => { if (alive) setRetryKey(k => k + 1); }, 2000);
      }
    });
    return () => { alive = false; };
  }, [retryKey]);

  const selected = provinces.find(p => p.provinsi_id === selectedId) || provinces[0];
  const visible = useMemo(
    () => provinces
      .filter(p => p.provinsi.toLowerCase().includes(search.toLowerCase()) && (filterQ === 'all' || p.kuadran === filterQ))
      .sort((a, b) => sortKey === 'provinsi' ? a.provinsi.localeCompare(b.provinsi) : b[sortKey] - a[sortKey]),
    [provinces, search, sortKey, filterQ]
  );

  const scatter = provinces.map(p => ({ ...p, name: p.provinsi }));
  const annual = summary ? [
    { year: '2024', total: summary.nasional_2024?.pengeluaran_total || 0, food: summary.nasional_2024?.pengeluaran_makanan || 0, nonfood: summary.nasional_2024?.pengeluaran_non_makanan || 0 },
    { year: '2025', total: summary.nasional_susenas?.pengeluaran_total, food: summary.nasional_susenas?.pengeluaran_makanan, nonfood: summary.nasional_susenas?.pengeluaran_non_makanan }
  ] : [];

  const changeTotal = summary?.perubahan_nasional_total_persen ?? 0;
  const simulatedFood = selected ? selected.pengeluaran_makanan * (1 - discount / 100) : 0;
  const simulatedNonFood = selected ? selected.pengeluaran_non_makanan : 0;
  const simulatedFoodAfterStimulus = simulatedFood * (1 + stimulus / 100);
  const simulatedNonFoodAfterStimulus = simulatedNonFood * (1 + stimulus / 100);
  const simulatedTotal = simulatedFoodAfterStimulus + simulatedNonFoodAfterStimulus;
  const simulatedShare = simulatedTotal ? (simulatedFoodAfterStimulus / simulatedTotal) * 100 : 0;
  const simulatedNonFoodShare = simulatedTotal ? 100 - simulatedShare : 0;
  const simulatedDeltaRp = selected ? simulatedTotal - selected.pengeluaran_total : 0;

  // Compute simulated quadrant shift relative to baseline median
  const simulatedQuadrant = useMemo(() => {
    if (!summary || !selected) return selected?.kuadran || 'I';
    const medTotal = summary.median_pengeluaran_total;
    const medShare = summary.median_proporsi_pangan;
    if (simulatedTotal < medTotal && simulatedShare > medShare) return 'I';
    if (simulatedTotal >= medTotal && simulatedShare > medShare) return 'II';
    if (simulatedTotal < medTotal) return 'III';
    return 'IV';
  }, [summary, selected, simulatedTotal, simulatedShare]);

  const quadrantShifted = selected && simulatedQuadrant !== selected.kuadran;

  const isManualScroll = useRef(false);
  const go = id => {
    setActiveTab(id);
    setMenuOpen(false);
    isManualScroll.current = true;
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 72;
      const buffer = 18;
      const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight - buffer;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    setTimeout(() => { isManualScroll.current = false; }, 800);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setScrollProgress(pct);
      setShowBackToTop(scrollTop > 420);

      if (isManualScroll.current) return;
      const scrollPosition = scrollTop + 120;
      if (window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 50) {
        setActiveTab('table');
        return;
      }
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollTop;
          if (scrollPosition >= top) {
            setActiveTab(SECTIONS[i].id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-reveal observer for smooth entrance animations
  useEffect(() => {
    if (!summary || !provinces.length) return;
    const els = document.querySelectorAll('.reveal-block');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [summary, provinces.length]);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setHeroTilt({ x, y });
  };

  const handleSelectByName = (name) => {
    const found = provinces.find(p => p.provinsi === name);
    if (found) {
      setSelectedId(found.provinsi_id);
      go('map');
    }
  };

  const handleFilterQuadrant = (q) => {
    setFilterQ(q);
    go('table');
  };

  const handleSimulateFromMap = (provId) => {
    setSelectedId(provId);
    go('simulator');
  };

  const exportCsv = () => {
    const cols = ['provinsi', 'pulau', 'pengeluaran_total', 'pengeluaran_makanan', 'pengeluaran_non_makanan', 'persen_makanan', 'persen_non_makanan', 'pertumbuhan_total_persen', 'kuadran'];
    const rows = [cols.join(','), ...visible.map(p => cols.map(k => `"${String(p[k] ?? '').replaceAll('"', '""')}"`).join(','))];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'analisis-pengeluaran-provinsi-2025.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!summary || !provinces.length) return (
    <main className="loading-shell">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-20 w-20 animate-ping rounded-full bg-[#1a4d3d]/15 pointer-events-none" />
        <img src="/logo.png" alt="GeoEcon" className="relative z-10 h-16 w-16 rounded-full shadow-md" />
      </div>
      <span className="font-semibold text-[#1a4d3d]">Menyiapkan intelijen konsumsi…</span>
      {error && (
        <div style={{ marginTop: '0.75rem', textAlign: 'center', maxWidth: '380px', padding: '0 1rem' }}>
          <p style={{ color: '#b35649', fontSize: '0.8125rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
            {error}
          </p>
          <button
            onClick={() => setRetryKey(k => k + 1)}
            style={{
              padding: '0.45rem 1.1rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              backgroundColor: '#1a4d3d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(26, 77, 61, 0.2)'
            }}
          >
            Hubungkan Sekarang
          </button>
        </div>
      )}
    </main>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand brand-topbar" href="#overview" onClick={e => { e.preventDefault(); go('overview'); }}>
          <div className="brand-logo-wrap">
            <span className="brand-ring" aria-hidden="true" />
            <img src="/logo.png" alt="Logo GeoEcon" />
            <span className="brand-sheen" aria-hidden="true" />
          </div>
          <span><b>GeoEcon</b><small>INTELIJEN EKONOMI</small></span>
        </a>
        <nav className="desktop-nav">
          {SECTIONS.map(s => (
            <button key={s.id} className={activeTab === s.id ? 'active' : ''} onClick={() => go(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <button
            type="button"
            className={`data-status ${backendStatus} cursor-pointer transition hover:border-[#4d795b]`}
            onClick={() => setSourceModalOpen(true)}
            title="Klik untuk melihat sumber data resmi BPS"
          >
            <i />{backendStatus === 'healthy' ? 'BPS · CSV ASLI' : 'MENUNGGU API'}
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav">
            {SECTIONS.map(s => (
              <button key={s.id} className={activeTab === s.id ? 'active' : ''} onClick={() => go(s.id)}>
                {s.label}
              </button>
            ))}
          </nav>
        )}
        <div className="scroll-progress-track" aria-hidden="true">
          <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
        </div>
      </header>

      <main className="dashboard">
        <section className="hero" id="overview">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> ANALISIS KONSUMSI ANTARPROVINSI <span className="year-tag">2024 — 2025</span>
            </div>
            <TypewriterTitle />
            <p>Intelijen pengeluaran penduduk untuk memahami disparitas wilayah, perubahan komposisi belanja, dan sinyal kerentanan pangan di 38 provinsi Indonesia.</p>
            <div className="hero-meta">
              <a
                href="https://www.bps.go.id/id/statistics-table/1/OTQ1IzE=/rata---rata-pengeluaran-per-kapita-sebulan-untuk-makanan-dan-bukan-makanan-di-daerah-perkotaan-dan-perdesaan-menurut-provinsi--rupiah---2011-2024.html"
                target="_blank"
                rel="noopener noreferrer"
                className="bps-meta-link"
                title="Buka tabel statistik resmi di situs Badan Pusat Statistik"
              >
                <i /> Sumber Resmi: BPS (bps.go.id) <ExternalLink size={11} />
              </a>
              <button type="button" className="bps-verify-trigger" onClick={() => setSourceModalOpen(true)}>
                <ShieldCheck size={12} /> Verifikasi &amp; Unduh CSV
              </button>
              <span>38 provinsi · Per kapita / bulan</span>
            </div>
          </div>

          <div
            className="hero-visual"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={() => setHeroTilt({ x: 0, y: 0 })}
          >
            <div
              className="orbit-system"
              style={{
                transform: `rotateX(${heroTilt.y}deg) rotateY(${heroTilt.x}deg)`,
                transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              <div className="orbit orbit-one">
                <span className="orbit-dot dot-1" />
              </div>
              <div className="orbit orbit-two">
                <span className="orbit-dot dot-2" />
              </div>
              <div className="orbit orbit-three" />
              <div className="core-aura" />
              <div className="hero-core" title="GeoEcon Insight — Klik untuk lihat peta" onClick={() => go('map')}>
                <img src="/logo.png" alt="GeoEcon" />
              </div>
            </div>
            <button
              type="button"
              className="orbit-label label-a"
              title="Klik untuk lihat analisis Hukum Engel & Pangan"
              onClick={() => go('engel')}
            >
              <span className="badge-tag"><i className="badge-pulse pulse-green" /> PANGAN</span>
              <b>{formatPercent(summary.nasional_susenas?.persen_makanan)}</b>
            </button>
            <button
              type="button"
              className="orbit-label label-b"
              title="Klik untuk lihat tren pengeluaran nasional 2024–2025"
              onClick={() => go('trend')}
            >
              <span className="badge-tag"><i className="badge-pulse pulse-amber" /> TOTAL NASIONAL</span>
              <b>{rupiahCompact(summary.nasional_susenas?.pengeluaran_total)}</b>
            </button>
            <button
              type="button"
              className="orbit-label label-c"
              title="Klik untuk jelajahi peta 38 provinsi"
              onClick={() => go('map')}
            >
              <span className="badge-tag"><i className="badge-pulse pulse-teal" /> PROVINSI</span>
              <b>38</b>
            </button>
          </div>
        </section>

        <section className="kpi-grid reveal-block" aria-label="Indikator utama">
          <article className="kpi-card interactive-kpi" onClick={() => go('trend')} title="Klik untuk melihat tren perubahan tahunan">
            <div className="kpi-top"><span>TOTAL NASIONAL 2025</span><Wallet /></div>
            <strong><AnimatedNumber value={summary.nasional_susenas?.pengeluaran_total} format={rupiahCompact} /></strong>
            <p>rata-rata per kapita per bulan</p>
            <div className="kpi-foot"><span>Perubahan dari 2024</span><b className={changeTotal >= 0 ? 'positive' : 'negative'}>{changeTotal >= 0 ? '+' : ''}{changeTotal}%</b></div>
          </article>
          <article className="kpi-card interactive-kpi" onClick={() => go('groups')} title="Klik untuk melihat pengelompokan median kuadran">
            <div className="kpi-top"><span>MEDIAN ANTARPROVINSI</span><BarChart3 /></div>
            <strong><AnimatedNumber value={summary.median_pengeluaran_total} format={rupiahCompact} /></strong>
            <p>titik tengah pengeluaran 38 provinsi</p>
            <div className="kpi-foot"><span>Rentang data</span><b>{summary.total_provinsi} wilayah</b></div>
          </article>
          <article className="kpi-card interactive-kpi" onClick={() => go('engel')} title="Klik untuk melihat analisis pola konsumsi">
            <div className="kpi-top"><span>PORSI MAKANAN NASIONAL</span><TrendingDown /></div>
            <strong><AnimatedNumber value={summary.nasional_susenas?.persen_makanan} format={v => formatPercent(v)} /></strong>
            <p>dari seluruh pengeluaran konsumsi</p>
            <div className="kpi-foot"><span>Median provinsi</span><b>{formatPercent(summary.median_proporsi_pangan)}</b></div>
          </article>
          <article className="kpi-card interactive-kpi" onClick={() => go('table')} title="Klik untuk membandingkan semua provinsi di tabel">
            <div className="kpi-top"><span>RENTANG WILAYAH</span><MoveUpRight /></div>
            <strong><AnimatedNumber value={summary.disparitas_rasio} format={v => `${v.toFixed(2)}×`} /></strong>
            <p>perbandingan tertinggi dan terendah</p>
            <div className="kpi-foot"><span>Selisih nominal</span><b>{formatRupiah(summary.disparitas_selisih_rp)}</b></div>
          </article>
        </section>

        <section className="feature-map reveal-block" id="map">
          <ChoroplethMap
            geojsonData={geojsonData}
            provinces={provinces}
            selectedProvince={selected}
            onSelectProvince={setSelectedId}
            nationalTotal={summary.nasional_susenas?.pengeluaran_total}
            onSimulateProvince={handleSimulateFromMap}
          />
        </section>

        <section className="section-block reveal-block" id="trend">
          <div className="section-title">
            <div>
              <span className="eyebrow">03 / PERUBAHAN TAHUNAN</span>
              <h2>Ke mana belanja bergerak?</h2>
              <p>Perbandingan nominal 2024 dan 2025. Pertumbuhan ini belum dikoreksi inflasi.</p>
            </div>
            <span className="trend-callout"><ArrowUpRight />{changeTotal >= 0 ? '+' : ''}{changeTotal}%<small>total nasional</small></span>
          </div>
          <div className="trend-grid">
            <div className="chart-panel">
              <div className="chart-label"><span>RATA-RATA NASIONAL</span><b>Rupiah per kapita / bulan</b></div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={annual} margin={{ top: 16, right: 18, left: 2, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dd916b" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="#dd916b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e8e4da" vertical={false} />
                    <XAxis dataKey="year" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={moneyAxis} tickLine={false} axisLine={false} width={62} />
                    <Tooltip formatter={v => formatRupiah(v)} />
                    <Area type="monotone" dataKey="total" name="Total" stroke="#bd6849" strokeWidth={3} fill="url(#areaTotal)" />
                    <Area type="monotone" dataKey="food" name="Makanan" stroke="#ca9c4c" strokeWidth={2} fill="transparent" />
                    <Area type="monotone" dataKey="nonfood" name="Bukan makanan" stroke="#638e79" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                <span><i className="cl-total" />Total</span>
                <span><i className="cl-food" />Makanan</span>
                <span><i className="cl-nonfood" />Bukan makanan</span>
              </div>
            </div>
            <div className="change-cards">
              <article><span>PERUBAHAN TOTAL</span><strong className="change-positive">+{summary.perubahan_nasional_total_persen}%</strong><p>Nilai pengeluaran gabungan</p></article>
              <article><span>PERUBAHAN PANGAN</span><strong>+{summary.perubahan_nasional_pangan_persen}%</strong><p>Pengeluaran makanan nominal</p></article>
              <article><span>PERUBAHAN NON-PANGAN</span><strong>+{summary.perubahan_nasional_non_pangan_persen}%</strong><p>Pengeluaran bukan makanan nominal</p></article>
              <article className="share-change"><span>ARAH KOMPOSISI</span><strong>{summary.perubahan_nasional_porsi_pangan_pp > 0 ? '+' : ''}{summary.perubahan_nasional_porsi_pangan_pp} <small>pp</small></strong><p>Perubahan porsi makanan dibanding 2024</p></article>
            </div>
          </div>
        </section>

        <section className="section-block reveal-block" id="engel">
          <div className="section-title">
            <div>
              <span className="eyebrow">04 / KOMPOSISI PENGELUARAN</span>
              <h2>Pola konsumsi &amp; Hukum Engel</h2>
              <p>Setiap titik mewakili satu provinsi. Klik titik mana pun untuk menyorotnya di peta &amp; simulator.</p>
            </div>
            <div className="engel-badges">
              {selected && (
                <span className="selected-chip">
                  Disorot: <b>{selected.provinsi}</b>
                </span>
              )}
              <span className="correlation-badge">r = {summary.korelasi_engel_r}<small>R² {(summary.korelasi_engel_r2 * 100).toFixed(1)}%</small></span>
            </div>
          </div>
          <div className="scatter-panel">
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart margin={{ top: 18, right: 24, bottom: 10, left: 10 }}>
                <CartesianGrid stroke="#e8e4da" />
                <XAxis type="number" dataKey="pengeluaran_total" name="Pengeluaran total" tickFormatter={moneyAxis} domain={['dataMin - 100000', 'dataMax + 100000']} tickLine={false} axisLine={false} label={{ value: 'Pengeluaran total (Rp / kapita / bulan)', position: 'insideBottom', offset: -2, fill: '#88897f', fontSize: 12 }} />
                <YAxis type="number" dataKey="persen_makanan" name="Porsi makanan" unit="%" tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<EngelTooltip />} />
                <ReferenceLine x={summary.median_pengeluaran_total} stroke="#a3a49a" strokeDasharray="5 5" />
                <ReferenceLine y={summary.median_proporsi_pangan} stroke="#a3a49a" strokeDasharray="5 5" />
                <Scatter name="Provinsi" data={scatter} onClick={point => setSelectedId(point.provinsi_id)} style={{ cursor: 'pointer' }}>
                  {scatter.map(p => (
                    <Cell
                      key={p.provinsi_id}
                      fill={getQuadrantMeta(p.kuadran).color}
                      stroke={selected?.provinsi_id === p.provinsi_id ? '#17211b' : '#fff'}
                      strokeWidth={selected?.provinsi_id === p.provinsi_id ? 3 : 1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="scatter-note">Korelasi negatif menunjukkan asosiasi pada data agregat provinsi; bukan bukti hubungan sebab-akibat.</div>
          </div>
        </section>

        <section className="section-block reveal-block" id="groups">
          <div className="section-title">
            <div>
              <span className="eyebrow">05 / PROFIL WILAYAH</span>
              <h2>Empat kelompok konsumsi</h2>
              <p>Klik nama provinsi untuk menyorot di peta, atau saring tabel berdasarkan kelompok.</p>
            </div>
          </div>
          <div className="quadrant-grid">
            {quadrants.map(q => {
              const meta = getQuadrantMeta(q.kuadran);
              return (
                <article className="quadrant-card interactive-quadrant" key={q.kuadran} style={{ '--q-color': meta.color, '--q-soft': meta.softBg }}>
                  <div className="q-top"><span>KELOMPOK 0{q.kuadran}</span><b>{q.jumlah_provinsi} provinsi</b></div>
                  <h3>{q.nama}</h3>
                  <p>{q.karakteristik}</p>
                  <div className="q-average"><span>Rata-rata pengeluaran</span><strong>{formatRupiah(q.rata_rata_total)}</strong></div>
                  <div className="q-provinces">
                    {q.daftar_provinsi.slice(0, 5).map(name => (
                      <button
                        type="button"
                        key={name}
                        className={`q-prov-btn ${selected?.provinsi === name ? 'active-prov' : ''}`}
                        onClick={() => handleSelectByName(name)}
                        title={`Pilih ${name} dan lihat di peta`}
                      >
                        {name}
                      </button>
                    ))}
                    {q.daftar_provinsi.length > 5 && (
                      <button
                        type="button"
                        className="q-more-btn"
                        onClick={() => handleFilterQuadrant(q.kuadran)}
                        title={`Lihat semua ${q.jumlah_provinsi} provinsi di Kuadran ${q.kuadran}`}
                      >
                        +{q.daftar_provinsi.length - 5} lainnya
                      </button>
                    )}
                  </div>
                  <div className="q-card-foot">
                    <small>{q.rekomendasi_strategis}</small>
                    <button type="button" className="q-filter-link" onClick={() => handleFilterQuadrant(q.kuadran)}>
                      Saring di Tabel <ArrowRight size={12} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section-block reveal-block" id="simulator">
          <div className="section-title">
            <div>
              <span className="eyebrow">06 / EKSPLORASI SKENARIO</span>
              <h2>Simulasi perubahan komposisi</h2>
              <p>Geser pengontrol atau pilih preset skenario untuk menguji perubahan komposisi belanja.</p>
            </div>
            <span className="assumption-tag">SKENARIO, BUKAN PREDIKSI</span>
          </div>
          <div className="simulator-panel">
            <div className="sim-controls">
              <div className="sim-presets" role="group" aria-label="Preset skenario cepat">
                <span><Sparkles size={12} /> Skenario Cepat:</span>
                {SIM_PRESETS.map(preset => {
                  const isActive = discount === preset.discount && stimulus === preset.stimulus;
                  return (
                    <button
                      type="button"
                      key={preset.label}
                      className={`sim-preset-pill ${isActive ? 'active' : ''}`}
                      onClick={() => { setDiscount(preset.discount); setStimulus(preset.stimulus); }}
                    >
                      {preset.discount === 0 && preset.stimulus === 0 ? <RotateCcw size={11} /> : null}
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <label className="field-label">Pilih provinsi
                <select value={selected?.provinsi_id || ''} onChange={e => setSelectedId(e.target.value)}>
                  {provinces.map(p => <option key={p.provinsi_id} value={p.provinsi_id}>{p.provinsi}</option>)}
                </select>
              </label>

              <label className="range-label">
                <span>Pengurangan biaya makanan <b>{discount}%</b></span>
                <input type="range" min="0" max="30" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                <small>Pengurangan asumsi pada pengeluaran makanan</small>
              </label>

              <label className="range-label">
                <span>Stimulus pengeluaran <b>{stimulus}%</b></span>
                <input type="range" min="0" max="30" value={stimulus} onChange={e => setStimulus(Number(e.target.value))} />
                <small>Kenaikan asumsi pada total setelah perubahan makanan</small>
              </label>
            </div>

            <div className="sim-result">
              <div className="sim-result-head">
                <span>HASIL SKENARIO · {selected?.provinsi}</span>
                {selected && (
                  <span className={`sim-quadrant-shift ${quadrantShifted ? 'shifted' : ''}`}>
                    {quadrantShifted
                      ? `Q${selected.kuadran} → Q${simulatedQuadrant} · Berpindah Kuadran!`
                      : `Tetap di Kuadran ${simulatedQuadrant}`}
                  </span>
                )}
              </div>
              <div className="sim-total-row">
                <strong>{formatRupiah(simulatedTotal)}</strong>
                {simulatedDeltaRp !== 0 && (
                  <span className={`sim-delta ${simulatedDeltaRp >= 0 ? 'pos' : 'neg'}`}>
                    {simulatedDeltaRp >= 0 ? '+' : ''}{formatRupiah(simulatedDeltaRp)} dari 2025
                  </span>
                )}
              </div>
              <p>Perkiraan aritmetis total per kapita / bulan</p>
              <div className="sim-bars">
                <div>
                  <span>Makanan ({formatPercent(simulatedShare, 1)})</span>
                  <b>{formatRupiah(simulatedFoodAfterStimulus)}</b>
                  <i><em style={{ width: `${Math.min(100, Math.max(0, simulatedShare))}%` }} /></i>
                </div>
                <div>
                  <span>Bukan makanan ({formatPercent(simulatedNonFoodShare, 1)})</span>
                  <b>{formatRupiah(simulatedNonFoodAfterStimulus)}</b>
                  <i><em className="nonfood-bar" style={{ width: `${Math.min(100, Math.max(0, simulatedNonFoodShare))}%` }} /></i>
                </div>
              </div>
              <div className="sim-foot">
                Porsi makanan skenario <b>{formatPercent(simulatedShare)}</b>
                {selected && (
                  <span className="sim-share-diff">
                    ({(simulatedShare - selected.persen_makanan) >= 0 ? '+' : ''}
                    {(simulatedShare - selected.persen_makanan).toFixed(2)} pp)
                  </span>
                )}
              </div>
              <small>Simulasi ini menerapkan persentase perubahan secara langsung pada angka CSV; tidak memperkirakan dampak kebijakan yang terukur.</small>
            </div>
          </div>
        </section>

        <section className="section-block reveal-block" id="table">
          <div className="section-title">
            <div>
              <span className="eyebrow">07 / EKSPLORASI DATA</span>
              <h2>Perbandingan provinsi</h2>
              <p>
                Sumber resmi:{' '}
                <a href="https://www.bps.go.id" target="_blank" rel="noopener noreferrer" className="bps-inline-link">
                  Badan Pusat Statistik (Susenas 2024–2025)
                </a>{' '}
                · Urutkan, saring, atau{' '}
                <button type="button" className="bps-inline-btn" onClick={() => setSourceModalOpen(true)}>
                  verifikasi CSV mentah
                </button>.
              </p>
            </div>
            <button className="export-button" onClick={exportCsv}><Download size={16} /> Unduh CSV</button>
          </div>
          <div className="table-panel">
            <div className="table-controls">
              <label className="search-control"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari provinsi…" /></label>
              <label className="filter-control"><SlidersHorizontal size={15} /><select value={filterQ} onChange={e => setFilterQ(e.target.value)}><option value="all">Semua kelompok</option>{quadrants.map(q => <option key={q.kuadran} value={q.kuadran}>Q{q.kuadran} · {q.nama}</option>)}</select></label>
              <label className="filter-control"><ChevronDown size={15} /><select value={sortKey} onChange={e => setSortKey(e.target.value)}><option value="pengeluaran_total">Urut pengeluaran</option><option value="persen_makanan">Urut porsi makanan</option><option value="pertumbuhan_total_persen">Urut perubahan tahunan</option><option value="provinsi">Urut nama</option></select></label>
              <span className="result-count">{visible.length} wilayah</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>PROVINSI</th><th>PULAU</th><th>TOTAL 2025</th><th>PANGAN</th><th>NON-PANGAN</th><th>PERUBAHAN 24–25</th><th>KELOMPOK</th></tr>
                </thead>
                <tbody>
                  {visible.map(p => (
                    <tr key={p.provinsi_id} onClick={() => setSelectedId(p.provinsi_id)} className={selectedId === p.provinsi_id ? 'row-selected' : ''}>
                      <td><b>{p.provinsi}</b><small>Ranking #{p.rank_total}</small></td>
                      <td>{p.pulau}</td>
                      <td className="money-cell">{formatRupiah(p.pengeluaran_total)}</td>
                      <td><span className="share-cell">{formatPercent(p.persen_makanan)}</span></td>
                      <td>{formatRupiah(p.pengeluaran_non_makanan)}</td>
                      <td className={p.pertumbuhan_total_persen >= 0 ? 'positive' : 'negative'}>{p.pertumbuhan_total_persen >= 0 ? '+' : ''}{p.pertumbuhan_total_persen}%</td>
                      <td><span className="quadrant-pill" style={{ '--q-color': getQuadrantMeta(p.kuadran).color }}>Q{p.kuadran} · {p.kategori_wilayah}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!visible.length && <div className="empty-state">Tidak ada provinsi yang cocok dengan pencarian ini.</div>}
            </div>
          </div>
        </section>

        <footer className="footer">
          <a className="brand" href="#overview" onClick={e => { e.preventDefault(); go('overview'); }}>
            <img src="/logo.png" alt="GeoEcon" />
            <span><b>GeoEcon</b><small>INTELIJEN EKONOMI</small></span>
          </a>
          <div className="footer-sources">
            <p>
              Data pengeluaran nominal resmi{' '}
              <a href="https://www.bps.go.id" target="_blank" rel="noopener noreferrer" className="bps-inline-link">
                Badan Pusat Statistik (BPS) — Susenas 2024–2025
              </a>{' '}
              · 38 provinsi. Perbandingan tahunan belum disesuaikan dengan inflasi.
            </p>
            <div className="footer-links">
              <a href="https://www.bps.go.id/id/statistics-table/1/OTQ1IzE=/rata---rata-pengeluaran-per-kapita-sebulan-untuk-makanan-dan-bukan-makanan-di-daerah-perkotaan-dan-perdesaan-menurut-provinsi--rupiah---2011-2024.html" target="_blank" rel="noopener noreferrer">
                Tabel Pengeluaran (Rupiah) BPS <ExternalLink size={11} />
              </a>
              <a href="https://www.bps.go.id/id/statistics-table/3/YkhNcmNWWllSVFZNVEcxWUwxb3dNWHA2VXk5V2R6MDkjMw==/persentase-pengeluaran-per-kapita-sebulan-makanan-dan-bukan-makanan-di-daerah-perkotaan-dan-perdesaan-menurut-provinsi.html" target="_blank" rel="noopener noreferrer">
                Tabel Persentase Pengeluaran BPS <ExternalLink size={11} />
              </a>
              <button type="button" onClick={() => setSourceModalOpen(true)}>
                <ShieldCheck size={12} /> Verifikasi Dataset Asli
              </button>
            </div>
          </div>
          <span className="footer-mark">BPS · 2025</span>
        </footer>

        <SourceModal open={sourceModalOpen} onClose={() => setSourceModalOpen(false)} sources={sources} />
      </main>

      {showBackToTop && (
        <button
          type="button"
          className="back-to-top"
          onClick={() => go('overview')}
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
