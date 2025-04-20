/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7B61FF",
          dark: "#6B51EF",
        },
        secondary: {
          DEFAULT: "#A78BFA",
          dark: "#9771FA",
        },
        background: {
          dark: "#0B0F1A",
          light: "#F9F9FB",
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
}; 