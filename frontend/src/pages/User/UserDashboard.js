// frontend/src/pages/User/UserDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import UpdateProfile from "./UpdateProfile";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/LoginForm");
          return;
        }
        const response = await axios.get("http://localhost:8070/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/LoginForm");
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete("http://localhost:8070/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Account deleted successfully!");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete account.");
      }
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl">Loading user data...</div>;
  }

  return (
    <div className={`bg-gray-100 min-h-screen flex flex-col ${isUpdateMode ? "opacity-50" : ""}`}>
      <Header user={user} />
      
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome, {user.name || "User"}
          </h2>
          <div className="user-info">
            <div className="flex items-center mb-6">
              {user.profilePicture ? (
                <img
                  src={`http://localhost:8070/${user.profilePicture}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 mr-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl mr-4">
                  {user.name ? user.name[0] : "U"}
                </div>
              )}
              <div className="space-y-3">
                <p className="text-gray-700"><strong>First Name:</strong> {user.name || "N/A"}</p>
                <p className="text-gray-700"><strong>Last Name:</strong> {user.Lname || "N/A"}</p>
                <p className="text-gray-700"><strong>Gender:</strong> {user.Gender || "N/A"}</p>
                <p className="text-gray-700"><strong>Phone:</strong> {user.Phonenumber1 || "N/A"}</p>
                <p className="text-gray-700"><strong>Subscription Plan:</strong> {user.plan || "Silver"}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsUpdateMode(true)}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
      {isUpdateMode && <UpdateProfile user={user} setUser={setUser} setIsUpdateMode={setIsUpdateMode} />}
      
    </div>
  );
};

export default UserDashboard;