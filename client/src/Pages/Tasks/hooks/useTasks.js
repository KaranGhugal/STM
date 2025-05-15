import { useState, useCallback } from "react";
import useTaskApi from "./useTaskApi";

/**
 * Custom hook for managing tasks state and operations
 * @returns {Object} Task state and operations
 */
const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const taskApi = useTaskApi();

  // Notification helper - memo to prevent re-renders
  const showNotification = useCallback((message, severity) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const taskData = await taskApi.getTasks();
      // Make sure we have a valid array
      const validTaskData = Array.isArray(taskData) ? taskData : [];
      setTasks(validTaskData);

      // Silent success - don't show notification on every fetch
      // This helps prevent render loops
      return validTaskData;
    } catch (err) {
      console.error("Task fetch error:", err);
      setError(err);
      // Don't show notification here to avoid render loops
      setTasks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [taskApi]);

  // Create a new task
  const createTask = useCallback(
    async (taskData) => {
      setLoading(true);
      try {
        const newTask = await taskApi.createTask(taskData);
        if (newTask) {
          setTasks((prevTasks) => [...(prevTasks || []), newTask]);
          showNotification("Task created successfully", "success");
          return newTask;
        } else {
          throw new Error("Failed to create task - no data returned");
        }
      } catch (err) {
        setError(err);
        showNotification(`Failed to create task: ${err.message}`, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [taskApi, showNotification]
  );

  // Update an existing task
  const updateTask = useCallback(
    async (taskId, taskData) => {
      setLoading(true);
      try {
        const updatedTask = await taskApi.updateTask(taskId, taskData);
        if (updatedTask) {
          // Fixed: using taskData instead of non-existent newStatus
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              (task._id || task.id) === taskId ? { ...task, ...taskData } : task
            )
          );
          showNotification("Task updated successfully", "success");
          return updatedTask;
        } else {
          throw new Error("Failed to update task - no data returned");
        }
      } catch (err) {
        setError(err);
        showNotification(`Failed to update task: ${err.message}`, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [taskApi, showNotification]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId) => {
      setLoading(true);
      try {
        await taskApi.deleteTask(taskId);
        setTasks((prevTasks) =>
          prevTasks.filter((task) => (task._id || task.id) !== taskId)
        );
        showNotification("Task deleted successfully", "success");
        return true;
      } catch (err) {
        setError(err);
        showNotification(`Failed to delete task: ${err.message}`, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [taskApi, showNotification]
  );

  // Update task status
  const updateTaskStatus = useCallback(
    async (taskId, newStatus) => {
      console.log("Updating task status - taskId:", taskId, "newStatus:", newStatus);
      setLoading(true);
      try {
        if (!taskId) {
          throw new Error("Task ID is required to update status");
        }

        // Use the updateTaskStatus function from taskApi
        const updatedTask = await taskApi.updateTaskStatus(taskId, newStatus);

        if (updatedTask) {
          // If we get a full updated task back, replace the entire task
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              (task._id || task.id) === taskId ? updatedTask : task
            )
          );
        } else {
          // Otherwise just update the status property
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              (task._id || task.id) === taskId
                ? { ...task, status: newStatus }
                : task
            )
          );
        }

        showNotification(`Task marked as ${newStatus}`, "success");
        return true;
      } catch (err) {
        setError(err);
        showNotification(
          `Failed to update task status: ${err.message}`,
          "error"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [taskApi, showNotification]
  );

  // Share a task with another user
  const shareTask = useCallback(
    async (taskId, userId) => {
      setLoading(true);
      try {
        await taskApi.shareTask(taskId, userId);
        // Refresh tasks to get updated sharing information
        const refreshedTasks = await taskApi.getTasks();
        setTasks(Array.isArray(refreshedTasks) ? refreshedTasks : []);
        showNotification("Task shared successfully", "success");
        return true;
      } catch (err) {
        setError(err);
        showNotification(`Failed to share task: ${err.message}`, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [taskApi, showNotification]
  );

  // Get task statistics
  const getTaskStats = useCallback(() => {
    if (!Array.isArray(tasks)) {
      return { total: 0, pending: 0, inProgress: 0, completed: 0 };
    }

    return {
      total: tasks.length,
      pending: tasks.filter((task) => task && task.status === "pending").length,
      inProgress: tasks.filter((task) => task && task.status === "in-progress")
        .length,
      completed: tasks.filter((task) => task && task.status === "completed")
        .length,
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    notification,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    shareTask,
    showNotification,
    closeNotification,
    getTaskStats,
  };
};

export default useTasks;
