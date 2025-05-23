import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./components/Navbar";
import AuthPage from "./pages/auth/AuthPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AddUser from "./pages/dashboard/AddUser";
import Sellproduct from "./pages/dashboard/Sellproduct";
import Orders from "./pages/dashboard/Orders";
import Reports from "./pages/dashboard/Reports";
import Products from "./pages/dashboard/Products";
import Layout from "./pages/LandingPage/Layout";
import NotFoundPage from "./components/NotFoundPage";

function App() {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (decoded.exp < currentTime) {
          // Token expired, clear it and redirect to login
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          // Token valid, set role and allow access
          setRole(decoded.role);
          if (location.pathname === "/") {
            navigate("/dashboard"); // Redirect to dashboard if on landing page
          }
        }
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } else {
      // No token, stay on landing page or login
      if (location.pathname !== "/login") {
        navigate("/");
      }
    }
    setIsLoading(false); // Set loading to false after processing
  }, [navigate, location.pathname]);

  if (isLoading) {
    // Show a loading spinner or placeholder while checking token
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      {/* Show NavBar only if the user is logged in */}
      {role === "admin" && location.pathname !== "/" && <NavBar role={role} />}
      <Routes>
  <Route path="/" element={<Layout />} />
  <Route path="/login" element={<AuthPage />} />
  <Route
    path="/dashboard"
    element={
      <div className="pt-20">
        <AdminDashboard />
      </div>
    }
  />
  <Route
    path="/add-user"
    element={
      <div className="pt-20">
        <AddUser />
      </div>
    }
  />
  <Route
    path="/sell-product/:id"
    element={
      <div className="pt-20">
        <Sellproduct />
      </div>
    }
  />
  <Route
    path="/orders"
    element={
      <div className="pt-20">
        <Orders />
      </div>
    }
  />
  <Route
    path="/reports"
    element={
      <div className="pt-20">
        <Reports />
      </div>
    }
  />
  <Route
    path="/products"
    element={
      <div className="pt-20">
        <Products />
      </div>
    }
  />
  <Route
    path="*"
    element={
      <div className="pt-20">
        <NotFoundPage />
      </div>
    }
  />
</Routes>
    </>
  );
}

export default App;