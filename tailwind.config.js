/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Noto Sans Thai"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
