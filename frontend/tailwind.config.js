/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        panel: "rgba(15, 23, 42, 0.65)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
