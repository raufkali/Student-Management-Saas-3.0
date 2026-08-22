import React from "react";
import { TextField, MenuItem } from "@mui/material";
import { Controller } from "react-hook-form";

export default function FormSelect({
  name,
  control,
  label,
  options = [],
  required = false,
  disabled = false,
  fullWidth = true,
  size = "small",
  placeholder,
  ...props
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          label={label}
          required={required}
          disabled={disabled}
          fullWidth={fullWidth}
          size={size}
          error={!!error}
          helperText={error?.message}
          {...props}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
