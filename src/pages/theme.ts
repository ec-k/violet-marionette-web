import { createTheme } from '@mui/material/styles'
import { pink } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    primary: {
      main: pink[500],
    },
    secondary: {
      main: '#fff',
    },
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
