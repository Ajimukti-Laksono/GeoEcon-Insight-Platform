# GeoEcon Insight: Geodata Economic Intelligence Platform

Platform Sistem Intelijen Geospasial Ekonomi untuk memetakan, menganalisis, dan menyajikan pola ketimpangan pengeluaran konsumsi penduduk antarprovinsi di Indonesia berbasis data **Survei Sosial Ekonomi Nasional (Susenas) BPS 2025**.

Platform ini dirancang khusus untuk mendukung pengambilan keputusan strategis oleh **Bappenas** dan **Pemerintah Daerah (Provinsi)**.

---

## 1. Arsitektur & Struktur Direktori

```
GEODATA ECONOMIC INTELLIGENCE PLATFORM (GeoEcon Insight)/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI Web API & Endpoints
│   │   ├── data_loader.py       # Engine Olah Data Susenas 2025 & GeoJSON
│   │   └── models.py            # Skema Data Pydantic
│   ├── data/
│   │   ├── raw_susenas_2025.xlsx           # Dataset Susenas 2025 Asli BPS
│   │   ├── indonesia_38_provinces.geojson   # Poligon GeoJSON 38 Provinsi
│   │   └── susenas_2025_clean.json         # Data Bersih 38 Provinsi
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── indonesia_38_provinces.geojson
│   │   └── susenas_2025_clean.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Header & Status Sistem
│   │   │   ├── KPICards.jsx             # Modul A: Kartu Metrik & Ekstrem
│   │   │   ├── ChoroplethMap.jsx        # Modul B: Peta Leaflet Choropleth
│   │   │   ├── ScatterPlotEngel.jsx     # Modul C (1): Kurva Regresi Engel
│   │   │   ├── QuadrantMatrix.jsx       # Modul C (2): Matriks 4 Kuadran
│   │   │   ├── PolicySimulator.jsx      # Modul D: Simulator Kebijakan
│   │   │   ├── ProvinceDetailModal.jsx  # Lembar Analisis Detail Provinsi
│   │   │   └── ProvinceTable.jsx        # Tabel Interaktif & Ekspor CSV
│   │   ├── services/
│   │   │   └── api.js                   # Client API layer
│   │   ├── utils/
│   │   │   ├── colorScales.js           # Skala warna tematik
│   │   │   └── formatters.js            # Formatter mata uang & kuadran
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 2. Metrik Kunci & Teori Ekonomi (Susenas 2025 Terverifikasi)

- **Total Objek Analisis:** 38 Provinsi (mencakup 4 provinsi baru: Papua Selatan, Papua Tengah, Papua Pegunungan, Papua Barat Daya).
- **Median Pengeluaran Total Nasional:** **Rp 1.495.638** / kapita / bulan (garis batas vertikal kuadran).
- **Median Proporsi Pangan Nasional:** **51.21%** (garis batas horizontal kuadran).
- **Provinsi Tertinggi (Total):** **DKI Jakarta** (Rp 2.962.412 | Porsi Makanan: 38.93% | Non-Makanan: 61.07%).
- **Provinsi Terendah (Total):** **Nusa Tenggara Timur** (Rp 1.028.875 | Porsi Makanan: 54.80% | Non-Makanan: 45.20%).
- **Rasio Disparitas Antarwilayah:** **2.88× lipat** (selisih absolut Rp 1.933.537).
- **Validasi Hukum Engel:** Koefisien korelasi $r = -0.576$ (negatif signifikan, $R^2 = 33.18\%$).
- **Deteksi Anomali Logistik 3TP:** **Papua Pegunungan** memiliki pengeluaran makanan tertinggi nasional (**Rp 1.256.747** atau **64.71%**) akibat *cost-push inflation* logistik kargo udara.

---

## 3. Matriks Kuadran Intelijen Kebijakan

| Kuadran | Klasifikasi | Kriteria Batas | Jumlah Wilayah | Rekomendasi Utama Bappenas & Pemda |
|---|---|---|---|---|
| **Kuadran I** | **Rawan Rentan** | Total < Rp 1,50 jt & Pangan > 51.21% | 11 Provinsi (NTT, NTB, Aceh, Sulbar, Papua Tengah, dll.) | Jaring pengaman sosial pangan dasar (Bansos Sembako/Beras) dan stimulus upah padat karya perdesaan. |
| **Kuadran II** | **Anomali Logistik 3TP** | Total ≥ Rp 1,50 jt & Pangan > 51.21% | 8 Provinsi (Papua Pegunungan, Papua Selatan, Papua Barat, Babel, dll.) | Subsidi biaya angkut kargo udara (**Tol Udara Pangan**), cold chain hub, dan kemandirian pangan lokal. |
| **Kuadran III** | **Transisi Berkembang** | Total < Rp 1,50 jt & Pangan ≤ 51.21% | 8 Provinsi (Jawa Tengah, Jawa Timur, Sulsel, Sultra, Maluku, dll.) | Akselerasi industrialisasi bernilai tambah lokal, formalisasi tenaga kerja, dan sanitasi dasar. |
| **Kuadran IV** | **Mature Urban** | Total ≥ Rp 1,50 jt & Pangan ≤ 51.21% | 11 Provinsi (DKI Jakarta, Kep. Riau, Bali, Jabar, DIY, Kaltim, dll.) | Pengendalian biaya hidup non-pangan (*housing affordability* sewa terjangkau & subsidi transportasi publik). |

---

## 4. Cara Menjalankan Aplikasi

### Persyaratan:
- Python 3.10+
- Node.js v18+ & npm

### Menjalankan Backend (FastAPI):
```bash
# Masuk ke direktori backend
cd backend

# Install dependensi (jika belum)
pip install -r requirements.txt

# Jalankan server FastAPI
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Akses dokumentasi Swagger UI interaktif di: `http://127.0.0.1:8000/docs`

### Menjalankan Frontend (Vite + React):
```bash
# Masuk ke direktori frontend
cd frontend

# Install dependensi
npm install

# Jalankan Vite dev server
npm run dev
```
Akses dashboard di: `http://127.0.0.1:5173`
