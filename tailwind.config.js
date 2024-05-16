const { slate, violet, blackA } = require('@radix-ui/colors');

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        ...slate,
        ...violet,
        ...blackA
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
