// frontend/src/pages/Vehicle/VehicleOwnerDashboard.js
import React, { useEffect } from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import Header from "./Header";

const VehicleOwnerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("role") !== "vehicle_owner") {
      navigate("/LoginForm");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginForm");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-blue-800 text-white w-64 flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Vehicle Owner Dashboard</h2>
          <ul className="space-y-4">
            <li>
              <NavLink
                to="/vehicle-owner/profile"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md ${isActive ? "bg-blue-700" : "hover:bg-blue-600"}`
                }
              >
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/vehicle-owner/vehicles"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md ${isActive ? "bg-blue-700" : "hover:bg-blue-600"}`
                }
              >
                My Vehicles
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/vehicle-owner/settings"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md ${isActive ? "bg-blue-700" : "hover:bg-blue-600"}`
                }
              >
                Settings
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/vehicle-owner/notifications"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md ${isActive ? "bg-blue-700" : "hover:bg-blue-600"}`
                }
              >
                Notifications
              </NavLink>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header user={{ name: "Vehicle Owner" /* Replace with actual user data */ }} />
        <main className="p-4 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VehicleOwnerDashboard;