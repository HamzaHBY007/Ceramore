import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#fef7ee",
          100: "#fdedd3",
          200: "#fad7a5",
          300: "#f6ba6d",
          400: "#f19333",
          500: "#ee7711",
          600: "#df5d07",
          700: "#b94509",
          800: "#93370e",
          900: "#772f0f",
          950: "#401505",
        },
        ceramore: {
          dark: "#1a1a2e",
          mid: "#16213e",
          accent: "#e94560",
          light: "#f5f5f5",
          gold: "#d4a574",
        },
      },
    },
  },
  plugins: [],
};
export default config;
