/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#17A349',
        'primary-dark': '#128336',
        'primary-light': '#4DD97A',
      },
      fontFamily: {
        'dm-sans': ['IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 