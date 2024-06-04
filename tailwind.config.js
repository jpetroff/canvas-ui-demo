import tailwindcssRadixColors from "tailwindcss-radix-colors"

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [tailwindcssRadixColors],
  safelist: [
    {
      pattern: /(col|row)-(start|span)-[0-9]?/,
    },
  ]
}
