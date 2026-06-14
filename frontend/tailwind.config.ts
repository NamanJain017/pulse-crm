import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0D1117",
        surface: "#161B22",
        elevated: "#1C2333",
        border: "#30363D",
        "text-primary": "#E6EDF3",
        "text-secondary": "#8B949E",
        "text-muted": "#484F58",
        violet: {
          DEFAULT: "#7C3AED",
          soft: "#A78BFA",
        },
        emerald: "#10B981",
        amber: "#F59E0B",
        rose: "#F43F5E",
        sky: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
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
