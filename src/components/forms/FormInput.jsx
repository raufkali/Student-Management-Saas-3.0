import React from "react";
import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";

export default function FormInput({
  name,
  control,
  label,
  type = "text",
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
          label={label}
          type={type}
          required={required}
          disabled={disabled}
          fullWidth={fullWidth}
          size={size}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message}
          {...props}
        />
      )}
    />
  );
}
