import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuthToken, getUserData, clearAuth } from '../utils/authUtils';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = () => {
  const { currentUser, loading, syncUserState } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        const storedUserData = getUserData();

        console.log('Protected Route - Auth Check:', { 
          hasCurrentUser: !!currentUser, 
          hasStoredUser: !!storedUserData,
          hasToken: !!token 
        });

        // Synchronize context with localStorage
        if (token && storedUserData) {
          if (!currentUser) {
            await syncUserState();
          }
          // Validate token expiration and role
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            console.log("Token expired, clearing auth");
            clearAuth();
          } else if (!decoded.role) {
            console.log("Token missing role, clearing auth");
            clearAuth();
          }
        } else if (!token) {
          clearAuth();
        }
      } catch (error) {
        console.error('Error in ProtectedRoute initialization:', error);
        clearAuth();
      } finally {
        setLocalLoading(false);
      }
    };
    
    initializeAuth();
  }, [currentUser, syncUserState]);

  if (loading || localLoading) {
    return <div>Loading authentication...</div>;
  }

  const token = getAuthToken();
  const userData = getUserData();
  const user = currentUser || userData;

  if (!user || !token) {
    const reason = !user && !token ? 'missing both user and token' :
                  !user ? 'missing user data' : 'missing token';
    
    console.log(`Access denied (${reason}) - redirecting to login`);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;