import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon, UserPlusIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";

export default function NavBar({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/dashboard" className="text-white text-2xl font-bold">
          Admin Panel
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/dashboard" className="text-white hover:text-gray-300 transition">
            Dashboard
          </Link>

          {/* Conditionally Show "Add User" */}
          {role === "admin" && (
            <Link to="/add-user" className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 transition">
              <UserPlusIcon className="h-5 w-5" />
              <span>Add User</span>
            </Link>
          )}

          {/* Show Login or Logout Button */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/login" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Items */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 text-white space-y-3 py-3 text-center">
          <Link to="/dashboard" className="block py-2 hover:bg-blue-800">Dashboard</Link>
          
          {role === "admin" && (
            <Link to="/add-user" className="block py-2 bg-white text-blue-600 mx-4 rounded-lg hover:bg-gray-100">
              Add User
            </Link>
          )}

          {/* Show Login or Logout Button in Mobile Menu */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="block py-2 bg-red-500 text-white mx-4 rounded-lg hover:bg-red-600 w-full"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="block py-2 bg-green-500 text-white mx-4 rounded-lg hover:bg-green-600">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
