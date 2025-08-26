import { createTheme } from '@mui/material/styles'
import { purple, orange } from '@mui/material/colors'

declare module '@mui/material/styles' {
  interface Theme {
    customeFonts: {
      jelly: string
    }
  }
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: purple[100],
      main: purple[400],
      dark: purple[500],
    },
    secondary: orange,
  },
})

// const theme = {
//   fonts: {
//     primary: `Loto, sans-serif`,
//   },
//   colors: {
//     grey: `#1E1E1E`,
//     darkViolet: `#04010D`,
//     dullPurple: `#71526D`,
//   },
// }

export default theme
