import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial palette: near-black canvas, warm off-white ink, one
        // accent. Deliberately restrained — no gradient system.
        canvas: "#0b0b0c",
        surface: "#111113",
        hairline: "rgba(241,237,227,0.12)",
        ink: {
          DEFAULT: "#f1ede3",
          dim: "#8f8b82",
          faint: "#57544c",
        },
        accent: {
          DEFAULT: "#7D4047",
          dim: "rgba(125,64,71,0.15)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        blink: {
          "50%": { opacity: "0" },
        },
        "scroll-x": {
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "scroll-x": "scroll-x 32s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
