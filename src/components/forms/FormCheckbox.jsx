import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Controller } from "react-hook-form";

export default function FormCheckbox({
  name,
  control,
  label,
  disabled = false,
  ...props
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Checkbox
              {...field}
              checked={field.value || false}
              disabled={disabled}
              {...props}
            />
          }
          label={label}
        />
      )}
    />
  );
}
