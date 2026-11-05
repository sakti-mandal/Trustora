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
          50: '#f0f5fa',
          100: '#e1ebf4',
          200: '#c3d7e9',
          300: '#94b9d9',
          400: '#5e94c4',
          500: '#3875af',
          600: '#275c91',
          700: '#204a75',
          800: '#1d3e61',
          900: '#0f243a',
          950: '#0a1726'
        },
        navy: {
          800: '#0f172a',
          900: '#0b1120',
          950: '#060a12'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

