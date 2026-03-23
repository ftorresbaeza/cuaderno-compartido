/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#FDFBF7",
        "bg-secondary": "#F5F1EA",
        "bg-card": "#FFFFFF",
        "text-primary": "#1F1B16",
        "text-secondary": "#6B6459",
        "text-muted": "#A39E94",
        "accent-primary": "#3B82F6",
        "accent-secondary": "#22C55E",
        "accent-tertiary": "#FACC15",
        success: "#2D9A4E",
        danger: "#DC2626",
        border: "#E8E4DD",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
