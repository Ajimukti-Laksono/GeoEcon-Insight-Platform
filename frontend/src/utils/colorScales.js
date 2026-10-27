export const INDICATORS = [
  { id: 'pengeluaran_total', label: 'Pengeluaran Total', unit: 'Rp' },
  { id: 'pengeluaran_makanan', label: 'Pengeluaran Makanan', unit: 'Rp' },
  { id: 'pengeluaran_non_makanan', label: 'Pengeluaran Non-Makanan', unit: 'Rp' },
  { id: 'persen_makanan', label: 'Porsi Belanja Makanan', unit: '%' },
  { id: 'kuadran', label: 'Klasifikasi Kuadran Kebijakan', unit: '' },
];

const SCALES = {
  pengeluaran_total: [
    { max: 1250000, color: '#CBD5E1', label: '< 1,25 jt (Sangat Terbatas)' },
    { max: 1450000, color: '#A7F3D0', label: '1,25–1,45 jt (Rendah)' },
    { max: 1650000, color: '#6EE7B7', label: '1,45–1,65 jt (Menengah)' },
    { max: 1950000, color: '#10B981', label: '1,65–1,95 jt (Tinggi)' },
    { max: Infinity, color: '#143D30', label: '> 1,95 jt (Tertinggi)' },
  ],
  pengeluaran_makanan: [
    { max: 650000, color: '#E2E8F0', label: '< 650 rb' },
    { max: 750000, color: '#FED7AA', label: '650–750 rb' },
    { max: 850000, color: '#FDBA74', label: '750–850 rb' },
    { max: 1000000, color: '#FB923C', label: '850 rb–1 jt' },
    { max: Infinity, color: '#E11D48', label: '> 1 jt (Sangat Tinggi)' },
  ],
  pengeluaran_non_makanan: [
    { max: 600000, color: '#E2E8F0', label: '< 600 rb' },
    { max: 750000, color: '#CFFAFE', label: '600–750 rb' },
    { max: 950000, color: '#A5F3FC', label: '750–950 rb' },
    { max: 1300000, color: '#2DD4BF', label: '950 rb–1,3 jt' },
    { max: Infinity, color: '#143D30', label: '> 1,3 jt (Urban Modern)' },
  ],
  persen_makanan: [
    { max: 45.0, color: '#143D30', label: '< 45% (Tinggi Non-Pangan)' },
    { max: 50.0, color: '#0D9488', label: '45–50% (Sedang)' },
    { max: 53.0, color: '#F59E0B', label: '50–53% (Batas Median)' },
    { max: 58.0, color: '#F97316', label: '53–58% (Dominan Pangan)' },
    { max: 100.0, color: '#E11D48', label: '> 58% (Kerentanan Tinggi)' },
  ],
};

const Q_COLORS = {
  I: '#E11D48',   // Rawan Rentan
  II: '#D97706',  // Anomali Logistik 3TP
  III: '#0D9488', // Transisi Berkembang
  IV: '#15803D',  // Mature Urban
};

export const BREAKPOINTS = SCALES;

export function getFeatureColor(indicator, value, kuadran) {
  if (indicator === 'kuadran') return Q_COLORS[kuadran] || '#94A3B8';
  const num = Number(value);
  if (isNaN(num)) return '#E2E8F0';
  const scale = SCALES[indicator];
  if (!scale) return '#CBD5E1';
  for (const s of scale) {
    if (num < s.max) return s.color;
  }
  return scale[scale.length - 1].color;
}
