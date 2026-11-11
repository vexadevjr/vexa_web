/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
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
