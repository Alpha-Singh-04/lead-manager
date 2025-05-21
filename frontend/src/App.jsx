import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import  { AuthProvider }  from "./context/authContext"; 
import Login from './pages/Login'
import PrivateRoute from "./routes/PrivateRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SubAdminDashboard from "./pages/SubAdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/superadmin/*"
            element={
              <PrivateRoute>
                <RoleBasedRoute role="superadmin">
                  <SuperAdminDashboard />
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/subadmin/*"
            element={
              <PrivateRoute>
                <RoleBasedRoute role="subadmin">
                  <SubAdminDashboard />
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/agent/*"
            element={
              <PrivateRoute>
                <RoleBasedRoute role="agent">
                  <AgentDashboard />
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
