/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/*.js"],
  theme: {
    extend: {
      colors: {
        "space-dark": "#0a0a1a",
        "space-blue": "#0f172a",
      },
      fontFamily: {
        space: ["Space Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
