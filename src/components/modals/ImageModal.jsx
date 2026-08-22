import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  DialogTitle,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

export default function ImageModal({ open, onClose, imageUrl, title }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={onClose} sx={{ bgcolor: "rgba(255,255,255,0.1)" }}>
          <CloseIcon sx={{ color: "white" }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", justifyContent: "center", p: 0 }}>
        <Box
          component="img"
          src={imageUrl}
          alt={title || "Image"}
          sx={{
            maxWidth: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
            borderRadius: 1,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
