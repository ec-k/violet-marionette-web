import { createTheme } from '@mui/material/styles'
import purple from '@mui/material/colors/purple'
import orange from '@mui/material/colors/orange'

declare module '@mui/material/styles' {
  interface Theme {
    palette: {
      primary: {
        light: string
        main: string
        dark: string
      }
      secondary: {
        light: string
        main: string
        dark: string
      }
    }
  }
}

export const theme = createTheme({
  palette: {
    primary: orange,
    secondary: purple,
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
