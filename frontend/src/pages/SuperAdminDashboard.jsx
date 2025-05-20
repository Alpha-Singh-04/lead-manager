import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserManagement from "./UserManagement";
import LeadManagement from "./LeadManagement";

const SuperAdminDashboard = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "subadmin",
  });
  const [message, setMessage] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/users", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      setMessage(res.data.message);
      setFormData(prevData => ({
        name: "",
        email: "",
        password: "",
        role: prevData.role
      }));
    } catch (err) {
      console.error("Error creating user:", err);
      setMessage(err.response?.data?.message || "Error creating user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.email}</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create User Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            {message && (
              <p className={`mb-4 text-sm ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
                {message}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
              >
                <option value="subadmin">Sub-Admin</option>
                <option value="agent">Support Agent</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Create User
              </button>
            </form>
          </div>

          {/* User Management Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <UserManagement />
          </div>

          {/* Lead Management Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <LeadManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;