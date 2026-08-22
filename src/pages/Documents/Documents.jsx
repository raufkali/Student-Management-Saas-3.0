import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";

export default function Documents() {
  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Documents
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage all documents
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Document management feature coming soon...
          </Typography>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
