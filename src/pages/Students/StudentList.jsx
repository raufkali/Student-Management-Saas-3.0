import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Alert,
  Fab,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  TrendingUp as PromoteIcon,
  TrendingDown as FailIcon,
} from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { useSnackbar } from "notistack";

export default function StudentList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk actions
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [failDialogOpen, setFailDialogOpen] = useState(false);
  const [bulkGrade, setBulkGrade] = useState("");
  const [bulkNewGrade, setBulkNewGrade] = useState("");
  const [bulkAcademicYear, setBulkAcademicYear] = useState("");
  const [bulkStatus, setBulkStatus] = useState("active");

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, search]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/students", {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
        },
      });

      if (response.data.success) {
        const data = response.data.data;
        let studentsList = [];
        let totalCount = 0;

        if (data.students) {
          studentsList = data.students;
          totalCount = data.pagination?.total || data.students.length;
        } else if (Array.isArray(data)) {
          studentsList = data;
          totalCount = data.length;
        } else if (data.items) {
          studentsList = data.items;
          totalCount = data.pagination?.total || 0;
        }

        setStudents(studentsList);
        setTotal(totalCount);
      } else {
        setError(response.data.message || "Failed to load students");
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setError(error.response?.data?.message || "Network error");
      enqueueSnackbar("Failed to load students", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ---------- DELETE HANDLING ----------
  const openDeleteDialog = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/students/${studentToDelete._id}`);
      enqueueSnackbar("Student deleted successfully", { variant: "success" });
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      fetchStudents(); // refresh list
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to delete student";
      enqueueSnackbar(errorMsg, { variant: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // ---------- STATUS COLOR ----------
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "graduated":
        return "info";
      case "withdrawn":
        return "warning";
      case "suspended":
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  // ---------- INLINE EDITING ----------
  const handleEditClick = (student) => {
    setEditingId(student._id);
    setEditData({
      grade: student.grade || "",
      section: student.section || "",
      status: student.status || "active",
    });
  };

  const handleEditChange = (field) => (e) => {
    setEditData({ ...editData, [field]: e.target.value });
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/students/${id}`, editData);
      enqueueSnackbar("Student updated successfully", { variant: "success" });
      setEditingId(null);
      fetchStudents();
    } catch (error) {
      enqueueSnackbar("Failed to update student", { variant: "error" });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // ---------- BULK ACTIONS ----------
  const handlePromote = async () => {
    try {
      await api.post("/students/promote", {
        grade: bulkGrade,
        newGrade: bulkNewGrade,
        academicYear: bulkAcademicYear,
        status: bulkStatus,
      });
      enqueueSnackbar("Students promoted successfully", { variant: "success" });
      setPromoteDialogOpen(false);
      fetchStudents();
    } catch (error) {
      enqueueSnackbar("Failed to promote students", { variant: "error" });
    }
  };

  const handleFail = async () => {
    try {
      await api.post("/students/fail", {
        grade: bulkGrade,
        academicYear: bulkAcademicYear,
        status: "failed",
      });
      enqueueSnackbar("Students marked as failed", { variant: "success" });
      setFailDialogOpen(false);
      fetchStudents();
    } catch (error) {
      enqueueSnackbar("Failed to mark students as failed", {
        variant: "error",
      });
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Students
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage all student records
        </Typography>
      </Box>

      <Card sx={{ overflow: "visible" }}>
        <CardContent>
          {/* Search and Actions */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search students..."
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
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/students/add")}
            >
              Add Student
            </Button>
            <Button
              variant="outlined"
              startIcon={<PromoteIcon />}
              onClick={() => setPromoteDialogOpen(true)}
            >
              Promote
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<FailIcon />}
              onClick={() => setFailDialogOpen(true)}
            >
              Fail
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
                      <TableCell>Reg. No</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Section</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No students found. Click "Add Student" to create
                            one.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell>
                            {student.registrationNumber || "—"}
                          </TableCell>
                          <TableCell>
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            {editingId === student._id ? (
                              <TextField
                                size="small"
                                value={editData.grade}
                                onChange={handleEditChange("grade")}
                                sx={{ width: 80 }}
                              />
                            ) : (
                              student.grade
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === student._id ? (
                              <TextField
                                size="small"
                                value={editData.section || ""}
                                onChange={handleEditChange("section")}
                                sx={{ width: 80 }}
                              />
                            ) : (
                              student.section || "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === student._id ? (
                              <Select
                                size="small"
                                value={editData.status}
                                onChange={handleEditChange("status")}
                                sx={{ minWidth: 100 }}
                              >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="graduated">Graduated</MenuItem>
                                <MenuItem value="withdrawn">Withdrawn</MenuItem>
                                <MenuItem value="suspended">Suspended</MenuItem>
                                <MenuItem value="failed">Failed</MenuItem>
                              </Select>
                            ) : (
                              <Chip
                                label={student.status}
                                color={getStatusColor(student.status)}
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {editingId === student._id ? (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleSaveEdit(student._id)}
                                >
                                  <SaveIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={handleCancelEdit}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(`/students/${student._id}`)
                                  }
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditClick(student)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => openDeleteDialog(student)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
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

      {/* Promote Dialog */}
      <Dialog
        open={promoteDialogOpen}
        onClose={() => setPromoteDialogOpen(false)}
      >
        <DialogTitle>Promote Students</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Promote all students from a specific grade to the next grade.
          </DialogContentText>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Current Grade"
              value={bulkGrade}
              onChange={(e) => setBulkGrade(e.target.value.toUpperCase())}
              size="small"
            />
            <TextField
              label="New Grade"
              value={bulkNewGrade}
              onChange={(e) => setBulkNewGrade(e.target.value.toUpperCase())}
              size="small"
            />
            <TextField
              label="Academic Year"
              value={bulkAcademicYear}
              onChange={(e) => setBulkAcademicYear(e.target.value)}
              size="small"
            />
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              size="small"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="graduated">Graduated</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromoteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePromote}>
            Promote
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fail Dialog */}
      <Dialog open={failDialogOpen} onClose={() => setFailDialogOpen(false)}>
        <DialogTitle>Mark Students as Failed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Mark all students from a specific grade as failed for the academic
            year.
          </DialogContentText>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Grade"
              value={bulkGrade}
              onChange={(e) => setBulkGrade(e.target.value.toUpperCase())}
              size="small"
            />
            <TextField
              label="Academic Year"
              value={bulkAcademicYear}
              onChange={(e) => setBulkAcademicYear(e.target.value)}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFailDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleFail}>
            Mark as Failed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the student "
            {studentToDelete?.firstName} {studentToDelete?.lastName}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate("/students/add")}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 9999,
        }}
      >
        <AddIcon />
      </Fab>
    </MainLayout>
  );
}
