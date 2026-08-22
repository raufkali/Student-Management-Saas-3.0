import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const drawerWidth = 260;

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { path: "/students", label: "Students", icon: PeopleIcon },
  { path: "/documents", label: "Documents", icon: DescriptionIcon },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} letterSpacing={-0.5}>
          Student Management
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                cursor: "pointer",
                bgcolor: isActive ? "primary.main" : "transparent",
                color: isActive ? "primary.contrastText" : "text.primary",
                "&:hover": {
                  bgcolor: isActive ? "primary.dark" : "action.hover",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
            {user?.firstName?.[0] || "U"}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={toggleTheme}
          size="small"
          sx={{
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          {mode === "light" ? (
            <DarkIcon fontSize="small" />
          ) : (
            <LightIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
}
