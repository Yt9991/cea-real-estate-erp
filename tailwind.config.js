/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cea-bg': '#f8f6f4',
        'cea-white': '#ffffff', 
        'cea-dark': '#422d2a',
        'cea-medium': '#6b513f',
        'cea-light': '#bc9e7b',
        'cea-gold': '#936f45',
        'cea-burgundy': '#361010',
      },
    },
  },
  plugins: [],
}
