import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LeadManagement from "./LeadManagement";

const AgentDashboard = () => {
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
    if (user?.role === 'agent') {
        fetchDashboardStats();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agent Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      {!loading && dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Total Assigned Leads</h3>
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

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-bold mb-4">My Assigned Leads</h2>
        <LeadManagement currentUserRole={user?.role} />
      </div>
    </div>
  );
};

export default AgentDashboard;