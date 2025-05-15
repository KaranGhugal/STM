import { useState, useEffect } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
  Zoom,
  Fade,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";
import {
  LockOutlined,
  EmailOutlined,
  Visibility,
  VisibilityOff,
  Google,
  GitHub,
} from "@mui/icons-material";
import { handleLoginSuccess, scheduleTokenExpirationCheck } from '../../utils/authUtils';
import { useAuth } from "../../contexts/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Too Short!").required("Required"),
});

const Login = () => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.sessionExpired && location.state?.message) {
      enqueueSnackbar(location.state.message, { variant: "info" });
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, enqueueSnackbar]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email: values.email,
        password: values.password
      });

      if (response.data?.token && response.data?.user && response.data?.role) {
        const authSuccess = handleLoginSuccess(response.data);
        
        if (authSuccess) {
          const userWithRole = {
            ...response.data.user,
            role: response.data.role.role,
            roleId: response.data.role.roleId
          };
          
          login(userWithRole, response.data.token);
          
          scheduleTokenExpirationCheck(() => {
            enqueueSnackbar('Session expired. Please login again.', { variant: 'error' });
            navigate('/login', { replace: true });
          });
          
          enqueueSnackbar("Login successful!", { 
            variant: "success",
            autoHideDuration: 2000,
            onClose: () => navigate("/home", { replace: true }),
          });
          
          navigate("/home", { replace: true });
        } else {
          throw new Error("Failed to store authentication data");
        }
      } else {
        throw new Error("Invalid server response");
      }
    
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        if (error.response.data.error === "User not found with this email") {
          errorMessage = "Email not found. Please check your email.";
        } else if (error.response.data.error === "Incorrect password") {
          errorMessage = "Incorrect password. Please try again.";
        } else if (error.response.data.error === "Role not found") {
          errorMessage = "No role associated with this user.";
        } else if (error.response.data.error === "Email not verified. Please verify your email.") {
          errorMessage = (
            <>
              Email not verified. Please verify your email or{' '}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/resend-verification', { state: { email: values.email } });
                }}
                sx={{ color: 'error.main', textDecoration: 'underline' }}
              >
                resend verification email
              </Link>.
            </>
          );
        } else {
          errorMessage = error.response.data.error || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Server is not responding. Please check your connection.";
      }
      
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(45deg, #7f5a83 0%, #0d324d 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Zoom in={true}>
        <Paper
          sx={{
            padding: 4,
            borderRadius: `${theme.shape.borderRadius * 2}px`,
            background: "rgba(255, 255, 255, 0.95)",
            boxShadow: 24,
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
            },
            maxWidth: 450,
            width: "100%",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <LockOutlined
              sx={{
                fontSize: 40,
                color: "primary.main",
                mb: 1,
              }}
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sign in to manage your tasks
            </Typography>
          </Box>

          <Formik
            initialValues={{ email: location.state?.email || "", password: "", remember: false }}
            validationSchema={LoginSchema}
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
                      variant="outlined"
                      margin="normal"
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Field>

                <Field name="password">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      margin="normal"
                      error={touched.password && !!errors.password}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined color="action" />
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
                        ),
                      }}
                    />
                  )}
                </Field>

                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Field as={Checkbox} name="remember" color="primary" />
                      }
                      label="Remember me"
                    />
                  </Grid>
                  <Grid item>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/forgot-password')}
                      sx={{ color: 'textSecondary' }}
                    >
                      Forgot password?
                    </Link>
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: 4,
                    },
                  }}
                >
                  Sign In
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    OR CONTINUE WITH
                  </Typography>
                </Divider>

                <Grid
                  container
                  spacing={2}
                  sx={{
                    mt: 3,
                    "& button": {
                      flexGrow: 1,
                      padding: 1.5,
                      borderRadius: 1,
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      startIcon={<Google />}
                      sx={{
                        color: "#DB4437",
                        borderColor: "#DB4437",
                        "&:hover": {
                          backgroundColor: "rgba(219, 68, 55, 0.04)",
                          borderColor: "#DB4437",
                        },
                      }}
                    >
                      Google
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      startIcon={<GitHub />}
                      sx={{
                        color: "#333",
                        borderColor: "#333",
                        "&:hover": {
                          backgroundColor: "rgba(51, 51, 51, 0.04)",
                          borderColor: "#333",
                        },
                      }}
                    >
                      GitHub
                    </Button>
                  </Grid>
                </Grid>

                <Fade in={true}>
                  <Box mt={3} textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Don't have an account?{' '}
                      <Link component="button" onClick={() => navigate('/register')} color="primary">
                        Sign Up
                      </Link>
                    </Typography>
                  </Box>
                </Fade>
              </Form>
            )}
          </Formik>
        </Paper>
      </Zoom>
    </Box>
  );
};

export default Login;