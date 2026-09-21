/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#fbfbfd',
          surface: '#ffffff',
          subtle: '#f5f5f7',
          darkBg: '#000000',
          darkSurface: '#161617',
          darkSubtle: '#1c1c1e',
          text: '#1d1d1f',
          muted: '#86868b',
          border: '#e5e5ea',
          borderDark: '#262629',
          blue: '#0071e3',
          blueHover: '#0077ed',
        },
        vault: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'apple-card': '0 4px 20px -2px rgba(0,0,0,0.05), 0 2px 6px -1px rgba(0,0,0,0.02)',
        'apple-elevated': '0 20px 40px -15px rgba(0,0,0,0.1), 0 0 1px 1px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        'apple': '18px',
        'apple-lg': '24px',
        'apple-xl': '32px'
      }
    },
  },
  plugins: [],
}
