import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // NorthStar palette: near-black canvas, indigo-blue as the working
        // color, warm gold reserved for "aligned" signals and the brand mark.
        canvas: "#0A0B0F",
        surface: "#12141B",
        "surface-raised": "#181B24",
        border: "#232733",
        ink: "#F3F4F7",
        "ink-muted": "#8B92A3",
        star: {
          50: "#EEF2FF",
          400: "#5B7CFA",
          500: "#3B5CFA",
          600: "#2F47D6",
          700: "#26379E",
        },
        gold: {
          400: "#F2C14E",
          500: "#E0A937",
        },
        warn: "#F2994A",
        danger: "#EF5A5A",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(59, 92, 250, 0.35)",
      },
      keyframes: {
        "pulse-star": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.92)" },
        },
      },
      animation: {
        "pulse-star": "pulse-star 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [typography],
};
