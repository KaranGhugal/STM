import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  styled,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Assignment,
  TaskAlt,
  TrendingUp,
  NotificationsActive,
  Group,
  CalendarMonth,
  Add,
  Pending as PendingIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { getAuthToken } from "../../utils/authUtils";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}));

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks for the user (both owned and shared)
  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!currentUser) {
        setError("Please log in to view your tasks.");
        setTaskLoading(false);
        return;
      }

      setTaskLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`, // Use standard Authorization header
          },
        });

        // Use tasks directly from response, as backend includes both owned and shared tasks
        const userTasks = (response.data.tasks || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTasks(userTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setTaskLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserTasks();
    }
  }, [currentUser, authLoading]);

  // Calculate stats based on user tasks
  const stats = [
    {
      icon: <Assignment />,
      title: "Total Tasks",
      value: tasks.length.toString(),
      color: theme.palette.primary.main,
    },
    {
      icon: <TaskAlt />,
      title: "Completed",
      value: tasks
        .filter((task) => task.status === "completed")
        .length.toString(),
      color: theme.palette.success.main,
    },
    {
      icon: <TrendingUp />,
      title: "In Progress",
      value: tasks
        .filter((task) => task.status === "in-progress")
        .length.toString(),
      color: theme.palette.warning.main,
    },
    {
      icon: <NotificationsActive />,
      title: "Due Soon",
      value: tasks
        .filter((task) => {
          const dueDate = new Date(task.dueDate);
          const now = new Date();
          const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24);
          return diffDays <= 3 && diffDays >= 0 && task.status !== "completed";
        })
        .length.toString(),
      color: theme.palette.error.main,
    },
    {
      icon: <PendingIcon />,
      title: "Pending",
      value: tasks
        .filter((task) => task.status === "pending")
        .length.toString(),
      color: theme.palette.info.main,
    },
  ];

  // Recent activities (static, as per original)
  const recentActivities = [
    { id: 1, title: "Team meeting", time: "10:00 AM", icon: <Group /> },
    {
      id: 2,
      title: "Project deadline",
      time: "2:30 PM",
      icon: <CalendarMonth />,
    },
    { id: 3, title: "Client review", time: "4:45 PM", icon: <Assignment /> },
  ];

  // Render loading state
  if (authLoading || taskLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress size={40} />
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome Back, {currentUser?.name || "User"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your daily overview and progress summary
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StyledPaper>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: stat.color + "20",
                    p: 1.5,
                    borderRadius: "12px",
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
            </StyledPaper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Tasks */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Recent Tasks
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => (window.location.href = "/tasks")}
              >
                New Task
              </Button>
            </Box>

            {/* Task List */}
            {tasks.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No tasks available. Create a new task to get started!
              </Typography>
            ) : (
              tasks.slice(0, 3).map((task) => (
                <Box
                  key={task._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <TaskAlt sx={{ mr: 2, color: "text.secondary" }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography>{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.category || "Uncategorized"}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              ))
            )}
          </StyledPaper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activities
            </Typography>
            {recentActivities.map((activity) => (
              <Box
                key={activity.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  py: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    p: 1,
                    borderRadius: "8px",
                  }}
                >
                  {activity.icon}
                </Box>
                <Box>
                  <Typography>{activity.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      {!isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            sx={{ borderRadius: 3 }}
            onClick={() => (window.location.href = "/tasks")}
          >
            Quick Task
          </Button>
          <Button variant="outlined" color="inherit" sx={{ borderRadius: 3 }}>
            View Reports
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Home;