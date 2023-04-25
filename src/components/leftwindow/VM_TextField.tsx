import { FormControl, InputLabel, Input } from '@mui/material'
import { orange } from '@mui/material/colors'

interface VM_TextFieldProps {
  label: string
  defaultValue?: string
}

const VM_TextField = ({ label, defaultValue }: VM_TextFieldProps) => {
  return (
    <FormControl sx={{ m: 1 }} variant="standard" color="primary">
      <InputLabel sx={{ color: orange[300] }}>{label}</InputLabel>
      <Input sx={{ color: '#fff' }} defaultValue={defaultValue}></Input>
    </FormControl>
  )
}
export default VM_TextField
