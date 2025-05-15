// First let's create a new EditProfileDialog component to handle the profile editing

import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Avatar,
  Box,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  Close,
  CameraAlt,
  Save,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { getAuthToken } from '../../utils/authUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const EditProfileDialog = ({ open, onClose, user, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photo ? (user.photo.startsWith('/') ? `${API_BASE_URL}${user.photo}` : user.photo) : null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    password: false,
    confirmPassword: false,
  });
  
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          open: true,
          message: 'Image size must be less than 5MB',
          severity: 'error'
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAlert({
          open: true,
          message: 'Only image files are allowed',
          severity: 'error'
        });
        return;
      }
      
      setPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTogglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

const handleSubmit = async () => {
  try {
    setLoading(true);
    
    // Form validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setAlert({
        open: true,
        message: 'Passwords do not match',
        severity: 'error'
      });
      setLoading(false);
      return;
    }
    
    if (formData.password && !formData.currentPassword) {
      setAlert({
        open: true,
        message: 'Current password is required to update password',
        severity: 'error'
      });
      setLoading(false);
      return;
    }
    
    const token = getAuthToken();
    if (!token) {
      setAlert({
        open: true,
        message: 'Authentication token missing. Please log in again.',
        severity: 'error'
      });
      setLoading(false);
      return;
    }
    
    // Create FormData object for multipart form submission (for file upload)
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    if (formData.phone) submitData.append('phone', formData.phone);
    
    // Add password fields if updating password
    if (formData.password) {
      submitData.append('currentPassword', formData.currentPassword);
      submitData.append('password', formData.password);
      submitData.append('confirmPassword', formData.confirmPassword);
    }
    
    // Add photo if changed
    if (photo) {
      submitData.append('photo', photo);
    }
    
    // Check if server is available before sending request
    try {
      // Attempt a quick ping to the server
      await axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000 // 3 second timeout
      });
    } catch (pingError) {
      if (pingError.code === 'ERR_NETWORK' || pingError.code === 'ECONNREFUSED') {
        setAlert({
          open: true,
          message: 'Cannot connect to server. Please make sure the backend is running.',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      // If the error is not about connection, continue with the update
    }
    
    // Send update request
    const response = await axios.put(
      `${API_BASE_URL}/api/users/profile`,
      submitData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 5000 // 10 second timeout
      }
    );
    
    // Handle successful update
    setAlert({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success'
    });
    
    // Notify parent component to refresh user data
    onProfileUpdated(response.data);
    
    // Close dialog after short delay
    setTimeout(() => onClose(), 1500);
    
  } catch (err) {
    console.error('Error updating profile:', err);
    
    // Handle different error scenarios
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
      setAlert({
        open: true,
        message: 'Cannot connect to server. Please make sure the backend is running.',
        severity: 'error'
      });
    } else if (err.response?.status === 401) {
      setAlert({
        open: true,
        message: 'Your session has expired. Please log in again.',
        severity: 'error'
      });
    } else {
      setAlert({
        open: true,
        message: err.response?.data?.error || 'Failed to update profile. Please try again later.',
        severity: 'error'
      });
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Dialog 
        open={open} 
        onClose={loading ? null : onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            Edit Profile
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={onClose} 
            disabled={loading}
            aria-label="close"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar 
                src={photoPreview} 
                sx={{ 
                  width: 120, 
                  height: 120,
                  border: '4px solid #f5f5f5',
                  boxShadow: 3
                }}
              >
                {!photoPreview && (user?.name?.charAt(0) || '?')}
              </Avatar>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handlePhotoChange}
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => fileInputRef.current.click()}
              >
                <CameraAlt />
              </IconButton>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Click the camera icon to change your profile picture
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                variant="outlined"
                disabled={loading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                disabled={loading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                variant="outlined"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Change Password (Optional)
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Leave blank if you don't want to change your password
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type={showPassword.currentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange}
                variant="outlined"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleTogglePasswordVisibility('currentPassword')}
                        edge="end"
                      >
                        {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="New Password"
                name="password"
                type={showPassword.password ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                variant="outlined"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleTogglePasswordVisibility('password')}
                        edge="end"
                      >
                        {showPassword.password ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showPassword.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                variant="outlined"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleTogglePasswordVisibility('confirmPassword')}
                        edge="end"
                      >
                        {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlert(prev => ({ ...prev, open: false }))} 
          severity={alert.severity}
          elevation={6}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditProfileDialog;