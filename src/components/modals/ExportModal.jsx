import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  LinearProgress,
} from "@mui/material";

export default function ExportModal({
  open,
  onClose,
  onExport,
  formats = ["json", "csv", "pdf"],
  loading = false,
}) {
  const [format, setFormat] = useState(formats[0]);

  const handleExport = () => {
    onExport(format);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Export Data</DialogTitle>
      {loading && <LinearProgress />}
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <FormControl>
            <FormLabel>Select export format</FormLabel>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {formats.map((f) => (
                <FormControlLabel
                  key={f}
                  value={f}
                  control={<Radio />}
                  label={f.toUpperCase()}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleExport} variant="contained" disabled={loading}>
          {loading ? "Exporting..." : "Export"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
