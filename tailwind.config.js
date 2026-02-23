/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#1a241e',
        sage: '#8E9B90',
        snow: '#FDFBF7',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
