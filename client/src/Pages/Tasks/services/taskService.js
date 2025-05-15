import axios from 'axios';

// Base API URL - should match your backend configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

/**
 * Creates an authenticated axios instance with the current auth token
 * @returns {AxiosInstance} Authenticated axios instance
 */
const createAuthAxios = () => {
  const token = localStorage.getItem('authToken');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

/**
 * Formats task data for API requests
 * @param {Object} taskData - Raw task data
 * @returns {Object} Formatted task data
 */
const formatTaskData = (taskData) => {
  if (!taskData) return {};
  
  const formattedData = { ...taskData };
  
  // Format date if it exists and is a Date object
  if (formattedData.dueDate instanceof Date) {
    formattedData.dueDate = formattedData.dueDate.toISOString();
  }
  
  // Format sharedWith to ensure it's in the correct format (only IDs)
  if (formattedData.sharedWith && Array.isArray(formattedData.sharedWith)) {
    formattedData.sharedWith = formattedData.sharedWith.map(user =>
      typeof user === 'string' ? user : user.id
    );
  }
  
  return formattedData;
};

/**
 * Task service for handling all task-related API operations
 */
const taskService = {
  /**
   * Fetch all tasks for the authenticated user
   * @returns {Promise<Array>} Array of task objects
   */
  getAllTasks: async () => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get('/api/tasks');
      
      // Return tasks array from response based on API structure
      return response.data.tasks || response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  /**
   * Get a specific task by ID
   * @param {string} taskId - ID of the task to fetch
   * @returns {Promise<Object>} Task object
   */
  getTaskById: async (taskId) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/api/tasks/${taskId}`);
      return response.data.task || response.data;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  /**
   * Create a new task
   * @param {Object} taskData - Task data to create
   * @returns {Promise<Object>} Created task object
   */
  createTask: async (taskData) => {
    try {
      const authAxios = createAuthAxios();
      const formattedData = formatTaskData(taskData);
      
      const response = await authAxios.post('/api/tasks', formattedData);
      return response.data.task || response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  /**
   * Update an existing task
   * @param {string} taskId - ID of the task to update
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} Updated task object
   */
  updateTask: async (taskId, taskData) => {
    try {
      const authAxios = createAuthAxios();
      const formattedData = formatTaskData(taskData);
      
      const response = await authAxios.put(`/api/tasks/${taskId}`, formattedData);
      return response.data.task || response.data;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  /**
   * Update only the status of a task
   * @param {string} taskId - ID of the task
   * @param {string} newStatus - New status value
   * @returns {Promise<Object>} Updated task object
   */
  updateTaskStatus: async (taskId, newStatus) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.put(`/api/tasks/${taskId}`, { status: newStatus });
      return response.data.task || response.data;
    } catch (error) {
      console.error(`Error updating task status for ${taskId}:`, error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  /**
   * Delete a task
   * @param {string} taskId - ID of the task to delete
   * @returns {Promise<boolean>} Success indicator
   */
  deleteTask: async (taskId) => {
    try {
      const authAxios = createAuthAxios();
      await authAxios.delete(`/api/tasks/${taskId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  /**
   * Share a task with another user
   * @param {string} taskId - ID of the task to share
   * @param {string|Array} userIds - User ID(s) to share with
   * @returns {Promise<boolean>} Success indicator
   */
  shareTask: async (taskId, userIds) => {
    try {
      const authAxios = createAuthAxios();
      const payload = {
        sharedWith: Array.isArray(userIds) ? userIds : [userIds]
      };
      
      await authAxios.patch(`/api/tasks/${taskId}/share`, payload);
      return true;
    } catch (error) {
      console.error(`Error sharing task ${taskId}:`, error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  /**
   * Get tasks filtered by category
   * @param {string} category - Category to filter by
   * @returns {Promise<Array>} Filtered task array
   */
  getTasksByCategory: async (category) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/api/tasks?category=${category}`);
      return response.data.tasks || response.data;
    } catch (error) {
      console.error(`Error fetching tasks for category ${category}:`, error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  /**
   * Get tasks filtered by status
   * @param {string} status - Status to filter by
   * @returns {Promise<Array>} Filtered task array
   */
  getTasksByStatus: async (status) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/api/tasks?status=${status}`);
      return response.data.tasks || response.data;
    } catch (error) {
      console.error(`Error fetching tasks with status ${status}:`, error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
  
  /**
   * Get tasks filtered by priority
   * @param {string} priority - Priority to filter by
   * @returns {Promise<Array>} Filtered task array
   */
  getTasksByPriority: async (priority) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/api/tasks?priority=${priority}`);
      return response.data.tasks || response.data;
    } catch (error) {
      console.error(`Error fetching tasks with priority ${priority}:`, error);
      throw new Error(error.response?.data?.message || error.message);
    }
  }
};

export default taskService;