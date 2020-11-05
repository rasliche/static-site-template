module.exports = {
  theme: {
    extend: { },
    typography: theme => ({
      default: {
        css: {
          color: theme('colors.gray.700'),
          a: {
            color: theme('colors.blue.600'),
            '&:hover': {
              color: theme('colors.blue.800')
            }
          }
        }
      }
    })
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
    // require('.src/plugins/parallax')
  ]
}
