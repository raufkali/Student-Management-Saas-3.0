import React from "react";
import { Box, TextField, MenuItem, Button, Grid } from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";

export default function TableFilter({
  filters = [],
  values = {},
  onChange,
  onClear,
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {filters.map((filter) => (
          <Grid item xs={12} sm={6} md={3} key={filter.key}>
            {filter.type === "select" ? (
              <TextField
                select
                label={filter.label}
                value={values[filter.key] || ""}
                onChange={(e) => onChange(filter.key, e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="">All</MenuItem>
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label={filter.label}
                value={values[filter.key] || ""}
                onChange={(e) => onChange(filter.key, e.target.value)}
                size="small"
                fullWidth
                type={filter.type || "text"}
              />
            )}
          </Grid>
        ))}
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onClear}
            size="small"
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
