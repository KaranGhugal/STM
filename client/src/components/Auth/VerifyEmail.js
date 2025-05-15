import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Paper, Zoom, CircularProgress, Button } from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/verify-email/${token}`, { timeout: 5000 });
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus('error');
        let errorMessage = 'Failed to verify email. Please try again.';
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [token, navigate]);

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
          textAlign: 'center',
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.02)'
          }
        }}>
          <Box sx={{ mb: 3 }}>
            {status === 'loading' && (
              <>
                <CircularProgress size={60} sx={{ color: 'primary.main', mb: 2 }} />
                <Typography variant="h5">Verifying your email...</Typography>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5">{message}</Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Redirecting to login...
                </Typography>
              </>
            )}
            {status === 'error' && (
              <>
                <ErrorOutline sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                <Typography variant="h5">{message}</Typography>
                {message.includes('expired') && (
                  <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={() => navigate('/resend-verification')}
                  >
                    Resend Verification Email
                  </Button>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Zoom>
    </Box>
  );
};

export default VerifyEmail;