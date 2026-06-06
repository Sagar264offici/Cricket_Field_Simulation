/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 45px rgba(45, 212, 191, 0.22)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.42)",
      },
      backgroundImage: {
        "radial-field":
          "radial-gradient(circle at 50% 50%, rgba(39, 174, 96, 0.42), rgba(12, 64, 44, 0.92) 56%, rgba(2, 8, 23, 0.98) 100%)",
      },
    },
  },
  plugins: [],
};
