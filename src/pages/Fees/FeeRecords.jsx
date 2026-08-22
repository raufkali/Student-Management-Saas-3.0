import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { useSnackbar } from "notistack";

export default function FeeRecords() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, [page, rowsPerPage, search]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/fees/records", {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
        },
      });
      if (response.data.success) {
        const data = response.data.data;
        setRecords(data || []);
        setTotal(data.length); // or from pagination if available
      } else {
        setError(response.data.message || "Failed to load fee records");
      }
    } catch (error) {
      console.error("Failed to fetch fee records:", error);
      setError(error.response?.data?.message || "Network error");
      enqueueSnackbar("Failed to load fee records", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (id) => {
    window.open(`/api/fees/records/${id}/receipt`, "_blank");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "partial":
        return "warning";
      case "pending":
        return "info";
      case "overdue":
        return "error";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Fee Records
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View all fee records and download receipts
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search by student name..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchRecords}
            >
              Refresh
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <LinearProgress />
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Academic Year</TableCell>
                      <TableCell>Total Fee</TableCell>
                      <TableCell>Paid</TableCell>
                      <TableCell>Remaining</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Receipt</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No fee records found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>
                            {record.studentName ||
                              record.studentId?.fullName ||
                              "Unknown"}
                          </TableCell>
                          <TableCell>{record.studentClass}</TableCell>
                          <TableCell>{record.academicYear}</TableCell>
                          <TableCell>${record.totalFee?.toFixed(2)}</TableCell>
                          <TableCell>${record.totalPaid?.toFixed(2)}</TableCell>
                          <TableCell>
                            ${record.totalRemaining?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              color={getStatusColor(record.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {record.payments && record.payments.length > 0 && (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDownloadReceipt(record._id)
                                }
                                color="primary"
                              >
                                <ReceiptIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
