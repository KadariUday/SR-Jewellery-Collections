/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FAF6E8',
          100: '#F3E9C6',
          200: '#E7D493',
          300: '#DBBE60',
          400: '#D4AF37',
          500: '#B8860B',
          600: '#996515',
          700: '#754B0E',
          800: '#52340B',
          900: '#331E05',
        },
        emerald: {
          50: '#F0F9F6',
          100: '#D6EFE7',
          200: '#AEDDCD',
          300: '#7DC5AF',
          400: '#4EA98E',
          500: '#2B8B70',
          600: '#1D6F59',
          700: '#1A382F',
          800: '#122C24',
          900: '#0B1E19',
        },
        cream: {
          50: '#FDFBF7',
          100: '#F9F6F0',
          200: '#F0ECE1',
          300: '#E5DFCD',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
