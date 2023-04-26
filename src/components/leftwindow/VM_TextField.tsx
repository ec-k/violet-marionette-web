import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  InputBaseComponentProps,
} from '@mui/material'
import purple from '@mui/material/colors/purple'
import React from 'react'

interface VM_TextFieldProps {
  label: string
  defaultValue?: string
  adornment?: {
    position: adornmentPos
    value: string
  }
  inputRef: React.MutableRefObject<HTMLInputElement | null> | undefined
  inputProps?: InputBaseComponentProps | undefined
}

type adornmentPos = 'start' | 'end'

const VM_TextField = ({
  label,
  defaultValue,
  adornment,
  inputRef,
  inputProps,
}: VM_TextFieldProps) => {
  const [inputError, setInputError] = React.useState<boolean>(false)
  const handleChange = () => {
    if (inputRef && inputRef.current) {
      const ref = inputRef.current
      if (!ref.validity.valid) setInputError(true)
      else setInputError(false)
    }
  }
  return (
    <FormControl sx={{ m: 1 }} variant="standard" color="primary">
      <InputLabel sx={{ color: purple[300] }}>{label}</InputLabel>
      {adornment?.position === 'start' ? (
        <Input
          error={inputError}
          inputProps={inputProps}
          sx={{ color: '#fff' }}
          defaultValue={defaultValue}
          inputRef={inputRef}
          startAdornment={
            <InputAdornment position="start">{adornment?.value}</InputAdornment>
          }
          onChange={handleChange}
        />
      ) : (
        <Input
          error={inputError}
          inputProps={{ pattern: '^[0-9]+$' }}
          sx={{ color: '#fff' }}
          defaultValue={defaultValue}
          inputRef={inputRef}
          endAdornment={
            <InputAdornment position="end">{adornment?.value}</InputAdornment>
          }
          onChange={handleChange}
        />
      )}
    </FormControl>
  )
}
export default VM_TextField
