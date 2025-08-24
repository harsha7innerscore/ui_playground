/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f3ff',
          100: '#bae0ff',
          200: '#8dccff',
          300: '#61b8ff',
          400: '#34a4ff',
          500: '#0890ff',
          600: '#0073cc',
          700: '#005699',
          800: '#003966',
          900: '#001c33',
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}