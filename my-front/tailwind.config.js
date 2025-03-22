/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          700: '#374151',
          750: '#2D3748', // Промежуточный оттенок для hover
          800: '#1F2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}