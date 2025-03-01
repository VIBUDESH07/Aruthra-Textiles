import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Route, Routes, useNavigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import AuthPage from "./pages/auth/AuthPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AddUser from "./pages/dashboard/AddUser";
import Sellproduct from "./pages/dashboard/Sellproduct";
function App() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          navigate("/");
        } else {
          setRole(decoded.role); 
        }
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <><NavBar role={role} /> 
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/sell-product/:id" element={<Sellproduct />} />
      </Routes>
      </>
      
  );
}

export default App;
