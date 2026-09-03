/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF0F3",
        card: "#FFFFFF",
        ink: "#15171C",
        muted: "#6A7180",
        line: "#E7E9EE",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        pos: "#15A24A",
        "pos-soft": "#E4F6EA",
        warn: "#B7791F",
        "warn-soft": "#FBF0DC",
        dark: "#15171C",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
