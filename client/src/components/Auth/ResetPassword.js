import { useState } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Zoom,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Minimum 8 characters')
    .matches(/[A-Z]/, 'At least one uppercase letter')
    .matches(/[0-9]/, 'At least one number')
    .matches(/[!@#$%^&*]/, 'At least one special character')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/users/reset-password/${token}`,
        {
          password: values.password,
          confirmPassword: values.confirmPassword
        },
        { timeout: 5000 }
      );

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      let errorMessage;
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else {
        errorMessage = err.message || 'Failed to reset password. Please try again.';
      }
      setError(errorMessage);

      console.error('Reset Password Error:', {
        error: err.response?.data,
        status: err.response?.status
      });

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3
    }}>
      <Zoom in={true}>
        <Paper sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          borderRadius: 4,
          boxShadow: 6,
          background: 'rgba(255, 255, 255, 0.95)',
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.02)'
          }
        }}>
          <Typography variant="h4" sx={{
            textAlign: 'center',
            mb: 4,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Reset Password
          </Typography>

          <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
            Enter your new password below.
          </Typography>

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field name="password">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      margin="normal"
                      error={touched.password && !!errors.password}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: 'action.active' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ mb: 2 }}
                    />
                  )}
                </Field>

                <Field name="confirmPassword">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      margin="normal"
                      error={touched.confirmPassword && !!errors.confirmPassword}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: 'action.active' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ mb: 3 }}
                    />
                  )}
                </Field>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          <Snackbar
            open={success}
            autoHideDuration={4000}
            onClose={() => setSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ width: '100%' }}>
              Password reset successfully! Redirecting to login...
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!error}
            autoHideDuration={3000}
            onClose={() => setError('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        </Paper>
      </Zoom>
    </Box>
  );
};

export default ResetPassword;