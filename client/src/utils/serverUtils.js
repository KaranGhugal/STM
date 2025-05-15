// utils/serverUtils.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const checkServerStatus = async () => {
  try {
    // Simple ping to check if server is available
    await axios.get(`${API_BASE_URL}/api/users/profile`, {
      timeout: 2000, // 2 second timeout
      validateStatus: () => true // Any status code will be accepted
    });
    return true;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      return false;
    }
    // If the error is because of auth or other reasons, server is still running
    return true;
  }
};