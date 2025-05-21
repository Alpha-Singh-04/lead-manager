import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const RoleBasedRoute = ({ children, role }) => {
  const { user } = useAuth();
  return user?.role === role ? children : <Navigate to="/login" />;
};

export default RoleBasedRoute;