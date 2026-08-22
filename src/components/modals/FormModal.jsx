import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  LinearProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

export default function FormModal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
  maxWidth = "sm",
  fullWidth = true,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {title}
          <IconButton size="small" onClick={onClose} disabled={loading}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      {loading && <LinearProgress />}
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={loading}>
          {loading ? "Saving..." : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
