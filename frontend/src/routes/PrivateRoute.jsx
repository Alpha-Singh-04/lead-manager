import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const token = localStorage.getItem("token");

  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the protected content
  if (isAuthenticated && user) {
    return children;
  }

  // If still loading, show loading state
  return <div>Loading...</div>;
};

export default PrivateRoute;