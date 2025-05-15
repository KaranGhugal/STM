import { useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
  Grid,
  Paper,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import TaskItem from "./TaskItem";

const TaskList = ({
  tasks,
  onTaskChange,
  onTaskDelete,
  onStatusChange,
  onTaskShare,
}) => {
  const [filter, setFilter] = useState({
    status: "all",
    category: "all",
    priority: "all",
    search: "",
  });

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter tasks based on selected criteria
  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (filter.status !== "all" && task.status !== filter.status) {
      return false;
    }

    // Filter by category
    if (filter.category !== "all" && task.category !== filter.category) {
      return false;
    }

    // Filter by priority
    if (filter.priority !== "all" && task.priority !== filter.priority) {
      return false;
    }

    // Filter by search term
    if (filter.search.trim() !== "") {
      const searchLower = filter.search.toLowerCase().trim();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descMatch = task.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) {
        return false;
      }
    }

    return true;
  });

  // Get unique categories for the filter dropdown
  const categories = [...new Set(tasks.map((task) => task.category))];

  return (
    <Box>
      {/* Filters */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          {/* Search field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              name="search"
              label="Search Tasks"
              value={filter.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Status filter */}
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                label="Status"
                size="medium"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Category filter */}
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                name="category"
                value={filter.category}
                onChange={handleFilterChange}
                label="Category"
                size="medium"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Priority filter */}
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="priority-filter-label">Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                name="priority"
                value={filter.priority}
                onChange={handleFilterChange}
                label="Priority"
                size="medium"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Task list */}
      <Box sx={{ mt: 2 }}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task._id || task.id}
              task={task}
              onEdit={() => onTaskChange(task)}
              onDelete={() => onTaskDelete(task._id || task.id)}
              onStatusChange={(taskId, newStatus) =>
                onStatusChange(taskId, newStatus)
              } 
              onShare={(userId) => onTaskShare(task._id || task.id, userId)}
            />
          ))
        ) : (
          <Paper
            elevation={2}
            sx={{
              p: 4,
              display: "flex",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {tasks.length === 0
                ? "No tasks found. Create your first task!"
                : "No tasks match your filters."}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default TaskList;
