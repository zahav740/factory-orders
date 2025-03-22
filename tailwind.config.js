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
            750: '#2D3748', // Добавляем промежуточный оттенок
            800: '#1F2937',
            900: '#111827',
          },
          indigo: {
            500: '#6366F1',
            600: '#4F46E5',
          },
        }
      },
    },
    plugins: [],
  }