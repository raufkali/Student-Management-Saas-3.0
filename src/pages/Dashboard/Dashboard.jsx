// frontend/src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { useSnackbar } from "notistack";

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            borderRadius: "50%",
            p: 1,
            mr: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ color: `${color}.main` }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={600}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalDocuments: 0,
    recentEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get student statistics
      const response = await api.get("/students/statistics");
      console.log("Stats response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        // Handle both possible response structures
        const statsData = data.statistics || data || {};

        setStats({
          totalStudents: statsData.total || 0,
          activeStudents: statsData.active || 0,
          recentEnrollments: statsData.recentEnrollments || 0,
          totalDocuments: 0, // Will be updated by document stats if available
        });
      }

      // Try to get document statistics
      try {
        const docResponse = await api.get("/documents/statistics");
        if (docResponse.data.success) {
          const docData = docResponse.data.data;
          setStats((prev) => ({
            ...prev,
            totalDocuments: docData.total || 0,
          }));
        }
      } catch (docError) {
        // Document stats might not be available, ignore
        console.log("Document stats not available");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      enqueueSnackbar("Failed to load statistics", { variant: "error" });
    } finally {
      setLoading(false);
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
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your student management system
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={PeopleIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Students"
            value={stats.activeStudents}
            subtitle={`${stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}% of total`}
            icon={SchoolIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Enrollments"
            value={stats.recentEnrollments}
            subtitle="Last 30 days"
            icon={TrendingUpIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Documents"
            value={stats.totalDocuments}
            icon={DescriptionIcon}
            color="info"
          />
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => navigate("/students/add")}
            >
              Add New Student
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={() => navigate("/students")}>
              View All Students
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </MainLayout>
  );
}
