/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--vx-${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // values come from siteConfig.brand.colors (CSS variables set in src/lib/brand.js)
        vx: {
          bg: token('bg'),
          surface: token('surface'),
          card: token('card'),
          line: token('line'),
          accent: token('accent'),
          'accent-hover': token('accent-hover'),
          'accent-soft': token('accent-soft'),
          'accent-text': token('accent-text'),
          muted: token('muted'),
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      keyframes: {
        ctaRing: {
          '0%': { opacity: '0.7', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.07)' },
        },
      },
      animation: {
        'cta-ring': 'ctaRing 1.1s ease-out infinite',
      },
    },
  },
  plugins: [],
}
