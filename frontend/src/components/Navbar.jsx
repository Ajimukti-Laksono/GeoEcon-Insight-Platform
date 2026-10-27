import React from 'react';
import { Layers, Activity, TrendingDown, Compass, Sliders, Table2, Building2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus }) {
  const navItems = [
    { id: 'overview', label: 'Ringkasan', icon: Activity },
    { id: 'map', label: 'Peta Geospasial', icon: Layers },
    { id: 'engel', label: 'Hukum Engel', icon: TrendingDown },
    { id: 'quadrant', label: 'Matriks Kuadran', icon: Compass },
    { id: 'simulator', label: 'Simulator', icon: Sliders },
    { id: 'table', label: 'Data Provinsi', icon: Table2 },
  ];

  return (
    <header className="sticky top-0 z-[1000] bg-white/95 backdrop-blur-md border-b border-[#DDE5E0] shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Brand & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <img 
              src="/logo.png" 
              alt="GeoEcon Insight Logo" 
              className="w-11 h-11 object-contain rounded-full shadow-md border border-[#DDE5E0] bg-white p-0.5 hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[17px] text-slate-900 tracking-tight font-sans">
                  GeoEcon Insight
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF6EE] text-[#143D30] border border-[#D1E7DD]">
                  Susenas 2025
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Sistem Intelijen Geospasial Pengeluaran Konsumsi
              </p>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#EEF2EF] p-1.5 rounded-full border border-[#DDE5E0]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={isActive ? { backgroundColor: '#143D30', color: '#FFFFFF' } : {}}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                    isActive
                      ? 'shadow-sm text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#9FE870]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & Meta */}
          <div className="flex items-center gap-3">
            {/* Status Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DDE5E0] shadow-sm text-[12px]">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  backendStatus === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  backendStatus === 'healthy' ? 'bg-emerald-600' : 'bg-amber-500'
                }`} />
              </span>
              <span className="font-bold text-slate-700 text-[11px]">
                {backendStatus === 'healthy' ? 'Data Terverifikasi' : 'Offline Fallback'}
              </span>
            </div>

            {/* Institutional Tag */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[#DDE5E0] text-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#EAF6EE] border border-[#D1E7DD] flex items-center justify-center text-[#143D30]">
                <Building2 className="w-4 h-4 text-[#143D30]" />
              </div>
              <div className="text-left text-[11px]">
                <div className="font-bold text-slate-900 leading-tight">Bappenas / Pemda</div>
                <div className="text-slate-500 font-medium">Ekonomi Makro</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
