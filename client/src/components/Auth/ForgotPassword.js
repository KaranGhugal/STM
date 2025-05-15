import { useState } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment
} from '@mui/material';
import { EmailOutlined } from '@mui/icons-material';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
});

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/users/forgot-password`,
        { email: values.email.trim().toLowerCase() },
        { timeout: 5000 }
      );

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      let errorMessage;
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else {
        errorMessage = err.message || 'Failed to send password reset email. Please try again.';
      }
      setError(errorMessage);

      console.error('Forgot Password Error:', {
        error: err.response?.data,
        status: err.response?.status,
        requestData: { email: values.email }
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
            Forgot Password
          </Typography>

          <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
            Enter your email address to receive a password reset link.
          </Typography>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field name="email">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      margin="normal"
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined sx={{ color: 'action.active' }} />
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
                    'Send Reset Link'
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
              Password reset link sent successfully! Please check your email.
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

export default ForgotPassword;