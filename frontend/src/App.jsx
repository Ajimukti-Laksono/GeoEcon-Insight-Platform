import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KPICards from './components/KPICards';
import ChoroplethMap from './components/ChoroplethMap';
import ScatterPlotEngel from './components/ScatterPlotEngel';
import QuadrantMatrix from './components/QuadrantMatrix';
import PolicySimulator from './components/PolicySimulator';
import ProvinceTable from './components/ProvinceTable';
import ProvinceDetailModal from './components/ProvinceDetailModal';
import { fetchHealth, fetchSummary, fetchProvinces, fetchQuadrants, fetchGeoJSON } from './services/api';
import { Sparkles, Calendar, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [summary, setSummary] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [quadrants, setQuadrants] = useState([]);
  const [geojsonData, setGeojsonData] = useState(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState('ID-PP');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [health, sum, prov, quad, geo] = await Promise.all([
          fetchHealth(), fetchSummary(), fetchProvinces(), fetchQuadrants(), fetchGeoJSON()
        ]);
        setBackendStatus(health.status === 'healthy' ? 'healthy' : 'fallback');
        setSummary(sum);
        setProvinces(prov);
        setQuadrants(quad);
        setGeojsonData(geo);
      } catch { 
        setBackendStatus('fallback'); 
      } finally { 
        setIsLoading(false); 
      }
    }
    load();
  }, []);

  const selectedProvince = provinces.find(p => p.provinsi_id === selectedProvinceId || p.provinsi === selectedProvinceId);

  const handleSelect = (id) => setSelectedProvinceId(id);
  const handleDetailOpen = (id) => { 
    if (id) setSelectedProvinceId(id); 
    setIsModalOpen(true); 
  };
  const handleSimulator = (id) => { 
    if (id) setSelectedProvinceId(id); 
    setActiveTab('simulator'); 
    document.getElementById('section-simulator')?.scrollIntoView({ behavior: 'smooth' }); 
  };

  const handleNav = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(`section-${tabId}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2EF] flex items-center justify-center">
        <div className="text-center space-y-3 p-8 bg-white rounded-3xl shadow-xl border border-[#DDE5E0]">
          <img src="/logo.png" alt="GeoEcon Insight" className="w-14 h-14 object-contain rounded-full mx-auto shadow-md animate-pulse" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">GeoEcon Insight</h3>
            <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Memuat data geospasial Susenas 2025...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2EF] text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleNav} 
        backendStatus={backendStatus} 
      />

      {/* Main Executive Dashboard Container */}
      <main className="max-w-[1400px] w-full mx-auto px-6 py-8 space-y-8 flex-1">

        {/* Dashboard Title & Meta Strip */}
        <section id="section-overview" className="scroll-mt-24 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#E8F8D8] text-[#143D30] border border-[#C7E8D4] uppercase tracking-wide">
                Executive Macro Dashboard
              </span>
              <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-[#DDE5E0] shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-[#143D30]" /> Susenas BPS 2025 (38 Provinsi)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-sans">
              Intelijen Geospasial Ketimpangan Konsumsi
            </h1>
            <p className="text-[14px] text-slate-600 max-w-3xl mt-1.5 leading-relaxed font-medium">
              Analisis disparitas alokasi belanja makanan vs non-makanan per kapita sebulan di 38 provinsi Indonesia, 
              validasi empiris Hukum Engel, serta simulasi kebijakan logistik pangan Bappenas & Pemda.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleNav('simulator')}
              style={{ backgroundColor: '#143D30' }}
              className="px-5 py-2.5 rounded-full hover:opacity-95 text-white text-[12px] font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#9FE870]" />
              <span>Simulasi Kebijakan</span>
            </button>
            <button
              onClick={() => handleNav('table')}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-[12px] font-bold transition-all border border-[#DDE5E0] shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#143D30]" />
              <span>Tabel Data 38 Prov</span>
            </button>
          </div>
        </section>

        {/* Section 1: KPI Cards & Top Extremes */}
        <KPICards 
          summary={summary} 
          onSelectProvince={handleDetailOpen} 
        />

        {/* Section 2: Choropleth Interactive Map */}
        <section id="section-map" className="scroll-mt-24">
          <ChoroplethMap
            geojsonData={geojsonData} 
            provinces={provinces}
            selectedProvince={selectedProvince} 
            onSelectProvince={handleSelect}
            onOpenDetail={handleDetailOpen}
          />
        </section>

        {/* Section 3: Engel's Law Regression Validation */}
        <section id="section-engel" className="scroll-mt-24">
          <ScatterPlotEngel
            provinces={provinces} 
            summary={summary}
            selectedProvince={selectedProvince} 
            onSelectProvince={handleSelect}
          />
        </section>

        {/* Section 4: 4-Quadrant Policy Matrix */}
        <section id="section-quadrant" className="scroll-mt-24">
          <QuadrantMatrix
            quadrants={quadrants} 
            selectedProvince={selectedProvince}
            onSelectProvince={handleSelect}
          />
        </section>

        {/* Section 5: Dynamic Policy Simulator */}
        <section id="section-simulator" className="scroll-mt-24">
          <PolicySimulator
            provinces={provinces} 
            selectedProvince={selectedProvince}
            onSelectProvince={handleSelect}
            medianTotal={summary?.median_pengeluaran_total}
            medianPangan={summary?.median_proporsi_pangan}
          />
        </section>

        {/* Section 6: Comprehensive Province Data Table */}
        <section id="section-table" className="scroll-mt-24">
          <ProvinceTable
            provinces={provinces} 
            onSelectProvince={handleDetailOpen}
            selectedProvince={selectedProvince}
          />
        </section>

      </main>

      {/* Detail Modal */}
      {isModalOpen && selectedProvince && (
        <ProvinceDetailModal
          province={selectedProvince}
          onClose={() => setIsModalOpen(false)}
          onOpenSimulator={handleSimulator}
          medianTotal={summary?.median_pengeluaran_total}
          medianPangan={summary?.median_proporsi_pangan}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#DDE5E0] bg-white py-8 mt-12">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-slate-500 font-medium">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="GeoEcon Insight Logo" 
              className="w-8 h-8 object-contain rounded-full shadow-xs border border-[#DDE5E0]" 
            />
            <span className="font-bold text-slate-900">GeoEcon Insight Platform</span>
            <span>—</span>
            <span>Survei Sosial Ekonomi Nasional (Susenas) BPS RI 2025</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <span>38 Provinsi Terpetakan Termasuk 4 DOB Papua</span>
            <span>•</span>
            <span>FastAPI + Vite React + Leaflet GIS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
