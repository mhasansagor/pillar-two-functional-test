import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#F7F7F8",
        card: "#FFFFFF",
        border: "#E5E5E8",
        ink: "#15151A",
        muted: "#6B6B76",
        accent: "#4F46E5",
        success: "#16A34A",
        warning: "#CA8A04",
        danger: "#DC2626",
      },
    },
  },
  plugins: [],
};
export default config;
