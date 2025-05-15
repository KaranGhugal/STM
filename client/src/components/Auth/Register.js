import { useState, useRef } from 'react';
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
  IconButton,
  InputAdornment,
  Avatar,
  Badge
} from '@mui/material';
import {
  PersonOutline,
  EmailOutlined,
  PhoneIphone,
  LockOutlined,
  Visibility,
  VisibilityOff,
  AddAPhoto
} from '@mui/icons-material';

const USER_EXISTS = 'User already exists';

// Add file size and type validation
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];
const FILE_SIZE = 1024 * 1024 * 5; // 5MB

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Too Short!')
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  phone: Yup.string()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number')
    .required('Required'),
  password: Yup.string()
    .min(8, 'Minimum 8 characters')
    .matches(/[A-Z]/, 'At least one uppercase letter')
    .matches(/[0-9]/, 'At least one number')
    .matches(/[!@#$%^&*]/, 'At least one special character')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
  photo: Yup.mixed()
    .nullable()
    .test(
      'fileSize',
      'File too large (max 5MB)',
      value => !value || (value && value.size <= FILE_SIZE)
    )
    .test(
      'fileFormat',
      'Unsupported format (jpg/jpeg/png only)',
      value => !value || (value && SUPPORTED_FORMATS.includes(value.type))
    )
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handlePhotoChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setFieldValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('email', values.email.trim().toLowerCase());
      formData.append('phone', values.phone.trim());
      formData.append('password', values.password);
      formData.append('confirmPassword', values.confirmPassword);
      if (values.photo) {
        formData.append('photo', values.photo);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/users/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 5000
        }
      );

      setSuccess(true);
      resetForm();
      setPhotoPreview(null);
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      let errorMessage;
      if (err.response?.data?.error) {
        if (err.response.data.error === USER_EXISTS) {
          errorMessage = 'This email is already registered.';
        } else {
          errorMessage = err.response.data.error;
        }
      } else {
        errorMessage = err.message || 'Registration failed. Please try again.';
      }
      setError(errorMessage);

      console.error('Registration Error:', {
        error: err.response?.data,
        status: err.response?.status,
        requestData: {
          name: values.name,
          email: values.email,
          phone: values.phone
        }
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
            Create Account
          </Typography>

          <Formik
            initialValues={{ name: '', email: '', phone: '', password: '', confirmPassword: '', photo: null }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3
                }}>
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={(e) => handlePhotoChange(e, setFieldValue)}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <AddAPhoto fontSize="small" />
                      </IconButton>
                    }
                  >
                    <Avatar
                      src={photoPreview}
                      sx={{
                        width: 100,
                        height: 100,
                        border: '2px solid #764ba2',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.9 }
                      }}
                      onClick={() => fileInputRef.current.click()}
                    />
                  </Badge>
                  
                  {touched.photo && errors.photo && (
                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                      {errors.photo}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Click to add profile photo (optional)
                  </Typography>
                </Box>

                <Field name="name">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      margin="normal"
                      error={touched.name && !!errors.name}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutline sx={{ color: 'action.active' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{ mb: 2 }}
                    />
                  )}
                </Field>

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
                      sx={{ mb: 2 }}
                    />
                  )}
                </Field>

                <Field name="phone">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      margin="normal"
                      error={touched.phone && !!errors.phone}
                      helperText={touched.phone && errors.phone}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIphone sx={{ color: 'action.active' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{ mb: 2 }}
                    />
                  )}
                </Field>

                <Field name="password">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
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
                    'Create Account'
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
              Registration Successful! Please check your email to verify your account.
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

export default Register;