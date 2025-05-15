import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Avatar,
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  useMediaQuery,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CalendarToday,
  Lock,
  Refresh,
  CameraAlt,
  Edit,
  LocationOn,
  Work,
  VerifiedUser,
} from '@mui/icons-material';
import { getAuthToken } from '../../utils/authUtils';
import { alpha, useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import EditProfileDialog from './EditProfileDialog'; // Import the new component

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: theme.shadows[10],
  transition: 'transform 0.3s ease-in-out',
  background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 30%)`,
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(6),
  textAlign: 'center',
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: theme.palette.common.white,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4),
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 160,
  height: 160,
  margin: '0 auto',
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[6],
  '&:hover': {
    cursor: 'pointer',
    filter: 'brightness(0.8)',
  },
}));

const ProfileSectionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false); // State for edit dialog
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => logout(), 2000);
      } else {
        setError('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getProfilePhotoUrl = () => {
    if (!user?.photo) return null;
    
    if (user.photo.startsWith('/')) {
      return `${API_BASE_URL}${user.photo}`;
    }
    
    return user.photo;
  };

  const getProfileStats = () => [
    { label: 'Completed Projects', value: user?.stats?.projects || 0, icon: <Work /> },
    { label: 'Account Security', value: 'Strong', icon: <VerifiedUser />, progress: 90 },
    { label: 'Profile Completeness', value: `${user?.stats?.completeness || 75}%`, icon: <Person />, progress: user?.stats?.completeness || 75 },
  ];

  // Handle opening the edit profile dialog
  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };

  // Handle closing the edit profile dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  // Handle profile update
  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    setNotification({
      open: true,
      message: 'Profile updated successfully!',
      severity: 'success',
    });
  };

  // Handle click on update photo button in header
  const handleUpdatePhotoClick = () => {
    // Open the edit dialog directly
    setEditDialogOpen(true);
  };

  const renderLoadingSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="circular" width={160} height={160} sx={{ mx: 'auto', mb: 2 }} />
      <Skeleton variant="text" height={48} width="60%" sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" height={24} width="40%" sx={{ mx: 'auto', mb: 4 }} />
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={4} key={item}>
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderErrorState = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" color="error" gutterBottom>
        {error}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        We couldn't load your profile information. Please check your connection and try again.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Refresh />}
        onClick={fetchUserProfile}
        sx={{ borderRadius: 5 }}
      >
        Retry Connection
      </Button>
    </Box>
  );

  const renderProfileStats = () => (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {getProfileStats().map((stat, index) => (
        <Grid item xs={12} md={4} key={index}>
          <ProfileSectionCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: 'primary.main', mb: 1 }}>
                {React.cloneElement(stat.icon, { fontSize: 'large' })}
              </Box>
              <Typography variant="h6" gutterBottom>
                {stat.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stat.value}
              </Typography>
              {stat.progress && (
                <LinearProgress
                  variant="determinate"
                  value={stat.progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: theme.palette.success.main,
                    },
                  }}
                />
              )}
            </CardContent>
          </ProfileSectionCard>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) return renderLoadingSkeleton();
  if (error) return renderErrorState();

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <StyledPaper>
        <ProfileHeader>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <ProfileAvatar src={getProfilePhotoUrl()}>
              {!getProfilePhotoUrl() && getInitials()}
            </ProfileAvatar>
            <Tooltip title="Edit Profile Picture">
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<CameraAlt />}
                onClick={handleUpdatePhotoClick}
                sx={{
                  position: 'absolute',
                  bottom: -16,
                  right: -16,
                  borderRadius: 5,
                  textTransform: 'none',
                  boxShadow: theme.shadows[4],
                }}
              >
                Update
              </Button>
            </Tooltip>
          </Box>

          <Typography variant="h3" sx={{ mt: 4, fontWeight: 'bold' }}>
            {user?.name}
            {user?.verified && (
              <VerifiedUser sx={{ 
                fontSize: 32, 
                ml: 1.5, 
                verticalAlign: 'middle', 
                color: theme.palette.success.main 
              }} />
            )}
          </Typography>
          
          <Chip
            label={user?.role || 'Standard User'}
            color="secondary"
            size="small"
            sx={{ 
              mt: 2, 
              borderRadius: 4,
              fontWeight: 'bold',
              background: alpha(theme.palette.secondary.main, 0.2),
            }}
          />

          <Typography variant="subtitle1" sx={{ mt: 2, opacity: 0.9 }}>
            <LocationOn sx={{ fontSize: 18, verticalAlign: 'text-bottom', mr: 0.5 }} />
            {user?.location || 'Unknown Location'}
          </Typography>
        </ProfileHeader>

        <Box sx={{ p: isMobile ? 2 : 4 }}>
          {renderProfileStats()}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <ProfileSectionCard>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    Personal Details
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Address"
                        secondary={user?.email}
                        secondaryTypographyProps={{ sx: { wordBreak: 'break-all' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Phone color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Contact Number"
                        secondary={user?.phone || 'Not provided'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarToday color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Member Since"
                        secondary={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </ProfileSectionCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <ProfileSectionCard>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <Lock sx={{ mr: 1, color: 'primary.main' }} />
                    Security & Preferences
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <VerifiedUser color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Account Status"
                        secondary={
                          <Chip 
                            label="Verified" 
                            size="small" 
                            color="success" 
                            sx={{ borderRadius: 3 }} 
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Work color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Last Active"
                        secondary={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <LocationOn color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Timezone"
                        secondary={user?.timezone || 'UTC'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </ProfileSectionCard>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={fetchUserProfile}
              sx={{ borderRadius: 5, px: 4, py: 1 }}
            >
              Refresh Data
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Edit />}
              onClick={handleOpenEditDialog}
              sx={{ borderRadius: 5, px: 4, py: 1 }}
            >
              Edit Profile
            </Button>
          </Box>
        </Box>
      </StyledPaper>

      {/* Edit Profile Dialog */}
      {editDialogOpen && (
        <EditProfileDialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          user={user}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          elevation={6}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;