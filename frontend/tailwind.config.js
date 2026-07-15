/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        "ink-2": "#111A2E",
        "ink-3": "#17233A",
        paper: "#F6F4EF",
        line: "#1E2A3F",
        "line-light": "#E4E0D6",
        signal: "#3FB68B",
        "signal-dim": "#2D8A69",
        alert: "#E1614A",
        "ink-muted": "#8B93A6",
        slate: "#5B6472",
        ink900: "#0E1526",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
