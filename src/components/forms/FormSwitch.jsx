import React from "react";
import { FormControlLabel, Switch } from "@mui/material";
import { Controller } from "react-hook-form";

export default function FormSwitch({
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
            <Switch
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
