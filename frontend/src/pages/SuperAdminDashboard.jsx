import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserManagement from "./UserManagement";
import LeadManagement from "./LeadManagement";
import ExcelUpload from "../components/ExcelUpload";

const SuperAdminDashboard = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "subadmin",
  });
  const [message, setMessage] = useState("");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/leads/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardStats(res.data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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

        {/* Dashboard Stats */}
        {!loading && dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Leads</h3>
              <p className="text-2xl font-bold">{dashboardStats.totalLeads}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Conversion Rate</h3>
              <p className="text-2xl font-bold">{dashboardStats.conversionRate}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">New Leads</h3>
              <p className="text-2xl font-bold">
                {dashboardStats.statusCounts?.find(s => s._id === 'new')?.count || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Won Leads</h3>
              <p className="text-2xl font-bold">
                {dashboardStats.statusCounts?.find(s => s._id === 'won')?.count || 0}
              </p>
            </div>
          </div>
        )}

        {/* Agent Performance */}
        {!loading && dashboardStats && dashboardStats.agentPerformance && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Agent Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Agent</th>
                    <th className="px-4 py-2 text-left">Total Leads</th>
                    <th className="px-4 py-2 text-left">Won Leads</th>
                    <th className="px-4 py-2 text-left">New Leads</th>
                    <th className="px-4 py-2 text-left">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardStats.agentPerformance.map((agent) => (
                    <tr key={agent._id} className="border-t">
                      <td className="px-4 py-2">{agent._id ? agent._id.name || agent._id.email || 'Unassigned' : 'Unassigned'}</td>
                      <td className="px-4 py-2">{agent.totalLeads}</td>
                      <td className="px-4 py-2">{agent.wonLeads}</td>
                      <td className="px-4 py-2">{agent.newLeads}</td>
                      <td className="px-4 py-2">
                        {agent.totalLeads > 0 ? ((agent.wonLeads / agent.totalLeads) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Leads */}
        {!loading && dashboardStats && dashboardStats.recentLeads && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Recent Leads</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Assigned To</th>
                    <th className="px-4 py-2 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardStats.recentLeads.map((lead) => (
                    <tr key={lead._id} className="border-t">
                      <td className="px-4 py-2">{lead.name}</td>
                      <td className="px-4 py-2">{lead.email}</td>
                      <td className="px-4 py-2">{lead.status}</td>
                      <td className="px-4 py-2">{lead.assignedTo?.name || 'Unassigned'}</td>
                      <td className="px-4 py-2">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create New User and User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Create New User Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            {message && (
              <div className={`mb-4 p-3 rounded-md ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="subadmin">Sub-Admin</option>
                  <option value="agent">Support Agent</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>

          {/* User Management Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <UserManagement />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Excel Upload</h2>
          <ExcelUpload />
        </div>

        {/* Lead Management Table */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <LeadManagement currentUserRole={user?.role} />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;