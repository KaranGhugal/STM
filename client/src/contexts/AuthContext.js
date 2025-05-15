import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  setAuthToken,
  getAuthToken,
  clearAuth,
  setUserData,
  getUserData,
  scheduleTokenExpirationCheck,
} from "../utils/authUtils";
import { DarkModeContext } from "../App";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const logoutTimerRef = useRef(null);
  const navigate = useNavigate();
  const { setDarkMode } = useContext(DarkModeContext);

  const syncUserState = useCallback(() => {
    try {
      const token = getAuthToken();
      const userData = getUserData();

      console.log("Syncing user state with stored data:", {
        hasToken: !!token,
        hasUserData: !!userData,
      });

      if (token && userData) {
        setCurrentUser(userData);
        console.log("Successfully synced user state with stored data");
        return true;
      } else {
        console.log("No valid stored data found during sync");
        return false;
      }
    } catch (err) {
      console.error("Error syncing user state:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const syncResult = await syncUserState();

        if (!syncResult) {
          console.log("Could not initialize from stored data, clearing auth");
          clearAuth();
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        clearAuth();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [syncUserState]);

  const logout = useCallback(() => {
    clearAuth();
    setCurrentUser(null);
    clearTimeout(logoutTimerRef.current);
    setDarkMode(false);
    localStorage.setItem("darkMode", JSON.stringify(false));
    console.log("Successfully logged out and reset dark mode");
    navigate("/login", { replace: true });
  }, [setDarkMode, navigate]);

  const login = useCallback(
    async (user, token) => {
      try {
        const tokenStored = setAuthToken(token);
        const userStored = setUserData(user);

        if (!tokenStored || !userStored) {
          throw new Error("Failed to store authentication data");
        }

        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }

        logoutTimerRef.current = scheduleTokenExpirationCheck(() => {
          logout();
          navigate("/login", { state: { sessionExpired: true } });
        });

        setCurrentUser(user);
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },
    [logout, navigate]
  );

  const register = async (name, email, phone, password, confirmPassword, photo) => {
    setError(null);
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await axios.post(`${API_BASE_URL}/api/users/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log("Register response:", response.status);
      return true;
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.error || "Failed to register. Please try again."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    setError(null);
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data;

      if (!updatedUser) {
        throw new Error("Invalid response from server");
      }

      const userStored = setUserData(updatedUser);

      if (!userStored) {
        throw new Error("Failed to store updated user data");
      }

      setCurrentUser(updatedUser);

      console.log("Profile updated successfully");
      return true;
    } catch (err) {
      console.error("Profile update error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to update profile. Please try again."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateToken = useCallback(async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        return false;
      }

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

      const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (err) {
      console.error("Token validation error:", err);
      return false;
    }
  }, []);

  const changePassword = async (currentPassword, newPassword) => {
    setError(null);
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        { currentPassword, password: newPassword, confirmPassword: newPassword },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Password changed successfully");
      return true;
    } catch (err) {
      console.error("Password change error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to change password. Please try again."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    setError(null);
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

      await axios.post(`${API_BASE_URL}/api/users/forgot-password`, { email });

      console.log("Password reset email sent");
      return true;
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to send password reset email. Please try again."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    setError(null);
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

      await axios.post(`${API_BASE_URL}/api/users/reset-password/${token}`, {
        password,
        confirmPassword
      });

      console.log("Password reset successful");
      return true;
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to reset password. Please try again."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    validateToken,
    changePassword,
    requestPasswordReset,
    resetPassword,
    syncUserState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;