import React, { useState, useMemo, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SnackbarProvider } from "notistack";
import "./App.css";

import Navbar from "./components/Common/Navbar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import VerifyEmail from "./components/Auth/VerifyEmail";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import ResendVerification from "./components/Auth/ResendVerification";
import SideNav, { DRAWER_WIDTH, COLLAPSED_WIDTH } from "./components/Common/Sidenav";
import Home from "./Pages/Home/Home";
import Tasks from "./Pages/Tasks/Tasks";
import Settings from "./Pages/Settings/Settings";
import Profile from "./Pages/Profile/Profile";
import About from "./Pages/About/About";
import Roles from "./Pages/Roles/Roles";
import ProtectedRoute from "./components/ProtectedRoute";
import Messages from "./Pages/Messages/Messages";

export const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {}
});

const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const ProtectedLayout = () => {
  const { currentUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  return (
    <>
      <Navbar />
      {currentUser && (
        <SideNav onToggleDrawer={handleToggleDrawer} />
      )}
      <Box
        component="main"
        sx={{
          marginLeft: currentUser
            ? drawerOpen
              ? `${DRAWER_WIDTH}px`
              : `${COLLAPSED_WIDTH}px`
            : 0,
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          padding: 3,
          marginTop: "64px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Outlet />
      </Box>
    </>
  );
};

const AppContent = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/roles" element={<Roles />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("darkMode")) || false
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#3f51b5" },
          secondary: { main: "#f50057" },
          background: {
            default: darkMode ? "#121212" : "#ffffff",
            paper: darkMode ? "#1e1e1e" : "#f5f5f5",
          },
        },
        shape: {
          borderRadius: 8,
        },
        typography: {
          fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          h4: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                overflow: 'visible',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      return newMode;
    });
  };

  if (typeof window !== "undefined") {
    const originalError = console.error;
    console.error = (...args) => {
      if (/ResizeObserver/.test(args[0])) return;
      originalError(...args);
    };
  }

  return (
    <Router>
      <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </DarkModeContext.Provider>
    </Router>
  );
};

export default App;