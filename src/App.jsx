import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SnackbarProvider } from "notistack";
import { CssBaseline, LinearProgress, Box } from "@mui/material";

const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const StudentList = lazy(() => import("./pages/Students/StudentList"));
const AddStudent = lazy(() => import("./pages/Students/AddStudent"));
const EditStudent = lazy(() => import("./pages/Students/EditStudent"));
const StudentProfile = lazy(() => import("./pages/Students/StudentProfile"));
const StudentDocuments = lazy(
  () => import("./pages/Students/StudentDocuments"),
);
const Settings = lazy(() => import("./pages/Settings/Settings"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Documents = lazy(() => import("./pages/Documents/Documents"));
const FeeRecords = lazy(() => import("./pages/Fees/FeeRecords")); // NEW

function LoadingFallback() {
  return (
    <Box sx={{ width: "100%", mt: 4 }}>
      <LinearProgress />
    </Box>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <CssBaseline />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/students"
                  element={
                    <PrivateRoute>
                      <StudentList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/students/add"
                  element={
                    <PrivateRoute>
                      <AddStudent />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/students/edit/:id"
                  element={
                    <PrivateRoute>
                      <EditStudent />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/students/:id"
                  element={
                    <PrivateRoute>
                      <StudentProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/students/:id/documents"
                  element={
                    <PrivateRoute>
                      <StudentDocuments />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/documents"
                  element={
                    <PrivateRoute>
                      <Documents />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/fees"
                  element={
                    <PrivateRoute>
                      <FeeRecords />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
