import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

/**
 * Protects a route by checking for an "auth_token" in localStorage.
 * If no token is found, the user is redirected to /auth.
 * Replace this logic with a real session check once backend auth is implemented.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('user_id');
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
