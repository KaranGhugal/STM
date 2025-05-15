import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Fab,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  FormatListBulleted as ListIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import TaskStats from "./components/TaskStats";
import useTasks from "./hooks/useTasks";
import { getAuthToken, testStorage } from "../../utils/authUtils";
import { useAuth } from "../../contexts/AuthContext";

const Tasks = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Task state management using the useTasks hook
  const {
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
    closeNotification,
    showNotification,
  } = useTasks();

  // Local component state
  const [formOpen, setFormOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState("dashboard");

  // Check authentication and fetch tasks on component mount
  // In Tasks.js useEffect
  useEffect(() => {
    const checkAuthAndFetchTasks = async () => {
      const storageWorks = testStorage();
      console.log("Storage functionality test:", storageWorks);

      if (!currentUser) {
        console.log("No current user in auth context");
      }

      const token = getAuthToken();
      console.log("Auth token exists in Tasks component:", !!token);

      if (!token) {
        console.log("No auth token found in Tasks component");
        showNotification("Authentication required", "info");
        setTimeout(() => navigate("/login"), 500);
        return;
      }

      try {
        await fetchTasks();
      } catch (err) {
        console.error("Error fetching tasks:", err);
        if (
          err.message.includes("Authentication required") ||
          err.message.includes("401")
        ) {
          showNotification("Session expired, please login again", "info");
          setTimeout(() => navigate("/login"), 500);
        }
      }
    };

    checkAuthAndFetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rest of component code remains unchanged...

  // Handle task form submission (create or update)
  const handleTaskSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (isEditing) {
        await updateTask(currentTask._id || currentTask.id, values);
      } else {
        await createTask(values);
      }
      resetForm();
      setFormOpen(false);
      setIsEditing(false);
      setCurrentTask(null);
    } catch (err) {
      console.error("Task submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open form for editing a task
  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsEditing(true);
    setFormOpen(true);
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
    }
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    await updateTaskStatus(taskId, newStatus);
  };

  // Handle task sharing
  const handleShareTask = async (taskId, userId) => {
    await shareTask(taskId, userId);
  };

  // Toggle view mode between dashboard and list
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Function to handle refresh with auth check
  const handleRefresh = async () => {
    const token = getAuthToken();
    if (!token) {
      console.log("No token found during refresh");
      showNotification("Authentication required", "error");
      navigate("/login");
      return;
    }

    await fetchTasks();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Tasks Management
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setIsEditing(false);
              setCurrentTask(null);
              setFormOpen(true);
            }}
            disabled={loading}
          >
            New Task
          </Button>
        </Box>
      </Box>

      {/* View Mode Tabs (Dashboard/List) */}
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          indicatorColor="primary"
          textColor="primary"
          centered={!isMobile}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab
            icon={<DashboardIcon />}
            label={!isMobile && "Dashboard"}
            value="dashboard"
            iconPosition="start"
          />
          <Tab
            icon={<ListIcon />}
            label={!isMobile && "List View"}
            value="list"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      {/* Error Message */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error.message || "An error occurred while loading tasks"}
        </Alert>
      )}

      {/* Dashboard View */}
      {viewMode === "dashboard" &&
        !loading &&
        !error &&
        tasks &&
        tasks.length > 0 && (
          <>
            <TaskStats tasks={tasks} />
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" sx={{ mb: 3 }}>
              Recent Tasks
            </Typography>
            <TaskList
              tasks={tasks.slice(0, 5)} // Show only 5 most recent tasks
              onTaskChange={handleEditTask}
              onTaskDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onTaskShare={handleShareTask}
            />
            {tasks.length > 5 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setViewMode("list")}
                >
                  View All Tasks
                </Button>
              </Box>
            )}
          </>
        )}

      {/* List View */}
      {viewMode === "list" &&
        !loading &&
        !error &&
        tasks &&
        tasks.length > 0 && (
          <TaskList
            tasks={tasks}
            onTaskChange={handleEditTask}
            onTaskDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onTaskShare={handleShareTask}
          />
        )}

      {/* Empty State */}
      {!loading && !error && (!tasks || tasks.length === 0) && (
        <Paper
          elevation={2}
          sx={{
            p: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            borderRadius: 2,
            bgcolor: "background.paper",
            mt: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            No Tasks Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first task to get started with task management.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setIsEditing(false);
              setCurrentTask(null);
              setFormOpen(true);
            }}
            sx={{ mt: 2 }}
          >
            Create Task
          </Button>
        </Paper>
      )}

      {/* Mobile FAB for adding new task */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add task"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={() => {
            setIsEditing(false);
            setCurrentTask(null);
            setFormOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Task form dialog */}
      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setIsEditing(false);
          setCurrentTask(null);
        }}
        onSubmit={handleTaskSubmit}
        currentTask={currentTask}
        isEditing={isEditing}
      />

      {/* Notification snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Tasks;
