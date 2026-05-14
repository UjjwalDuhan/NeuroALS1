/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#060d1a",
          2: "#0b1829",
          3: "#0f2040",
        },
        brand: {
          blue: "#1059a5",
          sky: "#1d8cf8",
          teal: "#00d4b4",
          teal2: "#00f5d4",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Outfit", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.45s cubic-bezier(.4,0,.2,1) both",
        "pulse-slow": "pulse 2s ease-in-out infinite",
        spin: "spin 0.7s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
