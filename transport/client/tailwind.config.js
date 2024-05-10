module.exports = {
  content: [
    "./src/**/*.{jsx,js}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"],
  theme: {
    fontFamily: {
      jost: ['Jost', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        quaternary: 'var(--quaternary)',
        quinary: 'var(--quinary)',
        senary: 'var(--senary)',
        septenary: 'var(--septenary)',
        octonary: 'var(--octonary)',
        nonary: 'var(--nonary)',
        denary: 'var(--denary)',
      },
    },
  },
  plugins: [],
}
