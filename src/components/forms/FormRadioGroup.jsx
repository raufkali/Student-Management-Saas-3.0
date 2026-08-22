import React from "react";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/material";
import { Controller } from "react-hook-form";

export default function FormRadioGroup({
  name,
  control,
  label,
  options = [],
  row = false,
  required = false,
  disabled = false,
  ...props
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          error={!!error}
          required={required}
          disabled={disabled}
          {...props}
        >
          {label && <FormLabel>{label}</FormLabel>}
          <RadioGroup {...field} row={row}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
