/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eve-black': '#0B0B0B',
        'eve-white': '#FAFAE5',
        'eve-green': '#BDFF00',
      },
      fontFamily: {
        'mono': ['"Frontier Disket Mono"', 'monospace'],
        'sans': ['"Favorit"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

