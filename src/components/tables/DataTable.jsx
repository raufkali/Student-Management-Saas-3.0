import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from "@mui/material";

export default function DataTable({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  rowKey = "id",
  onRowClick,
  actions,
}) {
  if (loading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.align || "left"}
                sx={{ fontWeight: 600 }}
              >
                {col.label}
              </TableCell>
            ))}
            {actions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row[rowKey]}
              hover
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align || "left"}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </TableCell>
              ))}
              {actions && (
                <TableCell align="right">
                  {typeof actions === "function" ? actions(row) : actions}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
