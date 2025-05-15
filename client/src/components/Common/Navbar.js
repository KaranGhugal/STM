import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart Task Manager
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {currentUser ? (
            <>
              {/*<Button color="inherit" component={Link} to="/home">Home</Button>
              <Button color="inherit" component={Link} to="/tasks">Tasks</Button>*/}
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;