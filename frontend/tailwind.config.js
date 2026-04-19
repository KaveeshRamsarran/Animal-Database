/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f0',
          100: '#d4ead4',
          200: '#a8d5a8',
          300: '#7cc07c',
          400: '#4fa84f',
          500: '#2d8a2d',
          600: '#236e23',
          700: '#1a521a',
          800: '#113611',
          900: '#0a1f0a',
          950: '#061208',
        },
        sand: {
          50: '#fdf8f0',
          100: '#f9edd9',
          200: '#f2dbb3',
          300: '#e8c48a',
          400: '#dba960',
          500: '#c9903d',
          600: '#a87430',
          700: '#845a25',
          800: '#5f411a',
          900: '#3b2810',
        },
        ocean: {
          50: '#eff8ff',
          100: '#d0eaff',
          200: '#a3d5ff',
          300: '#70bcff',
          400: '#3d9fff',
          500: '#1a7fe6',
          600: '#1463b8',
          700: '#0f4a8a',
          800: '#0a325c',
          900: '#051b30',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
