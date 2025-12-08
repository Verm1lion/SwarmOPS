/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2badee",
        "background-light": "#f6f7f8",
        "background-dark": "#101c22",
        "glass-light": "rgba(255, 255, 255, 0.4)",
        "glass-dark": "rgba(30, 41, 59, 0.5)",
        "border-light": "rgba(255, 255, 255, 0.6)",
        "border-dark": "rgba(255, 255, 255, 0.1)",
        "text-light-primary": "#0d171b",
        "text-dark-primary": "#e7eff3",
        "text-light-secondary": "#4c809a",
        "text-dark-secondary": "#94a3b8",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      boxShadow: {
        'deep': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'deep-lg': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'xl': '20px',
      }
    },
  },
  plugins: [],
}

