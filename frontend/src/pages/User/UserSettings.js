// frontend/src/pages/User/UserSettings.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Added for navigation

const UserSettings = () => {
  const navigate = useNavigate(); // Added for navigation
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordChange = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/LoginForm"); // Redirect to login if no token
        return;
      }
      const response = await axios.put(
        "http://localhost:8070/users/change-password",
        { oldPassword: password, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        alert("Password changed successfully!");
        setPassword("");
        setNewPassword("");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password.");
      if (error.response?.status === 401) {
        navigate("/LoginForm"); // Redirect to login on unauthorized error
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h2>
          <div className="settings-section">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Current Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your current password"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your new password"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;