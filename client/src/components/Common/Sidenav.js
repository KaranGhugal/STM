import React from "react";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  useTheme,
  styled,
  Box,
  IconButton,
  Tooltip,
  Badge,
  useMediaQuery,
} from "@mui/material";
import {
  Home as HomeIcon,
  ListAlt as TasksIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Info as InfoIcon,
  ChevronLeft,
  ChevronRight,
  ChatBubbleOutline as MessagesIcon,
  Group as RolesIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

// Constants
const drawerWidth = 240;
const collapsedWidth = 90;
const appBarHeight = 64;

// Styled components
const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : collapsedWidth,
    height: `calc(100vh - ${appBarHeight}px)`,
    marginTop: appBarHeight,
    background: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxShadow: theme.shadows[3],
    overflowX: "hidden",
    position: "fixed",
    top: 0,
    left: 0,
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 45,
  height: 45,
  boxShadow: theme.shadows[3],
  border: `2px solid ${theme.palette.primary.light}`,
  transition: theme.transitions.create(["width", "height"], {
    duration: theme.transitions.duration.standard,
  }),
}));

const StyledNavItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  position: "relative",
  "&.Mui-selected": {
    backgroundColor: theme.palette.mode === "dark" 
      ? theme.palette.primary.dark 
      : theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: "25%",
      height: "50%",
      width: 4,
      backgroundColor: theme.palette.primary.main,
      borderRadius: "0 4px 4px 0",
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.contrastText,
    },
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  transition: theme.transitions.create(["background", "color"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const SideNav = ({ onToggleDrawer }) => {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  // Notify parent component when open state changes
  useEffect(() => {
    if (onToggleDrawer) {
      onToggleDrawer(open);
    }
  }, [open, onToggleDrawer]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Get the initial letter of the user's name
  const getUserInitial = () => {
    if (currentUser && currentUser.name) {
      return currentUser.name.charAt(0).toUpperCase();
    }
    return "U"; // Fallback if no name is available
  };

  const navItems = [
    { 
      text: "Home", 
      icon: <HomeIcon />, 
      link: "/home", 
      badge: 0,
      divider: false 
    },
    { 
      text: "Tasks", 
      icon: <TasksIcon />, 
      link: "/tasks", 
      badge: 5,
      divider: false 
    },
    { 
      text: "Messages", 
      icon: <MessagesIcon />, 
      link: "/messages", 
      badge: 3,
      divider: true 
    },
    { 
      text: "Profile", 
      icon: <ProfileIcon />, 
      link: "/profile", 
      badge: 0,
      divider: false 
    },
    { 
      text: "Roles",
      icon: <RolesIcon />,
      link: "/roles",
      badge: 0,
      divider: false
    },
    { 
      text: "Settings", 
      icon: <SettingsIcon />, 
      link: "/settings", 
      badge: 0,
      divider: false 
    },
    { 
      text: "About", 
      icon: <InfoIcon />, 
      link: "/about", 
      badge: 0,
      divider: false 
    },
  ];

  return (
    <StyledDrawer 
      variant="permanent" 
      open={open}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          p: theme.spacing(2),
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "space-between" : "center",
            mb: 2,
            p: 1,
            borderRadius: theme.shape.borderRadius,
            bgcolor: theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.03)",
            boxShadow: theme.shadows[1],
          }}
        >
          {open && (
            <>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <UserAvatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    mr: 1,
                  }}
                >
                  {getUserInitial()}
                </UserAvatar>
                <Box>
                  <Typography variant="subtitle1" noWrap fontWeight="medium">
                    {currentUser ? currentUser.name || "User" : "User"}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {currentUser ? currentUser.email || "No email" : "No email"}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
          {!open && (
            <Tooltip title="User" arrow>
              <UserAvatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                }}
              >
                {getUserInitial()}
              </UserAvatar>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <List>
            {navItems.map((item) => {
              const isSelected = location.pathname === item.link;
              
              return (
                <React.Fragment key={`fragment-${item.text}`}>
                  <Tooltip 
                    title={open ? "" : item.text} 
                    placement="right"
                  >
                    <StyledNavItem
                      component={NavLink}
                      to={item.link}
                      selected={isSelected}
                    >
                      <ListItemIcon sx={{ 
                        color: "inherit",
                        minWidth: open ? 36 : "auto",
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}>
                        {item.badge > 0 ? (
                          <Badge badgeContent={item.badge} color="error">
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )}
                      </ListItemIcon>
                      {open && (
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{ 
                            variant: "body2",
                            fontWeight: isSelected ? "medium" : "regular" 
                          }}
                        />
                      )}
                    </StyledNavItem>
                  </Tooltip>
                  {item.divider && <Divider sx={{ my: 1.5 }} />}
                </React.Fragment>
              );
            })}
          </List>
        </Box>

        {/* Collapse Button */}
        <Box>
          <Divider sx={{ mb: 1.5 }} />
          <Tooltip title={open ? "Collapse Menu" : "Expand Menu"} placement="right">
            <StyledNavItem
              onClick={toggleDrawer}
              sx={{
                justifyContent: open ? "start" : "center",
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: open ? 36 : "auto",
                mr: open ? 3 : "auto",
                justifyContent: "center",
              }}>
                {open ? <ChevronLeft /> : <ChevronRight />}
              </ListItemIcon>
              {open && (
                <ListItemText primary="Collapse Menu" />
              )}
            </StyledNavItem>
          </Tooltip>
        </Box>
      </Box>
    </StyledDrawer>
  );
};

// Export the widths for use in the parent component
export const DRAWER_WIDTH = drawerWidth;
export const COLLAPSED_WIDTH = collapsedWidth;

export default SideNav;