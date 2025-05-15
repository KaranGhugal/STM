import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Autocomplete } from "@mui/material";
import axios from "axios"; // Make sure axios is installed

// Validation schema for the task form
const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string(),
  category: Yup.string().required("Category is required"),
  priority: Yup.string()
    .oneOf(["high", "medium", "low"])
    .required("Priority is required"),
  status: Yup.string()
    .oneOf(["pending", "in-progress", "completed"])
    .required("Status is required"),
  dueDate: Yup.date().required("Due date is required"),
  sharedWith: Yup.array(),
});

const TaskForm = ({ open, onClose, onSubmit, currentTask, isEditing }) => {
  // State to store users fetched from the database
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get token from local storage or wherever you store it
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await axios.get("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Function to get initial values for sharedWith field
  const getInitialSharedWith = () => {
    if (!isEditing || !currentTask) return [];

    // If we have currentTask.sharedWith, map it to full user objects when possible
    if (currentTask.sharedWith && Array.isArray(currentTask.sharedWith)) {
      return currentTask.sharedWith.map((userId) => {
        // If it's already an object, return it
        if (typeof userId === "object") return userId;

        // Try to find the user in the users array
        const foundUser = users.find((user) => user._id === userId);
        return foundUser || userId; // Return the user or the ID if user not found
      });
    }

    return [];
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEditing ? "Edit Task" : "Create New Task"}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Formik
        initialValues={
          isEditing
            ? {
                title: currentTask.title,
                description: currentTask.description || "",
                category: currentTask.category,
                priority: currentTask.priority,
                status: currentTask.status,
                dueDate: new Date(currentTask.dueDate),
                sharedWith: getInitialSharedWith(),
              }
            : {
                title: "",
                description: "",
                category: "",
                priority: "medium",
                status: "pending",
                dueDate: new Date(),
                sharedWith: [],
              }
        }
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize={true} // Important for when users are loaded
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          isSubmitting,
        }) => (
          <Form>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                id="title"
                name="title"
                label="Task Title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
              />

              <TextField
                fullWidth
                margin="normal"
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <FormControl
                fullWidth
                margin="normal"
                error={touched.category && Boolean(errors.category)}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Category"
                >
                  <MenuItem value="Work">Work</MenuItem>
                  <MenuItem value="Personal">Personal</MenuItem>
                  <MenuItem value="Study">Study</MenuItem>
                  <MenuItem value="Health">Health</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {touched.category && errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                error={touched.priority && Boolean(errors.priority)}
              >
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={values.priority}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Priority"
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
                {touched.priority && errors.priority && (
                  <FormHelperText>{errors.priority}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inProgress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={values.dueDate}
                  onChange={(date) => setFieldValue("dueDate", date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      helperText: touched.dueDate && errors.dueDate,
                      error: touched.dueDate && Boolean(errors.dueDate),
                    },
                  }}
                />
              </LocalizationProvider>

              {/* SharedWith field */}
              <Autocomplete
                multiple
                id="sharedWith"
                options={users}
                loading={loading}
                getOptionLabel={(option) => {
                  // Handle different input types
                  if (typeof option === "string") return option;
                  if (option && option.name) return option.name;
                  return "";
                }}
                // In Autocomplete component
                isOptionEqualToValue={(option, value) => {
                  // Handle comparison for objects or strings
                  if (typeof value === "string") {
                    return option._id === value;
                  }
                  return option._id === value._id; // Changed from value.id to value._id
                }}
                value={values.sharedWith}
                onChange={(event, newValue) => {
                  setFieldValue("sharedWith", newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Share With"
                    placeholder={loading ? "Loading..." : "Add team members"}
                    margin="normal"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    error={!!error}
                    helperText={error}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const label =
                      typeof option === "string"
                        ? option
                        : option.name || option.email || option._id || "";
                    return (
                      // In renderTags (TaskForm.js)
                      <Chip
                        key={option._id || option} // Add unique key
                        variant="outlined"
                        label={label}
                        {...getTagProps({ index })}
                      />
                    );
                  })
                }
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isEditing ? <EditIcon /> : <AddIcon />}
              >
                {isEditing ? "Update Task" : "Create Task"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TaskForm;
