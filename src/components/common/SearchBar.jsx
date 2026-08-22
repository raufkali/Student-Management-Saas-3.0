import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  size = "small",
  fullWidth = true,
}) {
  return (
    <TextField
      size={size}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: value && onClear && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={onClear}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
