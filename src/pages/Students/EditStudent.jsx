import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  LinearProgress,
  Paper,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { useSnackbar } from "notistack";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await api.get(`/students/${id}`);
      if (response.data.success) {
        const student = response.data.data.student;
        setFormData({
          registrationNumber: student.registrationNumber || "",
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          dateOfBirth: student.dateOfBirth
            ? student.dateOfBirth.split("T")[0]
            : "",
          gender: student.gender || "",
          nationality: student.nationality || "",
          religion: student.religion || "",
          email: student.email || "",
          phone: student.phone || "",
          address: {
            street: student.address?.street || "",
            city: student.address?.city || "",
            state: student.address?.state || "",
            postalCode: student.address?.postalCode || "",
            country: student.address?.country || "",
          },
          grade: student.grade || "",
          section: student.section || "",
          rollNumber: student.rollNumber || "",
          academicYear: student.academicYear || "",
          fatherName: student.fatherName || "",
          fatherOccupation: student.fatherOccupation || "",
          fatherPhone: student.fatherPhone || "",
          fatherEmail: student.fatherEmail || "",
          motherName: student.motherName || "",
          motherOccupation: student.motherOccupation || "",
          motherPhone: student.motherPhone || "",
          motherEmail: student.motherEmail || "",
          guardianAddress: student.guardianAddress || "",
          status: student.status || "active",
          medicalConditions: student.medicalConditions || "",
          specialNeeds: student.specialNeeds || "",
          notes: student.notes || "",
        });
      }
    } catch (error) {
      enqueueSnackbar("Failed to load student data", { variant: "error" });
      navigate("/students");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // registrationNumber is not sent to backend (optional; we can leave it but backend may ignore)
      // To be safe, delete it from the payload
      const payload = { ...formData };
      delete payload.registrationNumber; // prevent accidental update
      const response = await api.put(`/students/${id}`, payload);
      if (response.data.success) {
        enqueueSnackbar("Student updated successfully", { variant: "success" });
        navigate("/students");
      }
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update student",
        { variant: "error" },
      );
    } finally {
      setSaving(false);
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

  if (!formData) {
    return (
      <MainLayout>
        <Typography>Student not found</Typography>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/students")}
            variant="text"
            size="small"
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight={600}>
            Edit Student
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Update the student's information below
        </Typography>
      </Box>

      {saving && <LinearProgress sx={{ mb: 3 }} />}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                {/* NEW: Registration Number (read‑only) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registration Number"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    size="small"
                    InputProps={{ readOnly: true }}
                    helperText="Registration number cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    size="small"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Contact Information – unchanged */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Academic Information – unchanged */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Academic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Roll Number"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    size="small"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="graduated">Graduated</MenuItem>
                    <MenuItem value="withdrawn">Withdrawn</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Guardian Information – unchanged */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Guardian Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Father's Name"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Father's Occupation"
                    name="fatherOccupation"
                    value={formData.fatherOccupation}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Father's Phone"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Father's Email"
                    name="fatherEmail"
                    type="email"
                    value={formData.fatherEmail}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mother's Name"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mother's Occupation"
                    name="motherOccupation"
                    value={formData.motherOccupation}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mother's Phone"
                    name="motherPhone"
                    value={formData.motherPhone}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mother's Email"
                    name="motherEmail"
                    type="email"
                    value={formData.motherEmail}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Guardian Address"
                    name="guardianAddress"
                    value={formData.guardianAddress}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Additional Information – unchanged */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Medical Conditions"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Needs"
                    name="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={() => navigate("/students")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? "Saving..." : "Update Student"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </MainLayout>
  );
}
