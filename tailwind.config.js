/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0B0B0D",
          red: "#BA1B1B",
          surface: "#111114",
          surface2: "#15151B",
          border: "#23232B",
          text: "#EDEDF2",
          muted: "#A7A7B3",
        },
      },
      boxShadow: {
        soft: "0 12px 35px rgba(0,0,0,0.45)",
        card: "0 18px 60px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};
