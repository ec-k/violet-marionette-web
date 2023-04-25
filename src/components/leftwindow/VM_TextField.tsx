import { FormControl, InputLabel, Input, InputAdornment } from '@mui/material'
import purple from '@mui/material/colors/purple'

interface VM_TextFieldProps {
  label: string
  defaultValue?: string
  adornment?: {
    position: adornmentPos
    value: string
  }
}

type adornmentPos = 'start' | 'end'

const VM_TextField = ({
  label,
  defaultValue,
  adornment,
}: VM_TextFieldProps) => {
  return (
    <FormControl sx={{ m: 1 }} variant="standard" color="primary">
      <InputLabel sx={{ color: purple[300] }}>{label}</InputLabel>
      {adornment?.position === 'start' ? (
        <Input
          sx={{ color: '#fff' }}
          defaultValue={defaultValue}
          startAdornment={
            <InputAdornment position="start">{adornment?.value}</InputAdornment>
          }
        />
      ) : (
        <Input
          sx={{ color: '#fff' }}
          defaultValue={defaultValue}
          endAdornment={
            <InputAdornment position="end">{adornment?.value}</InputAdornment>
          }
        />
      )}
    </FormControl>
  )
}
export default VM_TextField
