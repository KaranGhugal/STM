/**
 * Authentication utility functions for managing JWT tokens
 * Handles token storage, retrieval, validation, and cleanup
 */

import { jwtDecode } from "jwt-decode";

// Constants
const TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";
const TOKEN_EXP_KEY = "tokenExpiration";

/**
 * Store authentication token in localStorage
 * @param {string} token - JWT token string
 */
export const setAuthToken = (token) => {
  if (!token) {
    console.error("Attempted to store empty token");
    return false;
  }

  try {
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Failed to store authentication token:", error);
    return false;
  }
};

/**
 * Store user data in localStorage
 * @param {Object} userData - User data object including role details
 */
export const setUserData = (userData) => {
  if (!userData) {
    console.error("Attempted to store empty user data");
    return false;
  }

  try {
    // Make sure userData has an ID and role before storing
    if (!userData.id && !userData._id) {
      console.error("User data missing ID, cannot store");
      return false;
    }
    if (!userData.role) {
      console.warn("User data missing role, storing with default 'user'");
      userData.role = "user";
    }

    const userDataString = JSON.stringify(userData);
    localStorage.setItem(USER_DATA_KEY, userDataString);

    // Verify it was stored correctly
    const storedData = localStorage.getItem(USER_DATA_KEY);
    if (!storedData) {
      console.error("Failed to verify user data storage");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to store user data:", error);
    return false;
  }
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.log("No token found in storage");
      return null;
    }

    // Sanitize token
    const sanitizedToken = token.trim().replace(/['"]+/g, "");

    // Validate token format
    const tokenParts = sanitizedToken.split('.');
    if (tokenParts.length !== 3) {
      console.error("Invalid token format in storage:", sanitizedToken);
      localStorage.removeItem(TOKEN_KEY); // Clear invalid token
      return null;
    }

    return sanitizedToken;
  } catch (error) {
    console.error("Token retrieval failed:", error);
    return null;
  }
};

/**
 * Get user data from localStorage
 * @returns {Object|null} User data including role or null if not found
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);

    if (!userData) {
      console.log("No user data found in storage");
      return null;
    }

    const parsedData = JSON.parse(userData);

    // Verify that the parsed data is valid
    if (!parsedData || typeof parsedData !== "object") {
      console.error("Invalid user data format in storage");
      return null;
    }

    // Check if data has minimum required fields
    if (!parsedData.id && !parsedData._id) {
      console.error("Retrieved user data missing ID");
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error("Failed to retrieve user data:", error);
    return null;
  }
};

/**
 * Check if user is authenticated (has a token)
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Display a warning message for impending token expiration
 */
export const showExpirationWarning = () => {
  alert(
    "Your session will expire in 1 minute. Please save your work and refresh your session."
  );
};

/**
 * Check if token is expired
 * @returns {boolean} True if token appears expired
 */
export const scheduleTokenExpirationCheck = (logoutCallback) => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const expiresIn = decoded.exp * 1000 - Date.now();
    const warningTime = 300 * 1000; // 1 minute in milliseconds

    if (expiresIn <= 0) {
      console.log("Token already expired, triggering logout");
      logoutCallback();
      return null;
    }

    // Schedule warning 1 minute before expiration if enough time remains
    if (expiresIn > warningTime) {
      console.log(
        `Scheduling expiration warning in ${expiresIn - warningTime}ms`
      );
      setTimeout(() => {
        console.log("Token expiration warning triggered");
        showExpirationWarning();
      }, expiresIn - warningTime);
    } else {
      console.log("Token expires in less than 1 minute, skipping warning");
    }

    console.log(`Scheduling logout in ${expiresIn}ms`);
    return setTimeout(() => {
      console.log("Token expiration timer triggered");
      logoutCallback();
    }, expiresIn);
  } catch (error) {
    console.error("Error scheduling token expiration:", error);
    return null;
  }
};

/**
 * Clear all authentication data from storage
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(TOKEN_EXP_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear authentication data:", error);
    return false;
  }
};

/**
 * Handle successful login by storing token and user data
 * @param {Object} loginResponse - Response from login API
 * @returns {boolean} Success status
 */
export const handleLoginSuccess = (loginResponse) => {
  try {
    const { token, user, role } = loginResponse;
    if (!token) {
      console.error("No token provided in login response");
      return false;
    }

    // Validate token format (basic check for JWT structure)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error("Invalid token format:", token);
      return false;
    }

    // Decode token to verify its structure
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) {
      console.error("Invalid token payload:", decoded);
      return false;
    }

    // Store expiration time
    localStorage.setItem(TOKEN_EXP_KEY, decoded.exp * 1000);

    // Combine user and role data
    const userData = {
      ...user,
      role: role.role,
      roleId: role.roleId
    };

    // Store token and user data
    const tokenStored = setAuthToken(token);
    const userStored = setUserData(userData);
    console.log("Token stored:", tokenStored, "User stored:", userStored, "Token:", token);

    return tokenStored && userStored;
  } catch (error) {
    console.error("Failed to process login:", error);
    return false;
  }
};

export const testStorage = () => {
  try {
    // Clear test values first
    localStorage.removeItem("test_key");

    // Try to store and retrieve a simple value
    localStorage.setItem("test_key", "test_value");
    const testValue = localStorage.getItem("test_key");

    console.log("Storage test:", {
      success: testValue === "test_value",
      value: testValue,
    });

    return testValue === "test_value";
  } catch (error) {
    console.error("Storage test failed:", error);
    return false;
  }
};

/**
 * Get authorization header with bearer token
 * @returns {Object|null} Headers object or null if no token
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  console.log("Auth token for request (length):", token ? token.length : 'No token');
  console.log("Auth token for request (first 50 chars):", token ? token.substring(0, 50) + '...' : 'No token');
  return token ? { Authorization: `Bearer ${token}` } : null;
};