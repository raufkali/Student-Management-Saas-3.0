import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Description as DescriptionIcon } from "@mui/icons-material";

export default function EmptyState({
  title = "No data found",
  description = "There are no items to display at the moment.",
  icon: Icon = DescriptionIcon,
  actionText,
  onAction,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 4,
        textAlign: "center",
      }}
    >
      <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
}
