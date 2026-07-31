// tailwind.config.js
import containerQueries from "@tailwindcss/container-queries";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  // Touch devices fire :hover on tap and hold it until you tap elsewhere,
  // leaving buttons stuck in their hover state. Gates every hover: utility
  // behind (hover: hover).
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#f59e0b",
        secondary: "#ec4899",
        background: "#fff6e6",
        ink: "#2f2430",
        surface: "#fffdf7",
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui"],
        mono: ["Recursive", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      spacing: {
        // Extended spacing for finer layout control
        72: "18rem",
        84: "21rem",
        96: "24rem",
      },
      keyframes: {
        // Fade in keyframes for subtle component animations
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        // Animation utility using the fadeIn keyframes
        fadeIn: "fadeIn 0.5s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      outline: {
        none: "none",
      },
    },
  },
  plugins: [typography, forms, containerQueries, daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#f59e0b",
          secondary: "#ec4899",
          accent: "#8b5cf6",
          neutral: "#2f2430",
          "base-100": "#fff6e6",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
      "coffee", // fallback theme if needed
    ],
  },
};
