import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        albert_sans: ["var(--font-albert-sans)"],
      },
      maxHeight: {
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "3xl": "48rem",
        "4xl": "56rem",
        "5xl": "64rem",
        "6xl": "72rem",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        fadeOut: {
          "0%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
        slideIn: {
          "0%": {
            transform: "translateY(-3%)",
          },
          "100%": {
            transform: "translateY(0)",
          },
        },
        slideOut: {
          "0%": {
            transform: "translateY(0)",
          },
          "100%": {
            transform: "translateY(-3%)",
          },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in",
        "fade-out": "fadeOut 0.2s ease-in",
        "slide-in": "slideIn 0.2s ease-in",
        "slide-out": "slideOut 0.2s ease-in",
      },
    },
  },
  plugins: [],
};
export default config;
