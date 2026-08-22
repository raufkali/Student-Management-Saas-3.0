import React from "react";
import { Box, Typography, Link } from "@mui/material";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        borderTop: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {"© "}
        <Link color="inherit" href="#" underline="none">
          Student Management System
        </Link>{" "}
        {currentYear}
        {". All rights reserved."}
      </Typography>
    </Box>
  );
}
