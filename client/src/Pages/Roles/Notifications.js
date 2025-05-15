import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const Notifications = ({ error, success, onCloseError, onCloseSuccess }) => {
  return (
    <>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={onCloseError}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={onCloseSuccess}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </>
  );
};

export default Notifications;