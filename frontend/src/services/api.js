const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline, using fallback:', err);
    return { status: 'fallback', version: '1.0.0' };
  }
}

export async function fetchSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  } catch (err) {
    console.warn('Using local fallback for summary:', err);
    // Calculated exact Susenas 2025 values as fallback
    return {
      total_provinsi: 38,
      median_pengeluaran_total: 1495638,
      median_proporsi_pangan: 51.21,
      rata_rata_pengeluaran_total: 1618751,
      rata_rata_proporsi_pangan: 50.53,
      provinsi_tertinggi_total: {
        provinsi_id: 'ID-JK',
        provinsi: 'DKI Jakarta',
        nilai: 2962412,
        persen_makanan: 38.93
      },
      provinsi_terendah_total: {
        provinsi_id: 'ID-NT',
        provinsi: 'Nusa Tenggara Timur',
        nilai: 1028875,
        persen_makanan: 54.80
      },
      provinsi_tertinggi_pangan: {
        provinsi_id: 'ID-PP',
        provinsi: 'Papua Pegunungan',
        nilai: 64.71,
        pengeluaran_total: 1941997
      },
      provinsi_terendah_pangan: {
        provinsi_id: 'ID-JK',
        provinsi: 'DKI Jakarta',
        nilai: 38.93,
        pengeluaran_total: 2962412
      },
      disparitas_rasio: 2.88,
      disparitas_selisih_rp: 1933537,
      korelasi_engel_r: -0.576,
      korelasi_engel_r2: 0.3318,
      regresi_slope: -7.6401,
      regresi_intercept: 62.888,
      nasional_susenas: {
        provinsi: 'Indonesia (Nasional)',
        pengeluaran_makanan: 775516,
        pengeluaran_non_makanan: 793572,
        pengeluaran_total: 1569088,
        persen_makanan: 49.42,
        persen_non_makanan: 50.58
      }
    };
  }
}

export async function fetchProvinces(params = {}) {
  try {
    const url = new URL(`${API_BASE_URL}/api/provinces`);
    if (params.kuadran) url.searchParams.append('kuadran', params.kuadran);
    if (params.pulau) url.searchParams.append('pulau', params.pulau);
    if (params.sort_by) url.searchParams.append('sort_by', params.sort_by);
    if (params.order) url.searchParams.append('order', params.order);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch provinces');
    return await res.json();
  } catch (err) {
    console.warn('Fallback fetching provinces from static file:', err);
    const res = await fetch('/susenas_2025_clean.json');
    return await res.json();
  }
}

export async function fetchProvinceDetail(provinsiId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/provinces/${encodeURIComponent(provinsiId)}`);
    if (!res.ok) throw new Error('Failed to fetch province detail');
    return await res.json();
  } catch (err) {
    console.warn('Fallback finding province detail:', err);
    const list = await fetchProvinces();
    return list.find(p => p.provinsi_id === provinsiId || p.provinsi === provinsiId);
  }
}

export async function fetchQuadrants() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quadrants`);
    if (!res.ok) throw new Error('Failed to fetch quadrants');
    return await res.json();
  } catch (err) {
    console.warn('Fallback generating quadrants:', err);
    const list = await fetchProvinces();
    const qMap = {
      'I': { nama: 'Rawan Rentan', items: [] },
      'II': { nama: 'Anomali Logistik 3TP', items: [] },
      'III': { nama: 'Transisi Berkembang', items: [] },
      'IV': { nama: 'Mature Urban', items: [] }
    };
    list.forEach(p => {
      if (qMap[p.kuadran]) qMap[p.kuadran].items.push(p);
    });
    return Object.entries(qMap).map(([k, v]) => ({
      kuadran: k,
      nama: v.nama,
      jumlah_provinsi: v.items.length,
      daftar_provinsi: v.items.map(i => i.provinsi),
      provinsi_items: v.items
    }));
  }
}

export async function fetchGeoJSON() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/geojson`);
    if (!res.ok) throw new Error('Failed to fetch GeoJSON from API');
    return await res.json();
  } catch (err) {
    console.warn('Fallback fetching static GeoJSON:', err);
    const res = await fetch('/indonesia_38_provinces.geojson');
    return await res.json();
  }
}

export async function simulatePolicy(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Simulation failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback simulation:', err);
    return [];
  }
}
