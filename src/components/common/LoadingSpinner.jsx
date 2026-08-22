import React from "react";
import { Box, CircularProgress } from "@mui/material";

export default function LoadingSpinner({ size = 40, fullScreen = false }) {
  if (fullScreen) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <CircularProgress size={size} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        width: "100%",
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
}
