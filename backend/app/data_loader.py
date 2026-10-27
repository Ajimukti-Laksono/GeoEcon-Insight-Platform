import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple

PROV_METADATA = {
    'Aceh': {'id': 'ID-AC', 'bps': '11', 'geo_name': 'Aceh', 'island': 'Sumatera'},
    'Sumatera Utara': {'id': 'ID-SU', 'bps': '12', 'geo_name': 'Sumatera Utara', 'island': 'Sumatera'},
    'Sumatera Barat': {'id': 'ID-SB', 'bps': '13', 'geo_name': 'Sumatera Barat', 'island': 'Sumatera'},
    'Riau': {'id': 'ID-RI', 'bps': '14', 'geo_name': 'Riau', 'island': 'Sumatera'},
    'Jambi': {'id': 'ID-JA', 'bps': '15', 'geo_name': 'Jambi', 'island': 'Sumatera'},
    'Sumatera Selatan': {'id': 'ID-SS', 'bps': '16', 'geo_name': 'Sumatera Selatan', 'island': 'Sumatera'},
    'Bengkulu': {'id': 'ID-BE', 'bps': '17', 'geo_name': 'Bengkulu', 'island': 'Sumatera'},
    'Lampung': {'id': 'ID-LA', 'bps': '18', 'geo_name': 'Lampung', 'island': 'Sumatera'},
    'Kepulauan Bangka Belitung': {'id': 'ID-BB', 'bps': '19', 'geo_name': 'Kepulauan Bangka Belitung', 'island': 'Sumatera'},
    'Kepulauan Riau': {'id': 'ID-KR', 'bps': '21', 'geo_name': 'Kepulauan Riau', 'island': 'Sumatera'},
    'DKI Jakarta': {'id': 'ID-JK', 'bps': '31', 'geo_name': 'DKI Jakarta', 'island': 'Jawa'},
    'Jawa Barat': {'id': 'ID-JB', 'bps': '32', 'geo_name': 'Jawa Barat', 'island': 'Jawa'},
    'Jawa Tengah': {'id': 'ID-JT', 'bps': '33', 'geo_name': 'Jawa Tengah', 'island': 'Jawa'},
    'DI Yogyakarta': {'id': 'ID-YO', 'bps': '34', 'geo_name': 'Daerah Istimewa Yogyakarta', 'island': 'Jawa'},
    'Jawa Timur': {'id': 'ID-JI', 'bps': '35', 'geo_name': 'Jawa Timur', 'island': 'Jawa'},
    'Banten': {'id': 'ID-BT', 'bps': '36', 'geo_name': 'Banten', 'island': 'Jawa'},
    'Bali': {'id': 'ID-BA', 'bps': '51', 'geo_name': 'Bali', 'island': 'Bali & Nusa Tenggara'},
    'Nusa Tenggara Barat': {'id': 'ID-NB', 'bps': '52', 'geo_name': 'Nusa Tenggara Barat', 'island': 'Bali & Nusa Tenggara'},
    'Nusa Tenggara Timur': {'id': 'ID-NT', 'bps': '53', 'geo_name': 'Nusa Tenggara Timur', 'island': 'Bali & Nusa Tenggara'},
    'Kalimantan Barat': {'id': 'ID-KB', 'bps': '61', 'geo_name': 'Kalimantan Barat', 'island': 'Kalimantan'},
    'Kalimantan Tengah': {'id': 'ID-KT', 'bps': '62', 'geo_name': 'Kalimantan Tengah', 'island': 'Kalimantan'},
    'Kalimantan Selatan': {'id': 'ID-KS', 'bps': '63', 'geo_name': 'Kalimantan Selatan', 'island': 'Kalimantan'},
    'Kalimantan Timur': {'id': 'ID-KI', 'bps': '64', 'geo_name': 'Kalimantan Timur', 'island': 'Kalimantan'},
    'Kalimantan Utara': {'id': 'ID-KU', 'bps': '65', 'geo_name': 'Kalimantan Utara', 'island': 'Kalimantan'},
    'Sulawesi Utara': {'id': 'ID-SA', 'bps': '71', 'geo_name': 'Sulawesi Utara', 'island': 'Sulawesi'},
    'Sulawesi Tengah': {'id': 'ID-ST', 'bps': '72', 'geo_name': 'Sulawesi Tengah', 'island': 'Sulawesi'},
    'Sulawesi Selatan': {'id': 'ID-SN', 'bps': '73', 'geo_name': 'Sulawesi Selatan', 'island': 'Sulawesi'},
    'Sulawesi Tenggara': {'id': 'ID-SG', 'bps': '74', 'geo_name': 'Sulawesi Tenggara', 'island': 'Sulawesi'},
    'Gorontalo': {'id': 'ID-GO', 'bps': '75', 'geo_name': 'Gorontalo', 'island': 'Sulawesi'},
    'Sulawesi Barat': {'id': 'ID-SR', 'bps': '76', 'geo_name': 'Sulawesi Barat', 'island': 'Sulawesi'},
    'Maluku': {'id': 'ID-MA', 'bps': '81', 'geo_name': 'Maluku', 'island': 'Maluku'},
    'Maluku Utara': {'id': 'ID-MU', 'bps': '82', 'geo_name': 'Maluku Utara', 'island': 'Maluku'},
    'Papua Barat': {'id': 'ID-PB', 'bps': '91', 'geo_name': 'Papua Barat', 'island': 'Papua'},
    'Papua Barat Daya': {'id': 'ID-PD', 'bps': '92', 'geo_name': 'Papua Barat Daya', 'island': 'Papua'},
    'Papua': {'id': 'ID-PA', 'bps': '94', 'geo_name': 'Papua', 'island': 'Papua'},
    'Papua Selatan': {'id': 'ID-PS', 'bps': '93', 'geo_name': 'Papua Selatan', 'island': 'Papua'},
    'Papua Tengah': {'id': 'ID-PT', 'bps': '96', 'geo_name': 'Papua Tengah', 'island': 'Papua'},
    'Papua Pegunungan': {'id': 'ID-PP', 'bps': '95', 'geo_name': 'Papua Pegunungan', 'island': 'Papua'},
}

QUADRANT_DEFINITIONS = {
    'I': {
        'nama': 'Rawan Rentan',
        'karakteristik': 'Total Pengeluaran < Median & Porsi Belanja Pangan > Median',
        'definisi': 'Wilayah dengan kapasitas daya beli per kapita terbatas di mana sebagian besar pengeluaran masih terkonsentrasi untuk makanan pokok. Wilayah ini sangat sensitif terhadap lonjakan inflasi pangan (food shock).',
        'rekomendasi_strategis': 'Perlindungan sosial pangan dasar berkelanjutan (bansos pangan), pengamanan cadangan pangan daerah, serta program stimulus pendapatan riil perdesaan berbasis padat karya tunai.',
        'sektor_prioritas': ['Jaring Pengaman Sosial', 'Bantuan Pangan Pokok', 'Padat Karya Tunai', 'Stabilisasi Harga Sembako']
    },
    'II': {
        'nama': 'Anomali Logistik 3TP',
        'karakteristik': 'Total Pengeluaran >= Median & Porsi Belanja Pangan > Median',
        'definisi': 'Wilayah dengan pengeluaran nominal tinggi yang terdistorsi oleh tingginya biaya logistik dan transportasi barang (kargo udara/antar-pulau). Tingginya pengeluaran makanan mencerminkan cost-push inflation, bukan kemakmuran konsumsi (anomali Hukum Engel).',
        'rekomendasi_strategis': 'Intervensi subsidi ongkos angkut logistik udara (Tol Udara Perintis Pangan), penguatan cold chain logistic hub di simpul transit, dan optimalisasi diversifikasi pangan lokal endemik (sagu/umbi-umbian).',
        'sektor_prioritas': ['Tol Udara & Logistik Perintis', 'Rantai Pasok Dingin (Cold Chain)', 'Operasi Pasar Komoditas Pokok', 'Kemandirian Pangan Lokal']
    },
    'III': {
        'nama': 'Transisi Berkembang',
        'karakteristik': 'Total Pengeluaran < Median & Porsi Belanja Pangan <= Median',
        'definisi': 'Wilayah berkembang dengan pengeluaran total di bawah median namun memiliki proporsi belanja pangan relatif efisien. Hal ini didukung oleh ketersediaan sentra produksi pangan mandiri dan pasar lokal yang kompetitif.',
        'rekomendasi_strategis': 'Akselerasi industrialisasi bernilai tambah tinggi di tingkat lokal, perluasan lapangan kerja formal, peningkatan upah riil, serta investasi sarana prasarana sanitasi dan air bersih.',
        'sektor_prioritas': ['Industrialisasi Berbasis Komoditas', 'Formalisasi Tenaga Kerja', 'Akses Sanitasi & Hunian Dasar', 'Pemberdayaan UMKM']
    },
    'IV': {
        'nama': 'Mature Urban',
        'karakteristik': 'Total Pengeluaran >= Median & Porsi Belanja Pangan <= Median',
        'definisi': 'Wilayah aglomerasi metropolitan dan pusat jasa berpendapatan tinggi yang mencerminkan Hukum Engel klasik secara kuat. Konsumsi pangan primer relatif kecil, namun masyarakat terbebani tingginya biaya sewa hunian, transportasi urban, dan jasa komersial.',
        'rekomendasi_strategis': 'Pengendalian biaya hidup non-pangan melalui penyediaan hunian sewa terjangkau (housing affordability), subsidi tarif transportasi massal terintegrasi, serta jaminan perlindungan sosial pekerja sektor jasa.',
        'sektor_prioritas': ['Penyediaan Perumahan Terjangkau', 'Subsidi Transportasi Publik Massal', 'Pengendalian Biaya Jasa & Utilitas', 'Pendidikan & Kesehatan Unggul']
    }
}

class SusenasDataLoader:
    def __init__(self, excel_path: str = None, geojson_path: str = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.excel_path = excel_path or os.path.join(base_dir, 'data', 'raw_susenas_2025.xlsx')
        self.geojson_path = geojson_path or os.path.join(base_dir, 'data', 'indonesia_38_provinces.geojson')
        
        self.df_all: pd.DataFrame = None
        self.df_prov: pd.DataFrame = None
        self.national_row: Dict[str, Any] = {}
        self.summary_metrics: Dict[str, Any] = {}
        self.provinces_data: List[Dict[str, Any]] = []
        self.provinces_dict: Dict[str, Dict[str, Any]] = {}
        self.quadrants_summary: List[Dict[str, Any]] = []
        self.geojson_enriched: Dict[str, Any] = {}
        
        self.load_and_process()

    def load_and_process(self):
        # 1. Load Excel
        df = pd.read_excel(self.excel_path)
        # Columns: [0: Provinsi, 1: Makanan, 2: Bukan Makanan, 3: Jumlah]
        df.columns = ['provinsi', 'pengeluaran_makanan', 'pengeluaran_non_makanan', 'pengeluaran_total']
        self.df_all = df.copy()

        # Extract national row ("Indonesia")
        nat_mask = df['provinsi'].str.strip() == 'Indonesia'
        nat_data = df[nat_mask].iloc[0]
        self.national_row = {
            'provinsi': 'Indonesia (Nasional)',
            'pengeluaran_makanan': int(nat_data['pengeluaran_makanan']),
            'pengeluaran_non_makanan': int(nat_data['pengeluaran_non_makanan']),
            'pengeluaran_total': int(nat_data['pengeluaran_total']),
            'persen_makanan': round(float(nat_data['pengeluaran_makanan']) / float(nat_data['pengeluaran_total']) * 100, 2),
            'persen_non_makanan': round(float(nat_data['pengeluaran_non_makanan']) / float(nat_data['pengeluaran_total']) * 100, 2)
        }

        # Filter 38 provinces only
        df_prov = df[~nat_mask].copy().reset_index(drop=True)
        df_prov['pengeluaran_makanan'] = df_prov['pengeluaran_makanan'].astype(int)
        df_prov['pengeluaran_non_makanan'] = df_prov['pengeluaran_non_makanan'].astype(int)
        df_prov['pengeluaran_total'] = df_prov['pengeluaran_total'].astype(int)
        
        df_prov['persen_makanan'] = (df_prov['pengeluaran_makanan'] / df_prov['pengeluaran_total'] * 100).round(2)
        df_prov['persen_non_makanan'] = (100.0 - df_prov['persen_makanan']).round(2)
        
        # Calculate Medians
        median_total = float(df_prov['pengeluaran_total'].median())
        median_persen_makanan = float(df_prov['persen_makanan'].median())
        
        # Calculate Engel's Regression: Y = slope * X + intercept
        # X: Total expenditure in Millions of IDR
        x_millions = df_prov['pengeluaran_total'].values / 1_000_000.0
        y_food_pct = df_prov['persen_makanan'].values
        
        slope, intercept = np.polyfit(x_millions, y_food_pct, 1)
        r_matrix = np.corrcoef(x_millions, y_food_pct)
        r_val = float(r_matrix[0, 1])
        r2_val = float(r_val ** 2)

        # Ranks
        df_prov['rank_total'] = df_prov['pengeluaran_total'].rank(ascending=False, method='min').astype(int)
        df_prov['rank_persen_makanan'] = df_prov['persen_makanan'].rank(ascending=False, method='min').astype(int)

        # Build Enriched Province Records
        records = []
        for _, row in df_prov.iterrows():
            prov_name = row['provinsi'].strip()
            meta = PROV_METADATA.get(prov_name, {'id': f'ID-{prov_name[:2].upper()}', 'bps': '00', 'geo_name': prov_name, 'island': 'Lainnya'})
            
            tot = int(row['pengeluaran_total'])
            pm = float(row['persen_makanan'])
            pnm = float(row['persen_non_makanan'])
            mkn = int(row['pengeluaran_makanan'])
            nmkn = int(row['pengeluaran_non_makanan'])
            
            # Quadrant logic based on exact median boundaries
            if tot < median_total and pm > median_persen_makanan:
                kuadran = 'I'
            elif tot >= median_total and pm > median_persen_makanan:
                kuadran = 'II'
            elif tot < median_total and pm <= median_persen_makanan:
                kuadran = 'III'
            else:
                kuadran = 'IV'
                
            q_info = QUADRANT_DEFINITIONS[kuadran]
            
            # Tailored policy recommendation
            if prov_name == 'Papua Pegunungan':
                rekomendasi = "Subsidi biaya angkut logistik udara (Tol Udara Pangan) dan stabilisasi harga bahan pokok di daerah pedalaman 3TP."
            elif prov_name == 'DKI Jakarta':
                rekomendasi = "Pengendalian inflasi sektor perumahan terjangkau dan integrasi subsidi transportasi publik untuk menekan beban hidup non-makanan."
            elif prov_name == 'Nusa Tenggara Timur':
                rekomendasi = "Penguatan bantuan sosial pangan berkelanjutan, program pasokan air bersih pedesaan, dan stimulus padat karya tunai."
            elif prov_name == 'Kepulauan Riau':
                rekomendasi = "Insentif perumahan pekerja kawasan industri, efisiensi logistik antar pulau, dan diversifikasi pasokan pangan lokal."
            else:
                rekomendasi = q_info['rekomendasi_strategis']

            # Engel prediction and residual
            x_m = tot / 1_000_000.0
            predicted_pm = round(float(slope * x_m + intercept), 2)
            residual = round(pm - predicted_pm, 2)
            
            dev_tot_rp = int(tot - median_total)
            dev_tot_pct = round((tot - median_total) / median_total * 100, 2)
            dev_mkn_pct = round(pm - median_persen_makanan, 2)
            
            rec = {
                'provinsi_id': meta['id'],
                'provinsi': prov_name,
                'kode_bps': meta['bps'],
                'geo_name': meta['geo_name'],
                'pulau': meta['island'],
                'pengeluaran_makanan': mkn,
                'pengeluaran_non_makanan': nmkn,
                'pengeluaran_total': tot,
                'persen_makanan': pm,
                'persen_non_makanan': pnm,
                'kuadran': kuadran,
                'kategori_wilayah': q_info['nama'],
                'rekomendasi_utama': rekomendasi,
                'rank_total': int(row['rank_total']),
                'rank_persen_makanan': int(row['rank_persen_makanan']),
                'deviasi_median_total_rp': dev_tot_rp,
                'deviasi_median_total_persen': dev_tot_pct,
                'deviasi_median_makanan_persen': dev_mkn_pct,
                'engel_predicted_persen_makanan': predicted_pm,
                'engel_residual': residual,
                'sektor_prioritas': q_info['sektor_prioritas'],
                'rekomendasi_kebijakan': [
                    rekomendasi,
                    f"Prioritaskan program pada: {', '.join(q_info['sektor_prioritas'][:3])}.",
                    f"Monitoring tren inflasi komoditas utama terkait Kuadran {kuadran} ({q_info['nama']})."
                ]
            }
            records.append(rec)

        self.df_prov = pd.DataFrame(records)
        self.provinces_data = records
        self.provinces_dict = {r['provinsi_id']: r for r in records}
        # Also map by name
        for r in records:
            self.provinces_dict[r['provinsi']] = r
            self.provinces_dict[r['geo_name']] = r

        # Summary Metrics
        max_tot_rec = max(records, key=lambda x: x['pengeluaran_total'])
        min_tot_rec = min(records, key=lambda x: x['pengeluaran_total'])
        max_pm_rec = max(records, key=lambda x: x['persen_makanan'])
        min_pm_rec = min(records, key=lambda x: x['persen_makanan'])
        
        disparity_ratio = round(max_tot_rec['pengeluaran_total'] / min_tot_rec['pengeluaran_total'], 2)
        disparity_selisih = max_tot_rec['pengeluaran_total'] - min_tot_rec['pengeluaran_total']

        self.summary_metrics = {
            'total_provinsi': len(records),
            'median_pengeluaran_total': int(median_total),
            'median_proporsi_pangan': round(median_persen_makanan, 2),
            'rata_rata_pengeluaran_total': int(df_prov['pengeluaran_total'].mean()),
            'rata_rata_proporsi_pangan': round(float(df_prov['persen_makanan'].mean()), 2),
            'provinsi_tertinggi_total': {
                'provinsi_id': max_tot_rec['provinsi_id'],
                'provinsi': max_tot_rec['provinsi'],
                'nilai': max_tot_rec['pengeluaran_total'],
                'persen_makanan': max_tot_rec['persen_makanan']
            },
            'provinsi_terendah_total': {
                'provinsi_id': min_tot_rec['provinsi_id'],
                'provinsi': min_tot_rec['provinsi'],
                'nilai': min_tot_rec['pengeluaran_total'],
                'persen_makanan': min_tot_rec['persen_makanan']
            },
            'provinsi_tertinggi_pangan': {
                'provinsi_id': max_pm_rec['provinsi_id'],
                'provinsi': max_pm_rec['provinsi'],
                'nilai': max_pm_rec['persen_makanan'],
                'pengeluaran_total': max_pm_rec['pengeluaran_total']
            },
            'provinsi_terendah_pangan': {
                'provinsi_id': min_pm_rec['provinsi_id'],
                'provinsi': min_pm_rec['provinsi'],
                'nilai': min_pm_rec['persen_makanan'],
                'pengeluaran_total': min_pm_rec['pengeluaran_total']
            },
            'disparitas_rasio': disparity_ratio,
            'disparitas_selisih_rp': disparity_selisih,
            'korelasi_engel_r': round(r_val, 3),
            'korelasi_engel_r2': round(r2_val, 4),
            'regresi_slope': round(float(slope), 4),
            'regresi_intercept': round(float(intercept), 4),
            'nasional_susenas': self.national_row
        }

        # Quadrant summary
        quadrant_list = []
        for q_id, q_def in QUADRANT_DEFINITIONS.items():
            q_provs = [r for r in records if r['kuadran'] == q_id]
            avg_tot = int(np.mean([p['pengeluaran_total'] for p in q_provs])) if q_provs else 0
            avg_pm = round(float(np.mean([p['persen_makanan'] for p in q_provs])), 2) if q_provs else 0.0
            
            quadrant_list.append({
                'kuadran': q_id,
                'nama': q_def['nama'],
                'karakteristik': q_def['karakteristik'],
                'definisi': q_def['definisi'],
                'rekomendasi_strategis': q_def['rekomendasi_strategis'],
                'jumlah_provinsi': len(q_provs),
                'persentase_provinsi': round(len(q_provs) / len(records) * 100, 2),
                'daftar_provinsi': [p['provinsi'] for p in q_provs],
                'provinsi_items': q_provs,
                'rata_rata_total': avg_tot,
                'rata_rata_persen_makanan': avg_pm,
                'sektor_prioritas': q_def['sektor_prioritas']
            })
        self.quadrants_summary = quadrant_list

        # Enrich GeoJSON
        if os.path.exists(self.geojson_path):
            with open(self.geojson_path, 'r', encoding='utf-8') as f:
                gj = json.load(f)
            
            enriched_features = []
            for feat in gj.get('features', []):
                props = feat.get('properties', {})
                geo_prov = props.get('PROVINSI', '').strip()
                prov_rec = self.provinces_dict.get(geo_prov)
                if not prov_rec:
                    # Try matching by alias or strip
                    for p_name, p_val in self.provinces_dict.items():
                        if p_val.get('geo_name') == geo_prov or p_val.get('provinsi') == geo_prov:
                            prov_rec = p_val
                            break
                            
                if prov_rec:
                    enriched_props = {**props, **prov_rec}
                else:
                    enriched_props = props
                
                feat['properties'] = enriched_props
                enriched_features.append(feat)
                
            gj['features'] = enriched_features
            self.geojson_enriched = gj

    def simulate_policy(self, provinsi_id: str = None, potongan_pangan_persen: float = 0.0, stimulus_pendapatan_persen: float = 0.0):
        """
        Simulate policy effect on food expenditure reduction (e.g. Tol Udara) or total income/expenditure boost.
        """
        results = []
        target_provinces = self.provinces_data if not provinsi_id else [p for p in self.provinces_data if p['provinsi_id'] == provinsi_id]
        
        median_total = self.summary_metrics['median_pengeluaran_total']
        median_persen_makanan = self.summary_metrics['median_proporsi_pangan']
        
        for p in target_provinces:
            old_mkn = p['pengeluaran_makanan']
            old_nmkn = p['pengeluaran_non_makanan']
            old_tot = p['pengeluaran_total']
            old_pm = p['persen_makanan']
            old_k = p['kuadran']
            
            # Policy intervention:
            # potongan_pangan_persen reduces food price / cost
            new_mkn = int(old_mkn * (1.0 - (potongan_pangan_persen / 100.0)))
            # stimulus_pendapatan_persen increases non-food / total consumption capacity
            new_nmkn = int(old_nmkn * (1.0 + (stimulus_pendapatan_persen / 100.0)))
            new_tot = new_mkn + new_nmkn
            new_pm = round((new_mkn / new_tot) * 100, 2)
            
            if new_tot < median_total and new_pm > median_persen_makanan:
                new_k = 'I'
            elif new_tot >= median_total and new_pm > median_persen_makanan:
                new_k = 'II'
            elif new_tot < median_total and new_pm <= median_persen_makanan:
                new_k = 'III'
            else:
                new_k = 'IV'
                
            old_cat = QUADRANT_DEFINITIONS[old_k]['nama']
            new_cat = QUADRANT_DEFINITIONS[new_k]['nama']
            
            if old_k == new_k:
                status = f"Tetap pada Kuadran {new_k} ({new_cat})"
                impact = f"Rasio belanja makanan berubah dari {old_pm}% menjadi {new_pm}%. Pengeluaran total baru: Rp {new_tot:,}."
            else:
                status = f"Bergeser: Kuadran {old_k} -> Kuadran {new_k}"
                impact = f"Pergeseran positif ke kategori {new_cat}! Rasio pangan terpangkas {round(old_pm - new_pm, 2)}% poin."

            results.append({
                'provinsi_id': p['provinsi_id'],
                'provinsi': p['provinsi'],
                'kuadran_lama': old_k,
                'kuadran_baru': new_k,
                'kategori_lama': old_cat,
                'kategori_baru': new_cat,
                'pengeluaran_makanan_lama': old_mkn,
                'pengeluaran_makanan_baru': new_mkn,
                'pengeluaran_total_lama': old_tot,
                'pengeluaran_total_baru': new_tot,
                'persen_makanan_lama': old_pm,
                'persen_makanan_baru': new_pm,
                'perubahan_status': status,
                'dampak_kebijakan': impact
            })
            
        return results

# Singleton instance
data_engine = SusenasDataLoader()
