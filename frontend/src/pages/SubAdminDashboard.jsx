import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SubAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-4 text-xl">
      Sub Admin Dashboard<br />
      Welcome, {user?.email} <br />
      <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
    </div>
  );
};

export default SubAdminDashboard;