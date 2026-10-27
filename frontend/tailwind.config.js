/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#061711',
          900: '#0C261C',
          800: '#143D30', // Deep brand forest green from reference
          700: '#1A4D3D',
          600: '#236551',
          100: '#D1E7DD',
          50: '#EAF6EE',
        },
        mint: {
          500: '#7CD348',
          400: '#9FE870', // Vivid soft lime/mint from reference
          300: '#B6EFA0',
          200: '#D4F7C5',
          100: '#E8F8D8',
          50: '#F2FBEF',
        },
        surface: {
          ground: '#F4F6F4', // Soft dashboard background
          card: '#FFFFFF',
          muted: '#F8FAF8',
          border: '#E6ECE8',
          hover: '#F0F4F1',
        },
        txt: {
          primary: '#111827',
          secondary: '#475569',
          muted: '#8595A6',
          dim: '#94A3B8',
        },
        // Soft quadrant pastels
        q1: '#E11D48', // Kuadran I (Rawan Rentan)
        q2: '#D97706', // Kuadran II (Anomali Logistik 3TP)
        q3: '#0D9488', // Kuadran III (Transisi Berkembang)
        q4: '#15803D', // Kuadran IV (Mature Urban)
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(20, 61, 48, 0.03)',
        'card': '0 4px 20px -2px rgba(20, 61, 48, 0.05)',
        'card-hover': '0 12px 30px -4px rgba(20, 61, 48, 0.08)',
        'hero': '0 10px 30px -5px rgba(20, 61, 48, 0.25)',
      },
      borderRadius: {
        'card': '18px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}
