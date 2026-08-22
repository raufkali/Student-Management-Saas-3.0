import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  TextField,
  Button,
  Divider,
  Paper,
  LinearProgress,
  Avatar,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";
import { useSnackbar } from "notistack";

export default function Settings() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    app_name: "Student Management System",
    app_version: "1.0.0",
    academic_year_start: new Date().getFullYear(),
    academic_year_end: new Date().getFullYear() + 1,
    max_students_per_class: 40,
    registration_fee: 100,
    tuition_fee: 500,
    late_fee_penalty: 50,
    enable_notifications: true,
    email_notifications: true,
    maintenance_mode: false,
    // School customization
    school_name: "",
    school_address: "",
    school_phone: "",
    school_email: "",
    school_logo: null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings");
      if (response.data.success) {
        const data = response.data.data.settings;
        const settingsObj = {};
        data.forEach((setting) => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings((prev) => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSettings((prev) => ({ ...prev, school_logo: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) =>
        api.post("/settings", { key, value }),
      );
      await Promise.all(promises);
      enqueueSnackbar("Settings saved successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to save settings", { variant: "error" });
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

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure system settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  General Settings
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save All"}
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Application Name"
                    value={settings.app_name}
                    onChange={handleChange("app_name")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Application Version"
                    value={settings.app_version}
                    onChange={handleChange("app_version")}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* School Customization */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                School Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="School Name"
                    value={settings.school_name || ""}
                    onChange={handleChange("school_name")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="School Address"
                    value={settings.school_address || ""}
                    onChange={handleChange("school_address")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="School Phone"
                    value={settings.school_phone || ""}
                    onChange={handleChange("school_phone")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="School Email"
                    value={settings.school_email || ""}
                    onChange={handleChange("school_email")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button variant="outlined" component="label">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleLogoUpload}
                      />
                    </Button>
                    {settings.school_logo && (
                      <Avatar
                        src={settings.school_logo}
                        sx={{ width: 80, height: 80 }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Academic Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Academic Year Start"
                    type="number"
                    value={settings.academic_year_start}
                    onChange={handleChange("academic_year_start")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Academic Year End"
                    type="number"
                    value={settings.academic_year_end}
                    onChange={handleChange("academic_year_end")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Max Students Per Class"
                    type="number"
                    value={settings.max_students_per_class}
                    onChange={handleChange("max_students_per_class")}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Financial Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Registration Fee"
                    type="number"
                    value={settings.registration_fee}
                    onChange={handleChange("registration_fee")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Tuition Fee"
                    type="number"
                    value={settings.tuition_fee}
                    onChange={handleChange("tuition_fee")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Late Fee Penalty"
                    type="number"
                    value={settings.late_fee_penalty}
                    onChange={handleChange("late_fee_penalty")}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Notification Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body1">
                        Enable Notifications
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Show system notifications
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.enable_notifications}
                      onChange={handleChange("enable_notifications")}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body1">
                        Email Notifications
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Send email notifications
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.email_notifications}
                      onChange={handleChange("email_notifications")}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body1">Maintenance Mode</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Put system in maintenance mode
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.maintenance_mode}
                      onChange={handleChange("maintenance_mode")}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
}
