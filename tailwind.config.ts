import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg)", surface: "var(--surface)", line: "var(--line)", ink: "var(--ink)", muted: "var(--muted)",
        primary: "var(--c-primary)", secondary: "var(--c-secondary)", accent: "var(--c-accent)",
      },
      fontFamily: { sans: ["var(--font-cairo)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
