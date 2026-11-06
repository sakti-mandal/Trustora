/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        navy: {
          800: '#0f172a',
          900: '#090d16',
          950: '#040711'
        },
        slate: {
          850: '#131b2e',
          900: '#0b1120',
          950: '#060a12'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.25)',
        'glow-md': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.35)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.35)',
      }
    },
  },
  plugins: [],
}
