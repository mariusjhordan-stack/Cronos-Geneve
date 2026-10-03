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
          // Fondo principal oficial Light Horology
          bg: '#F4F2EE',
          // Superficies oficiales
          surface: '#FFFFFF',
          'surface-1': '#FAF9F6',
          'surface-2': '#EBE7DF',
          // Textos oficiales
          text: '#171717',
          'text-primary': '#171717',
          muted: '#6F6B64',
          'text-secondary': '#6F6B64',
          tertiary: '#8F8B83',
          'text-tertiary': '#8F8B83',
          // Acento Champagne oficial
          bronze: '#A58A68',
          'bronze-light': '#C4AA8A',
          'bronze-hover': '#8F7555',
          'bronze-dark': '#7A6245',
          accent: '#A58A68',
          'accent-hover': '#8F7555',
          // Micro-líneas y bordes arquitectónicos (1px sobrio)
          line: '#D8D4CC',
          'line-subtle': '#E8E5DD',
          border: '#D8D4CC',
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        editorial: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        ui: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        utility: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.08', letterSpacing: '0.04em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '0.04em' }],
        'display-md': ['1.75rem', { lineHeight: '1.25', letterSpacing: '0.03em' }],
        'heading': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'body': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'label': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.18em' }],
        'technical': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.14em' }],
      },
      letterSpacing: {
        'tightest': '-0.03em',
        'widest-editorial': '0.24em',
        'widest-brand': '0.36em',
        'widest-technical': '0.20em',
      },
      boxShadow: {
        'editorial': '0 2px 8px rgba(23, 23, 23, 0.04)',
        'dropdown': '0 8px 24px rgba(23, 23, 23, 0.06)',
        'modal': '0 12px 36px rgba(23, 23, 23, 0.08)',
        'none': 'none',
      },
      borderWidth: {
        'px': '1px',
      }
    },
  },
  plugins: [],
}
