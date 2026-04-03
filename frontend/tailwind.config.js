/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#020617',
          card: '#020817',
          accent: '#22c55e',
          accentSoft: '#bbf7d0',
        },
      },
    },
  },
  plugins: [],
}
