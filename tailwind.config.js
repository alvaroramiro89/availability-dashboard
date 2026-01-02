/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        beefive: {
          green: '#b7ce2f',    // Montserrat Black para títulos
          orange: '#f28a18',   // Montserrat Regular para subtítulos
          black: '#000000',
          white: '#ffffff',    // Montserrat Light para textos
        },
      },
      fontWeight: {
        'black': '900',
      },
    },
  },
  plugins: [],
}

