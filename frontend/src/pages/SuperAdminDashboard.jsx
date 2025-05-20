import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SuperAdminDashboard = () => {
  const [formData, setFormData] = useState({
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
      const res = await axios.post("http://localhost:5000/api/users/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      setFormData({ email: "", password: "", role: "subadmin" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Error creating user");
    }
  };

  return (
    <div className="p-4 text-xl">
      Super Admin Dashboard<br />
      Welcome, {user?.email} <br />
      <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>

      <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create Sub-Admin / Agent</h2>
      {message && <p className="mb-2 text-sm text-blue-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create User
        </button>
      </form>
    </div>
    </div>
  );
};

export default SuperAdminDashboard;