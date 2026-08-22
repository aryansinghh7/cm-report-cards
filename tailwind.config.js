/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#16294f",
          light: "#1f3a6e",
          dark: "#0e1c38"
        },
        gold: "#e6a730",
        bharat: {
          bg: "#eef1f6"
        },
        grade: {
          Ap: "#1f8a3b",
          A: "#3fae57",
          Bp: "#8bc34a",
          B: "#e8c73a",
          Cp: "#f0a63a",
          C: "#e8873a",
          D: "#e05a4a",
          E: "#c62b2b"
        }
      },
      fontFamily: {
        display: ["Archivo Black", "Arial Black", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
