import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#051424",
        surface: "#122131",
        elevated: "#1c2b3c",
        border: "#273647",
        "text-primary": "#d4e4fa",
        "text-secondary": "#bbcabf",
        "text-muted": "#86948a",
        violet: {
          DEFAULT: "#d0bcff",
          soft: "#b090ff",
        },
        emerald: {
          DEFAULT: "#4edea3",
          dim: "#10b981",
        },
        amber: "#ffb95f",
        rose: "#ffb4ab",
        sky: "#d4e4fa",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "pulse-dot": "pulseDot 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
