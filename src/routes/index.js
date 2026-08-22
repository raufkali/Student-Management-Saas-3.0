import React from "react";
import { Navigate } from "react-router-dom";

// Lazy load pages
const Login = React.lazy(() => import("../pages/Login/Login"));
const Dashboard = React.lazy(() => import("../pages/Dashboard/Dashboard"));
const StudentList = React.lazy(() => import("../pages/Students/StudentList"));
const AddStudent = React.lazy(() => import("../pages/Students/AddStudent"));
const EditStudent = React.lazy(() => import("../pages/Students/EditStudent"));
const StudentProfile = React.lazy(
  () => import("../pages/Students/StudentProfile"),
);
const StudentDocuments = React.lazy(
  () => import("../pages/Students/StudentDocuments"),
);
const Settings = React.lazy(() => import("../pages/Settings/Settings"));
const Profile = React.lazy(() => import("../pages/Profile/Profile"));

// Route configuration
export const routes = [
  {
    path: "/login",
    element: Login,
    isPublic: true,
  },
  {
    path: "/",
    element: Dashboard,
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    element: Dashboard,
    label: "Dashboard",
    icon: "DashboardIcon",
  },
  {
    path: "/students",
    element: StudentList,
    label: "Students",
    icon: "PeopleIcon",
  },
  {
    path: "/students/add",
    element: AddStudent,
    label: "Add Student",
    icon: "AddIcon",
    hideInMenu: true,
  },
  {
    path: "/students/edit/:id",
    element: EditStudent,
    label: "Edit Student",
    icon: "EditIcon",
    hideInMenu: true,
  },
  {
    path: "/students/:id",
    element: StudentProfile,
    label: "Student Profile",
    icon: "PersonIcon",
    hideInMenu: true,
  },
  {
    path: "/students/:id/documents",
    element: StudentDocuments,
    label: "Student Documents",
    icon: "DescriptionIcon",
    hideInMenu: true,
  },
  {
    path: "/settings",
    element: Settings,
    label: "Settings",
    icon: "SettingsIcon",
  },
  {
    path: "/profile",
    element: Profile,
    label: "Profile",
    icon: "PersonIcon",
    hideInMenu: true,
  },
];

// Protected route wrapper
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public route wrapper
export const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};
