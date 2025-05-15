import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, Button } from '@mui/material';

const RoleChangeDialog = ({ open, onClose, formData, setFormData, onSubmit, roleTypes }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Change Role</DialogTitle>
      <DialogContent>
        <Select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          fullWidth
        >
          {roleTypes.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleChangeDialog;