import { useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getAuthToken,
  clearAuth,
  scheduleTokenExpirationCheck ,
} from "../../../utils/authUtils";
import { jwtDecode } from 'jwt-decode';

/**
 * Custom hook for task-related API calls
 * @returns {Object} API request functions
 */
const useTaskApi = () => {
  // Add React Router's navigation hook
  const navigate = useNavigate();

  // Base API URL - should match your backend configuration
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Handle authentication errors
  const handleAuthError = useCallback(() => {
    console.warn("Authentication error occurred");
    // Clear auth data using utility function
    clearAuth();

    // Don't navigate here - let the protected route handle redirection
    return false; // Return a value to indicate auth failure
  }, []);

  // Create an axios instance with auth headers
// useTaskApi.js - Modify createAuthAxios
const createAuthAxios = useCallback(() => {
  const token = getAuthToken();
  
  if (!token) {
    handleAuthError();
    return null;
  }

  // Verify token expiration before creating instance
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      handleAuthError();
      return null;
    }
  } catch (error) {
    handleAuthError();
    return null;
  }

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.trim()}`,
    },
    withCredentials: true,
  });
}, [API_BASE_URL, handleAuthError]);

  // Format data for API requests
  const formatTaskData = useCallback((data) => {
    const formattedData = { ...data };

    // Format date if it exists
    if (formattedData.dueDate instanceof Date) {
      formattedData.dueDate = formattedData.dueDate.toISOString();
    }

    // Format sharedWith to ensure it's in the correct format (only IDs)
    if (formattedData.sharedWith && Array.isArray(formattedData.sharedWith)) {
      // Check if sharedWith is an array of strings or objects
      // If it's an array of objects, extract the _id property
      formattedData.sharedWith = formattedData.sharedWith.map((user) =>
        typeof user === "string" ? user : user._id || user.id
      );
    }

    return formattedData;
  }, []);

  // Helper function to handle API errors
  const handleApiError = useCallback(
    (error, operation) => {
      console.error(`API Error - ${operation}:`, error);

      // More detailed error logging
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);

        // Handle authentication errors specifically
        if (error.response.status === 401) {
          console.warn("401 Unauthorized error detected");
          handleAuthError();
          return Promise.reject(new Error("Authentication required"));
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
      } else {
        // Something else caused the error
        console.error("Error message:", error.message);
      }

      const errorMessage = error.response?.data?.message || error.message;
      return Promise.reject(new Error(errorMessage));
    },
    [handleAuthError]
  );

  // Get all tasks
  const getTasks = useCallback(async () => {
    try {
      const token = getAuthToken(); // Retrieve the token using the utility function
      // Debug token retrieval
      console.log("Token exists:", !!token);

      if (!token) {
        console.warn("No token available for API request");
        return Promise.reject(new Error("Authentication required"));
      }

      // Log the actual token value (first few characters only for security)
      if (token && typeof token === "string") {
        const safeToken = token.substring(0, 10) + "...";
        console.log("Token preview:", safeToken);
      }

      const authAxios = createAuthAxios();
      if (!authAxios) {
        console.warn("Failed to create authenticated axios instance");
        return Promise.reject(new Error("Authentication configuration failed"));
      }

      // Debug the request headers
      console.log("Request headers:", authAxios.defaults.headers);

      const response = await authAxios.get("/api/tasks");
      return response.data.tasks || response.data || [];
    } catch (error) {
      // Enhanced error logging
      console.error("Error in getTasks:");
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
        console.error(`Headers:`, error.response.headers);
      }
      return handleApiError(error, "getTasks");
    }
  }, [createAuthAxios, handleApiError]);

  // Create a new task
  const createTask = useCallback(
    async (taskData) => {
      try {
        const authAxios = createAuthAxios();

        if (!authAxios) {
          console.warn("No auth axios for create task");
          return null;
        }

        const formattedData = formatTaskData(taskData);
        const response = await authAxios.post("/api/tasks", formattedData);
        return response.data.task || response.data;
      } catch (error) {
        return handleApiError(error, "createTask");
      }
    },
    [createAuthAxios, formatTaskData, handleApiError]
  );

  // Update an existing task
  const updateTask = useCallback(
    async (taskId, taskData) => {
      try {
        const authAxios = createAuthAxios();

        if (!authAxios) {
          console.warn("No auth axios for update task");
          return null;
        }

        // Get the current task first to preserve fields we're not updating
        let currentTask;
        try {
          const response = await authAxios.get(`/api/tasks/${taskId}`);
          currentTask = response.data.task || response.data;
        } catch (error) {
          // If we can't get the current task, proceed with just the updates
          console.warn("Couldn't fetch current task before update:", error);
        }

        // Merge the current task with the updates
        const mergedData = currentTask
          ? { ...currentTask, ...taskData }
          : taskData;

        const formattedData = formatTaskData(mergedData);

        // More detailed debugging for the update request
        console.log(`Updating task ${taskId} with data:`, formattedData);

        const response = await authAxios.put(
          `/api/tasks/${taskId}`,
          formattedData
        );

        return response.data.task || response.data;
      } catch (error) {
        console.error("Update task error details:", error);
        return handleApiError(error, "updateTask");
      }
    },
    [createAuthAxios, formatTaskData, handleApiError]
  );

  // Update just the task status
  const updateTaskStatus = useCallback(
    async (taskId, newStatus) => {
      try {
        const authAxios = createAuthAxios();
  
        if (!authAxios) {
          console.warn("No auth axios for update task status");
          return null;
        }
  
        if (!taskId) {
          console.error("Missing task ID for status update");
          throw new Error("Task ID is required for status update");
        }
  
        // Add logging to debug the newStatus value
        console.log(`Updating task ${taskId} status to:`, newStatus);
  
        if (!newStatus || !["pending", "in-progress", "completed"].includes(newStatus)) {
          console.error("Invalid or missing status value:", newStatus);
          throw new Error("Invalid status value");
        }
  
        const response = await authAxios.patch(`/api/tasks/${taskId}/status`, {
          status: newStatus,
        });
  
        return response.data.task || response.data;
      } catch (error) {
        // If the specific status endpoint doesn't exist, fall back to regular update
        if (error.response && error.response.status === 404) {
          console.log("Status endpoint not found, falling back to regular update");
          return updateTask(taskId, { status: newStatus });
        }
  
        return handleApiError(error, "updateTaskStatus");
      }
    },
    [createAuthAxios, updateTask, handleApiError]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId) => {
      try {
        const authAxios = createAuthAxios();

        if (!authAxios) {
          console.warn("No auth axios for delete task");
          return false;
        }

        await authAxios.delete(`/api/tasks/${taskId}`);
        return true;
      } catch (error) {
        return handleApiError(error, "deleteTask");
      }
    },
    [createAuthAxios, handleApiError]
  );

  // Share a task with another user
  const shareTask = useCallback(
    async (taskId, userId) => {
      try {
        const authAxios = createAuthAxios();

        if (!authAxios) {
          console.warn("No auth axios for share task");
          return false;
        }

        await authAxios.patch(`/api/tasks/${taskId}/share`, {
          sharedWith: userId,
        });
        return true;
      } catch (error) {
        return handleApiError(error, "shareTask");
      }
    },
    [createAuthAxios, handleApiError]
  );

  return {
    getTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    shareTask,
  };
};

export default useTaskApi;
