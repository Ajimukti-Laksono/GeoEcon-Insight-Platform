import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronUp, ChevronDown, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { formatRupiah, formatPercent, getQuadrantMeta } from '../utils/formatters';

export default function ProvinceTable({ provinces, onSelectProvince, selectedProvince }) {
  const [search, setSearch] = useState('');
  const [filterQ, setFilterQ] = useState('ALL');
  const [sortField, setSortField] = useState('pengeluaran_total');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    if (!provinces) return [];
    return provinces
      .filter(p => {
        const query = search.toLowerCase();
        const matchSearch = p.provinsi.toLowerCase().includes(query) || (p.pulau && p.pulau.toLowerCase().includes(query));
        const matchQ = filterQ === 'ALL' || p.kuadran === filterQ;
        return matchSearch && matchQ;
      })
      .sort((a, b) => {
        const va = a[sortField], vb = b[sortField];
        if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
        return sortAsc ? va - vb : vb - va;
      });
  }, [provinces, search, filterQ, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />;
    return sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-forest-800" /> : <ChevronDown className="w-3.5 h-3.5 text-forest-800" />;
  };

  const exportCSV = () => {
    const headers = ['Provinsi', 'Pulau', 'Makanan (Rp)', 'Non-Makanan (Rp)', 'Total (Rp)', 'Porsi Pangan (%)', 'Kuadran'];
    const rows = filtered.map(p => [
      `"${p.provinsi}"`, `"${p.pulau || ''}"`, p.pengeluaran_makanan, p.pengeluaran_non_makanan,
      p.pengeluaran_total, p.persen_makanan, p.kuadran
    ]);
    const csv = [headers, ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'GeoEcon_Susenas_2025_38Provinsi.csv';
    a.click();
  };

  return (
    <div className="card overflow-hidden">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-txt-primary">Tabel Komprehensif 38 Provinsi</h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-100">
              {filtered.length} Provinsi Ditampilkan
            </span>
          </div>
          <p className="text-[12px] text-txt-muted mt-0.5">
            Data Survei Sosial Ekonomi Nasional (Susenas) BPS RI Maret 2025
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari provinsi / pulau..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-ground text-txt-primary text-[12px] font-medium rounded-full pl-9 pr-4 py-2 border border-surface-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-800/20 w-52 transition-all"
            />
          </div>

          {/* Quadrant Filter */}
          <select 
            value={filterQ} 
            onChange={(e) => setFilterQ(e.target.value)}
            className="bg-white text-txt-primary text-[12px] font-medium rounded-full px-4 py-2 border border-surface-border shadow-soft focus:outline-none focus:ring-2 focus:ring-forest-800/20 cursor-pointer"
          >
            <option value="ALL">Semua Kuadran</option>
            <option value="I">Kuadran I (Rawan Rentan)</option>
            <option value="II">Kuadran II (Anomali Logistik)</option>
            <option value="III">Kuadran III (Transisi)</option>
            <option value="IV">Kuadran IV (Mature Urban)</option>
          </select>

          {/* Export CSV Button */}
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-800 hover:bg-forest-700 text-white text-[12px] font-semibold transition-all shadow-soft"
          >
            <Download className="w-3.5 h-3.5 text-mint-300" /> 
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="text-[11px] uppercase tracking-wider text-txt-muted bg-surface-ground/80 border-b border-surface-border select-none font-bold">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 cursor-pointer group" onClick={() => toggleSort('provinsi')}>
                <div className="flex items-center gap-1.5 hover:text-forest-800">
                  <span>Provinsi</span> <SortIcon field="provinsi" />
                </div>
              </th>
              <th className="py-3 px-4">Kepulauan</th>
              <th className="py-3 px-4 text-right cursor-pointer group" onClick={() => toggleSort('pengeluaran_total')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-forest-800">
                  <span>Total Pengeluaran</span> <SortIcon field="pengeluaran_total" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer group" onClick={() => toggleSort('pengeluaran_makanan')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-forest-800">
                  <span>Makanan</span> <SortIcon field="pengeluaran_makanan" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer group" onClick={() => toggleSort('pengeluaran_non_makanan')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-forest-800">
                  <span>Non-Makanan</span> <SortIcon field="pengeluaran_non_makanan" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer group" onClick={() => toggleSort('persen_makanan')}>
                <div className="flex items-center justify-end gap-1.5 hover:text-forest-800">
                  <span>Porsi Pangan</span> <SortIcon field="persen_makanan" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Tipologi Kuadran</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border font-sans">
            {filtered.map((p, idx) => {
              const qMeta = getQuadrantMeta(p.kuadran);
              const isSelected = selectedProvince?.provinsi_id === p.provinsi_id;

              return (
                <tr 
                  key={p.provinsi_id}
                  className={`transition-colors cursor-pointer ${
                    isSelected ? 'bg-forest-50/70' : 'hover:bg-surface-ground'
                  }`}
                  onClick={() => onSelectProvince?.(p.provinsi_id)}
                >
                  <td className="py-3 px-4 text-center font-bold text-txt-muted text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-txt-primary">
                    {p.provinsi}
                  </td>
                  <td className="py-3 px-4 text-txt-secondary text-[11px]">
                    {p.pulau || '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-forest-800 font-sans">
                    {formatRupiah(p.pengeluaran_total)}
                  </td>
                  <td className="py-3 px-4 text-right text-txt-secondary font-medium">
                    {formatRupiah(p.pengeluaran_makanan)}
                  </td>
                  <td className="py-3 px-4 text-right text-txt-secondary font-medium">
                    {formatRupiah(p.pengeluaran_non_makanan)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-txt-primary">
                      {formatPercent(p.persen_makanan)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${qMeta.bg}`}>
                      Q{p.kuadran}: {qMeta.title}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProvince?.(p.provinsi_id);
                      }}
                      className="p-1.5 rounded-lg bg-surface-ground hover:bg-forest-800 hover:text-white text-txt-secondary transition-all"
                      title="Lihat Detail Provinsi"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
