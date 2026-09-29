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
        cronos: {
          bg: '#111214',
          surface: '#17181A',
          'surface-2': '#1D1F22',
          text: '#F1F0ED',
          muted: '#96938C',
          bronze: '#A58A68',
          'bronze-hover': '#B89C79',
          'bronze-dark': '#8F7555',
          line: 'rgba(255, 255, 255, 0.10)',
          'line-subtle': 'rgba(255, 255, 255, 0.05)',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        editorial: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        'tightest': '-0.03em',
        'widest-editorial': '0.24em',
        'widest-brand': '0.36em',
      },
      borderWidth: {
        'px': '1px',
      }
    },
  },
  plugins: [],
}
