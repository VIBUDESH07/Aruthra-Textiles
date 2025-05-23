import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Menu, X, UserPlus, LogOut, Bell, User, Settings, HelpCircle } from "lucide-react";

export default function NavBar({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

  const toggleProfileMenu = (e) => {
    e.stopPropagation();
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileMenuOpen(false);
  };

  const notifications = [
    { id: 1, text: "New order received", time: "5 minutes ago" },
    { id: 2, text: "Low stock alert: Product XYZ", time: "1 hour ago" },
    { id: 3, text: "System update completed", time: "Yesterday" },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-blue-600 text-2xl font-bold flex items-center">
              <Package className="mr-2" size={28} />
              <span>Aruthra</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-6 ml-10">
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Products
              </Link>
              <Link to="/orders" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Orders
              </Link>
              <Link to="/reports" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Reports
              </Link>
            </div>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Bell size={22} />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {notifications.length}
                </span>
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                        <p className="text-sm text-gray-800">{notification.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 text-center">
                    <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                  <span className="hidden md:block font-medium text-gray-700">Admin User</span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center">
                      <User size={16} className="mr-2 text-gray-500" />
                      <span>Profile</span>
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center">
                      <Settings size={16} className="mr-2 text-gray-500" />
                      <span>Settings</span>
                    </Link>
                    <Link to="/help" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center">
                      <HelpCircle size={16} className="mr-2 text-gray-500" />
                      <span>Help</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Conditionally Show "Add User" */}
            {role === "admin" && (
              <Link
                to="/add-user"
                className="hidden md:flex bg-blue-600 text-white px-4 py-2 rounded-lg items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <UserPlus size={18} />
                <span>Add User</span>
              </Link>
            )}

            {/* Show Login Button if not authenticated */}
            {!isAuthenticated && (
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
            <Link to="/dashboard" className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              Dashboard
            </Link>
            <Link to="/products" className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              Products
            </Link>
            <Link to="/orders" className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              Orders
            </Link>
            <Link to="/reports" className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              Reports
            </Link>

            {role === "admin" && (
              <Link
                to="/add-user"
                className="block py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <UserPlus size={18} className="mr-2" />
                <span>Add User</span>
              </Link>
            )}

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
              >
                <LogOut size={18} className="mr-2" />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}