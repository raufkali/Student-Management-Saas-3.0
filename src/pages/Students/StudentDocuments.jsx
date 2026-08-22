import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  IconButton,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { useSnackbar } from "notistack";

export default function StudentDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [student, setStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "student",
    file: null,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [studentRes, docsRes] = await Promise.all([
        api.get(`/students/${id}`),
        api.get(`/documents/student/${id}`),
      ]);
      if (studentRes.data.success) {
        setStudent(studentRes.data.data.student);
      }
      if (docsRes.data.success) {
        setDocuments(docsRes.data.data.documents || []);
      }
    } catch (error) {
      enqueueSnackbar("Failed to load data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0],
    });
  };

  const handleUpload = async () => {
    if (!formData.file || !formData.title) {
      enqueueSnackbar("Please fill in all required fields", {
        variant: "warning",
      });
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append("document", formData.file);
    data.append("title", formData.title);
    data.append("description", formData.description || "");
    data.append("category", formData.category);
    data.append("studentId", id);

    try {
      const response = await api.post("/documents/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        enqueueSnackbar("Document uploaded successfully", {
          variant: "success",
        });
        setDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          category: "student",
          file: null,
        });
        fetchData();
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || "Upload failed", {
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId) => {
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `document-${docId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      enqueueSnackbar("Download failed", { variant: "error" });
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await api.delete(`/documents/${docId}`);
      enqueueSnackbar("Document deleted", { variant: "success" });
      fetchData();
    } catch (error) {
      enqueueSnackbar("Delete failed", { variant: "error" });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ width: "100%", mt: 4 }}>
          <LinearProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/students/${id}`)}
            variant="text"
            size="small"
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight={600}>
            Documents
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Upload Document
            </Button>
          </Box>
        </Box>
        {student && (
          <Typography variant="body2" color="text.secondary">
            {student.firstName} {student.lastName} - {student.studentId}
          </Typography>
        )}
      </Box>

      <Card>
        <CardContent>
          {documents.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <DescriptionIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <Typography color="text.secondary">
                No documents uploaded
              </Typography>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Upload First Document
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc._id}>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>{doc.description || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={doc.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </TableCell>
                      <TableCell>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(doc._id)}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(doc._id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              size="small"
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={2}
              size="small"
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              size="small"
              fullWidth
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="administrative">Administrative</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mt: 1 }}
            >
              Choose File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {formData.file && (
              <Typography variant="caption" color="text.secondary">
                Selected: {formData.file.name} (
                {(formData.file.size / 1024).toFixed(1)} KB)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !formData.file}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
