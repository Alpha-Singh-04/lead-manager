import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const RoleBasedRoute = ({ children, role }) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // If user's role doesn't match required role, redirect to login
  if (user.role !== role) {
    return <Navigate to="/login" />;
  }

  // If role matches, render the content
  return children;
};

export default RoleBasedRoute;