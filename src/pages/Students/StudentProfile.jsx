import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  Button,
  Paper,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { useSnackbar } from "notistack";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await api.get(`/students/${id}`);
      if (response.data.success) {
        setStudent(response.data.data.student);
      }
    } catch (error) {
      enqueueSnackbar("Failed to load student data", { variant: "error" });
      navigate("/students");
    } finally {
      setLoading(false);
    }
  };

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
        return "error";
      default:
        return "default";
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

  if (!student) {
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
            Student Profile
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  fontSize: 32,
                }}
              >
                {student.firstName?.[0]}
                {student.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {student.firstName} {student.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Student ID: {student.studentId}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Chip
                    label={student.status}
                    color={getStatusColor(student.status)}
                    size="small"
                  />
                  <Chip
                    label={`Grade ${student.grade}`}
                    variant="outlined"
                    size="small"
                  />
                  {student.section && (
                    <Chip
                      label={`Section ${student.section}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </Box>
              <Box sx={{ ml: "auto" }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/students/edit/${id}`)}
                >
                  Edit
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body2">
                    {student.firstName} {student.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body2">
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Gender
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {student.gender || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Nationality
                  </Typography>
                  <Typography variant="body2">
                    {student.nationality || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Religion
                  </Typography>
                  <Typography variant="body2">
                    {student.religion || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2">
                      {student.email || "N/A"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body2">
                      {student.phone || "N/A"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body2">
                      {student.address
                        ? `${student.address.street || ""} ${student.address.city || ""} ${student.address.state || ""} ${student.address.country || ""}`.trim() ||
                          "N/A"
                        : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Academic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Grade
                  </Typography>
                  <Typography variant="body2">
                    {student.grade || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Section
                  </Typography>
                  <Typography variant="body2">
                    {student.section || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Roll Number
                  </Typography>
                  <Typography variant="body2">
                    {student.rollNumber || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Academic Year
                  </Typography>
                  <Typography variant="body2">
                    {student.academicYear || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Enrollment Date
                  </Typography>
                  <Typography variant="body2">
                    {student.enrollmentDate
                      ? new Date(student.enrollmentDate).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Guardian Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Guardian Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Father
                  </Typography>
                  <Typography variant="body2">
                    {student.fatherName || "N/A"}
                    {student.fatherPhone && ` (${student.fatherPhone})`}
                    {student.fatherOccupation &&
                      ` - ${student.fatherOccupation}`}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Mother
                  </Typography>
                  <Typography variant="body2">
                    {student.motherName || "N/A"}
                    {student.motherPhone && ` (${student.motherPhone})`}
                    {student.motherOccupation &&
                      ` - ${student.motherOccupation}`}
                  </Typography>
                </Grid>
                {student.guardianAddress && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Guardian Address
                    </Typography>
                    <Typography variant="body2">
                      {student.guardianAddress}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {student.medicalConditions && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Medical Conditions
                    </Typography>
                    <Typography variant="body2">
                      {student.medicalConditions}
                    </Typography>
                  </Grid>
                )}
                {student.specialNeeds && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Special Needs
                    </Typography>
                    <Typography variant="body2">
                      {student.specialNeeds}
                    </Typography>
                  </Grid>
                )}
                {student.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body2">{student.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
}
