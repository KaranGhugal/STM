import { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Divider,
  Grid,
  Tooltip,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircleFilled as InProgressIcon,
  Share as ShareIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

// Sample user list for the share dialog
const userList = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
  { id: "3", name: "Michael Brown", email: "michael@example.com" },
  { id: "4", name: "Sarah Johnson", email: "sarah@example.com" },
  { id: "5", name: "Robert Williams", email: "robert@example.com" },
];

const TaskItem = ({ task, onEdit, onDelete, onStatusChange, onShare }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Get user details from ID
  const getUserDetails = (userId) => {
    if (typeof userId === "object") return userId;
    return (
      userList.find((user) => user.id === userId) || {
        id: userId,
        name: `User ${userId}`,
      }
    );
  };

  // Format shared users as array of objects
  const sharedUsers = task.sharedWith
    ? Array.isArray(task.sharedWith)
      ? task.sharedWith.map((userId) => getUserDetails(userId))
      : []
    : [];

  // Generate color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  // Generate icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon color="success" />;
      case "in-progress":
        return <InProgressIcon color="warning" />;
      case "pending":
        return <PendingIcon color="error" />;
      default:
        return null;
    }
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle share dialog
  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
    handleMenuClose();
  };

  // Handle share dialog close
  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };

  // Handle sharing with a user
  const handleShareWithUser = (userId) => {
    onShare(task._id, userId);
    handleCloseShareDialog();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        borderLeft: `4px solid ${
          task.status === "completed"
            ? "#4caf50"
            : task.status === "in-progress"
            ? "#ff9800"
            : "#f44336"
        }`,
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8}>
          {/* Task title and status icon */}
          <Box display="flex" alignItems="center" mb={1}>
            <Box mr={1}>{getStatusIcon(task.status)}</Box>
            <Typography variant="h6" fontWeight="medium">
              {task.title}
            </Typography>
          </Box>

          {/* Task description */}
          {task.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, whiteSpace: "pre-wrap" }}
            >
              {task.description}
            </Typography>
          )}

          {/* Task metadata chips */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 1,
            }}
          >
            <Chip
              label={task.category}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              label={task.priority}
              size="small"
              color={getPriorityColor(task.priority)}
              variant="outlined"
            />
            <Chip
              icon={<AccessTimeIcon fontSize="small" />}
              label={format(new Date(task.dueDate), "MMM d, yyyy")}
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Shared users */}
          {sharedUsers.length > 0 && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Shared with:
              </Typography>
              <AvatarGroup
                max={3}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 24,
                    height: 24,
                    fontSize: "0.75rem",
                  },
                }}
              >
                {sharedUsers.map((user) => (
                  <Tooltip key={user.id} title={user.name || `User ${user.id}`}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {(user.name || `U${user.id}`).charAt(0)}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          )}
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{
            display: "flex",
            flexDirection: { xs: "row", sm: "column" },
            justifyContent: "space-between",
            alignItems: { xs: "center", sm: "flex-end" },
          }}
        >
          {/* Status change buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: { xs: 0, sm: 2 },
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", sm: "flex-end" },
            }}
          >
            {task.status !== "pending" && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const taskId = task._id || task.id;
                  const newStatus = "pending"; // Hardcoded for this button
                  if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
                    console.error("Invalid task ID:", taskId);
                    return;
                  }
                  if (
                    !["pending", "in-progress", "completed"].includes(newStatus)
                  ) {
                    console.error("Invalid status value:", newStatus);
                    return;
                  }
                  onStatusChange(taskId, newStatus);
                }}
              >
                Pending
              </Button>
            )}
            {task.status !== "in-progress" && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const taskId = task._id || task.id;
                  const newStatus = "in-progress"; // Hardcoded for this button
                  if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
                    console.error("Invalid task ID:", taskId);
                    return;
                  }
                  if (
                    !["pending", "in-progress", "completed"].includes(newStatus)
                  ) {
                    console.error("Invalid status value:", newStatus);
                    return;
                  }
                  onStatusChange(taskId, newStatus);
                }}
              >
                In Progress
              </Button>
            )}
            {task.status !== "completed" && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const taskId = task._id || task.id;
                  const newStatus = "completed"; // Hardcoded for this button
                  if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
                    console.error("Invalid task ID:", taskId);
                    return;
                  }
                  if (
                    !["pending", "in-progress", "completed"].includes(newStatus)
                  ) {
                    console.error("Invalid status value:", newStatus);
                    return;
                  }
                  onStatusChange(taskId, newStatus);
                }}
              >
                Complete
              </Button>
            )}
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit Task">
              <IconButton
                color="primary"
                size="small"
                onClick={() => onEdit(task)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Task">
              <IconButton
                color="primary"
                size="small"
                onClick={handleOpenShareDialog}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="More Options">
              <IconButton color="primary" size="small" onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Menu for additional actions */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={() => onEdit(task)}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={handleOpenShareDialog}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} /> Share
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => onDelete(task._id)}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={handleCloseShareDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Share Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a user to share "{task.title}" with:
          </Typography>
          <List>
            {userList.map((user) => {
              // Check if user is already shared with
              const isShared = sharedUsers.some((sharedUser) =>
                typeof sharedUser === "object"
                  ? sharedUser.id === user.id
                  : sharedUser === user.id
              );

              return (
                <ListItem
                  key={user.id}
                  button
                  disabled={isShared}
                  onClick={() => handleShareWithUser(user.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: isShared ? "action.selected" : "transparent",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <>
                        {user.email}
                        {isShared && (
                          <Typography
                            component="span"
                            variant="body2"
                            color="primary"
                          >
                            {" "}
                            • Already shared
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TaskItem;
