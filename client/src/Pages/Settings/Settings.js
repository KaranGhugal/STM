import React, { useContext, useState } from 'react';
import { DarkModeContext } from '../../App';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Divider,
  Grid,
  Button,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Alert,
  Paper,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  NotificationsActive as NotificationsIcon,
  VolumeUp as SoundIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  ColorLens as ThemeIcon,
  Save as SaveIcon,
  Notifications as NotificationSettingsIcon,
  Lock as LockIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const Settings = () => {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const { currentUser } = useAuth();
  const [notification, setNotification] = useState(true);
  const [sound, setSound] = useState(true);
  const [language, setLanguage] = useState('english');
  const [timezone, setTimezone] = useState('UTC');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dataPrivacy, setDataPrivacy] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Save settings handler
  const handleSaveSettings = () => {
    setSnackbarMessage('Settings saved successfully!');
    setSnackbarOpen(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <ThemeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Appearance Settings Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                Appearance Settings
              </Typography>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {darkMode ? 
                    <DarkModeIcon sx={{ mr: 2, color: theme.palette.primary.main }} /> : 
                    <LightModeIcon sx={{ mr: 2, color: theme.palette.warning.main }} />
                  }
                  <Box>
                    <Typography variant="body1">Theme Mode</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {darkMode ? 'Dark mode is currently active' : 'Light mode is currently active'}
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  color="primary"
                />
              </Paper>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="accent-color-label">Accent Color</InputLabel>
                <Select
                  labelId="accent-color-label"
                  value="blue"
                  label="Accent Color"
                  size="small"
                >
                  <MenuItem value="blue">Blue</MenuItem>
                  <MenuItem value="purple">Purple</MenuItem>
                  <MenuItem value="green">Green</MenuItem>
                  <MenuItem value="red">Red</MenuItem>
                  <MenuItem value="orange">Orange</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="font-size-label">Font Size</InputLabel>
                <Select
                  labelId="font-size-label"
                  value="medium"
                  label="Font Size"
                  size="small"
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationSettingsIcon sx={{ mr: 1 }} />
                Notification Settings
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    bgcolor: theme.palette.background.default,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsIcon sx={{ mr: 2, color: theme.palette.info.main }} />
                    <Box>
                      <Typography variant="body1">Push Notifications</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Receive notifications for tasks and updates
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={notification}
                    onChange={() => setNotification(!notification)}
                    color="primary"
                  />
                </Paper>

                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    bgcolor: theme.palette.background.default,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SoundIcon sx={{ mr: 2, color: theme.palette.success.main }} />
                    <Box>
                      <Typography variant="body1">Sound Notifications</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Play sound when receiving notifications
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={sound}
                    onChange={() => setSound(!sound)}
                    color="primary"
                    disabled={!notification}
                  />
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Regional Settings Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LanguageIcon sx={{ mr: 1 }} />
                Regional Settings
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="language-label">Language</InputLabel>
                <Select
                  labelId="language-label"
                  value={language}
                  label="Language"
                  onChange={(e) => setLanguage(e.target.value)}
                  size="small"
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="spanish">Spanish</MenuItem>
                  <MenuItem value="french">French</MenuItem>
                  <MenuItem value="german">German</MenuItem>
                  <MenuItem value="chinese">Chinese</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="timezone-label">Time Zone</InputLabel>
                <Select
                  labelId="timezone-label"
                  value={timezone}
                  label="Time Zone"
                  onChange={(e) => setTimezone(e.target.value)}
                  size="small"
                >
                  <MenuItem value="UTC">UTC (Coordinated Universal Time)</MenuItem>
                  <MenuItem value="EST">EST (Eastern Standard Time)</MenuItem>
                  <MenuItem value="CST">CST (Central Standard Time)</MenuItem>
                  <MenuItem value="PST">PST (Pacific Standard Time)</MenuItem>
                  <MenuItem value="IST">IST (India Standard Time)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings Card */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LockIcon sx={{ mr: 1 }} />
                Privacy Settings
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Box>
                      <Typography variant="body1">Data Privacy</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Allow data to be stored and processed for improving your experience
                      </Typography>
                    </Box>
                    <Switch
                      checked={dataPrivacy}
                      onChange={() => setDataPrivacy(!dataPrivacy)}
                      color="primary"
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Box>
                      <Typography variant="body1">Usage Analytics</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Share anonymous usage data to help us improve our application
                      </Typography>
                    </Box>
                    <Switch
                      checked={analyticsConsent}
                      onChange={() => setAnalyticsConsent(!analyticsConsent)}
                      color="primary"
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Box>
                      <Typography variant="body1">Marketing Emails</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Receive emails about new features and promotions
                      </Typography>
                    </Box>
                    <Switch
                      checked={marketingEmails}
                      onChange={() => setMarketingEmails(!marketingEmails)}
                      color="primary"
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Advanced Settings Card */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ mr: 1 }} />
                Advanced Settings
              </Typography>

              <Accordion sx={{ 
                mb: 2, 
                borderRadius: 1,
                '&:before': { display: 'none' },
                border: `1px solid ${theme.palette.divider}`
              }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Security Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}
                    >
                      Change Password
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                    >
                      Enable Two-Factor Auth
                    </Button>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Last password change: Never
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ 
                mb: 2, 
                borderRadius: 1,
                '&:before': { display: 'none' },
                border: `1px solid ${theme.palette.divider}`
              }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Data Management</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Button 
                      variant="outlined" 
                      sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}
                    >
                      Export All Data
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error"
                    >
                      Delete Account
                    </Button>
                  </Box>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Deleting your account will permanently remove all your data. This action cannot be undone.
                  </Alert>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ 
                borderRadius: 1,
                '&:before': { display: 'none' },
                border: `1px solid ${theme.palette.divider}`
              }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Help & Support</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Button 
                      startIcon={<HelpIcon />} 
                      variant="text" 
                      sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}
                    >
                      View Documentation
                    </Button>
                    <Button 
                      variant="text" 
                      color="primary"
                    >
                      Contact Support
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1,
            boxShadow: theme.shadows[4]
          }}
        >
          Save Settings
        </Button>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Settings;