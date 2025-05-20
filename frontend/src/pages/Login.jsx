import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "superadmin") navigate("/dashboard/superadmin");
      else if (res.data.user.role === "subadmin") navigate("/dashboard/subadmin");
      else navigate("/dashboard/agent");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl mb-4">Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border w-full p-2 mb-3"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border w-full p-2 mb-4"
        required
      />
      <div className="flex items-center mb-4">
        <select>
          <option value="superadmin">Super Admin</option>
          <option value="subadmin">Sub Admin</option>
          <option value="agent">Agent</option>
        </select>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Login
      </button>
    </form>
  );
};