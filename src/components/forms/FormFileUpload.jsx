import React, { useRef } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

export default function FormFileUpload({
  label = "Upload File",
  accept = "*",
  multiple = false,
  value = null,
  onChange,
  onRemove,
  error,
  helperText,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onChange(multiple ? files : files[0]);
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<UploadIcon />}
          fullWidth
        >
          {label}
        </Button>
      </label>

      {value && (
        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {value.name || "File selected"}
            {value.size && ` (${(value.size / 1024).toFixed(1)} KB)`}
          </Typography>
          <IconButton size="small" onClick={handleRemove}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
      {helperText && !error && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
