import React, { useState, useEffect } from "react";
import { Box, Button, Container, Tabs, Tab, Typography } from "@mui/material";
import RoleTable from "./RoleTable";
import RoleFormDialog from "./RoleFormDialog";
import RoleChangeDialog from "./RoleChangeDialog";
import Notifications from "./Notifications";
import {
  fetchRoles,
  fetchCurrentUserRole, // Import the new function
  createRole,
  updateRole,
  deleteRole,
  changeRole,
} from "./rolesApi";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Roles = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [selectedRoleType, setSelectedRoleType] = useState("user");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRoleChange, setOpenRoleChange] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roleTypes = ["user", "admin", "super_admin"];
  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "super_admin";

  useEffect(() => {
    if (isAdmin) {
      fetchRolesData();
    } else {
      fetchUserRoleData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      setFilteredRoles(roles.filter((role) => role.role === selectedRoleType));
    }
  }, [roles, selectedRoleType, isAdmin]);

  const fetchRolesData = async () => {
    try {
      const data = await fetchRoles();
      setRoles(data || []);
    } catch (err) {
      handleError(err);
      setRoles([]);
    }
  };

  const fetchUserRoleData = async () => {
    try {
      const userRoleData = await fetchCurrentUserRole();
      setRoles(userRoleData ? [userRoleData] : []); // Treat the single role as a list for consistency
    } catch (err) {
      handleError(err);
      setRoles([]);
    }
  };

  const handleCreateOpen = () => {
    if (!isAdmin) {
      setError("Only admins can create roles");
      return;
    }
    setOpenCreate(true);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });
  };

  const handleEditOpen = (role) => {
    if (role._id !== currentUser?.id && !isAdmin) {
      setError("You can only edit your own profile");
      return;
    }
    setSelectedRole(role);
    setFormData({
      name: role.name,
      email: role.email,
      password: "",
      confirmPassword: "",
      role: role.role,
    });
    setOpenEdit(true);
  };

  const handleRoleChangeOpen = (role) => {
    if (!isAdmin) {
      setError("Only admins can change roles");
      return;
    }
    setSelectedRole(role);
    setFormData({ ...formData, role: role.role });
    setOpenRoleChange(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }
      if (openEdit) {
        await updateRole(selectedRole._id, payload);
        setSuccess("Role updated successfully!");
      } else {
        await createRole(payload);
        setSuccess("Role created successfully!");
      }
      if (isAdmin) {
        fetchRolesData();
      } else {
        fetchUserRoleData();
      }
      setOpenCreate(false);
      setOpenEdit(false);
    } catch (err) {
      handleError(err);
    }
  };

  const handleRoleChange = async () => {
    try {
      await changeRole(selectedRole._id, formData.role);
      fetchRolesData();
      setSuccess("Role changed successfully!");
      setOpenRoleChange(false);
    } catch (err) {
      handleError(err);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setError("Only admins can delete roles");
      return;
    }
    try {
      await deleteRole(id);
      fetchRolesData();
      setSuccess("Role deleted successfully!");
    } catch (err) {
      handleError(err);
    }
  };

  const handleError = (err) => {
    const message = err.message || "An error occurred";
    if (message.includes("Session expired")) {
      logout();
      navigate("/login", { state: { sessionExpired: true, message } });
    } else {
      setError(message);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isAdmin ? "Role Management" : "My Profile"}
        </Typography>
        {isAdmin && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Tabs
              value={selectedRoleType}
              onChange={(e, newValue) => setSelectedRoleType(newValue)}
              sx={{ flexGrow: 1 }}
            >
              {roleTypes.map((role) => (
                <Tab
                  key={role}
                  label={role.charAt(0).toUpperCase() + role.slice(1)}
                  value={role}
                />
              ))}
            </Tabs>
            <Button
              variant="contained"
              onClick={handleCreateOpen}
              sx={{ ml: 2 }}
              disabled={!isAdmin}
            >
              Create New Role
            </Button>
          </Box>
        )}
        <RoleTable
          roles={isAdmin ? filteredRoles : roles}
          onEdit={handleEditOpen}
          onRoleChange={handleRoleChangeOpen}
          onDelete={handleDelete}
        />
        <RoleFormDialog
          open={openCreate || openEdit}
          onClose={() => {
            setOpenCreate(false);
            setOpenEdit(false);
          }}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isEdit={openEdit}
          roleTypes={roleTypes}
        />
        <RoleChangeDialog
          open={openRoleChange}
          onClose={() => setOpenRoleChange(false)}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleRoleChange}
          roleTypes={roleTypes}
        />
        <Notifications
          error={error}
          success={success}
          onCloseError={() => setError("")}
          onCloseSuccess={() => setSuccess("")}
        />
      </Box>
    </Container>
  );
};

export default Roles;