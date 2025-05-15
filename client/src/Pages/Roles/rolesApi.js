import axios from 'axios';
import { getAuthHeaders } from '../../utils/authUtils';

axios.defaults.baseURL = 'http://localhost:5000';

export const fetchRoles = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers) throw new Error('No authentication token found');
    const response = await axios.get('/api/roles', { headers });
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// New function to fetch the current user's role data
export const fetchCurrentUserRole = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      throw new Error('No authentication token found');
    }
    const response = await axios.get('/api/roles/me', { headers });
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createRole = async (payload) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) throw new Error('No authentication token found');
    await axios.post('/api/roles', payload, { headers });
  } catch (error) {
    handleApiError(error);
  }
};

export const updateRole = async (id, payload) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) throw new Error('No authentication token found');
    await axios.put(`/api/roles/${id}`, payload, { headers });
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteRole = async (id) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) throw new Error('No authentication token found');
    await axios.delete(`/api/roles/${id}`, { headers });
  } catch (error) {
    handleApiError(error);
  }
};

export const changeRole = async (id, role) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) throw new Error('No authentication token found');
    await axios.patch(`/api/roles/${id}/role`, { role }, { headers });
  } catch (error) {
    handleApiError(error);
  }
};

const handleApiError = (error) => {
  if (error.response) {
    if (error.response.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response.status === 403) {
      throw new Error('Unauthorized action. Admin access required.');
    } else if (error.response.status === 404) {
      throw new Error('Session invalid: User or role not found. Please log in again.');
    } else {
      throw new Error(error.response.data.error || 'An error occurred');
    }
  } else {
    throw new Error(error.message || 'Failed to connect to the server');
  }
};