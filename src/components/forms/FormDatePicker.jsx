import React from "react";
import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";

export default function FormDatePicker({
  name,
  control,
  label,
  required = false,
  disabled = false,
  fullWidth = true,
  size = "small",
  ...props
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          type="date"
          label={label}
          required={required}
          disabled={disabled}
          fullWidth={fullWidth}
          size={size}
          error={!!error}
          helperText={error?.message}
          InputLabelProps={{ shrink: true }}
          {...props}
        />
      )}
    />
  );
}
