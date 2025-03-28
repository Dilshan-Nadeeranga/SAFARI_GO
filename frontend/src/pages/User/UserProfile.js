// frontend/src/pages/User/UserProfile.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
//import "../../Componets/CSS/Profile.css" // add css
import UpdateProfile from "./UpdateProfile";
import UserLayout from "./UserLayout";
import Header from "./Header";
import defprofile from "../../Componets/assets/default-profile.png";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "user") navigate("/LoginForm");

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8070/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Fetch user error:", err);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete("http://localhost:8070/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Account deleted.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete account.");
      }
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl">Loading user data...</div>;

  return (
    <div className={`bg-gray-100 min-h-screen flex flex-col ${isUpdateMode ? "opacity-50" : ""}`}>
      <Header user={user} />
      <UserLayout>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Profile</h2>
          <div className="flex items-center mb-6">
            <img
              src={user.profilePicture ? `http://localhost:8070/${user.profilePicture}` : "/default-profile.png"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 mr-4"
            />
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {user.name} {user.Lname}
              </p>
              <p className="text-gray-600">
                <strong>Plan:</strong> {user.plan || "Silver"}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>First Name:</strong> {user.name || "N/A"}</p>
            <p className="text-gray-700"><strong>Last Name:</strong> {user.Lname || "N/A"}</p>
            <p className="text-gray-700"><strong>Gender:</strong> {user.Gender || "N/A"}</p>
            <p className="text-gray-700"><strong>Phone:</strong> {user.Phonenumber1 || "N/A"}</p>
            <p className="text-gray-700"><strong>Email:</strong> {user.email || "N/A"}</p>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setIsUpdateMode(true)}
            >
              Edit Profile
            </button>
            <button
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              onClick={handleDelete}
            >
              Delete Account
            </button>
          </div>
        </div>
      </UserLayout>
      {isUpdateMode && <UpdateProfile user={user} setUser={setUser} setIsUpdateMode={setIsUpdateMode} />}
    </div>
  );
};

export default UserProfile;