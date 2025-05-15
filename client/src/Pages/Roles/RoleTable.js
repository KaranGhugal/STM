import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

const RoleTable = ({ roles, onEdit, onRoleChange, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role._id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.email}</TableCell>
              <TableCell>{role.role}</TableCell>
              <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button onClick={() => onEdit(role)}>Edit</Button>
                <Button onClick={() => onRoleChange(role)}>Change Role</Button>
                <Button color="error" onClick={() => onDelete(role._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoleTable;