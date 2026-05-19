import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserReport from "./pages/UserReport";
import AdminReport from "./pages/AdminReport";
import Trash from "./pages/Trash";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) return "login";
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser && savedUser.role === "admin") {
        return "admin";
      }
      return "dashboard";
    } catch {
      return "login";
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const handleLoginSuccess = (userToken, userData) => {
    setToken(userToken);
    setUser(userData);
    if (userData.role === "admin") {
      setCurrentPage("admin");
    } else {
      setCurrentPage("dashboard");
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.clear();
    setCurrentPage("login");
  };

  // State Router
  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => setCurrentPage("register")}
          />
        );
      case "register":
        return (
          <Register
            onNavigateLogin={() => setCurrentPage("login")}
          />
        );
      case "dashboard":
        return (
          <Dashboard
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateReport={() => setCurrentPage("report-user")}
            onNavigateTrash={() => setCurrentPage("trash")}
          />
        );
      case "trash":
        return (
          <Trash
            token={token}
            onLogout={handleLogout}
            onNavigateDashboard={() => setCurrentPage("dashboard")}
          />
        );
      case "admin":
        return (
          <AdminDashboard
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateReport={() => setCurrentPage("report-admin")}
          />
        );
      case "report-user":
        return (
          <UserReport
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateDashboard={() => setCurrentPage("dashboard")}
          />
        );
      case "report-admin":
        return (
          <AdminReport
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateDashboard={() => setCurrentPage("admin")}
          />
        );
      default:
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => setCurrentPage("register")}
          />
        );
    }
  };

  return <div className="app-root-container">{renderPage()}</div>;
}
