// frontend/src/pages/User/UserProfile.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpdateProfile from "./UpdateProfile";
import UserLayout from "./UserLayout";
import Header from "./Header";
import defprofile from "../../Componets/assets/default-profile.png";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({
    isPremium: false, 
    plan: null, 
    premiumUntil: null,
    discountRate: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "user") navigate("/LoginForm");

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch user profile data
        const profileRes = await axios.get("http://localhost:8070/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(profileRes.data);
        
        // Fetch premium status
        const premiumRes = await axios.get("http://localhost:8070/users/premium/status", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPremiumStatus({
          isPremium: premiumRes.data.isPremium,
          plan: premiumRes.data.plan,
          premiumUntil: premiumRes.data.premiumUntil,
          discountRate: premiumRes.data.discountRate
        });
      } catch (err) {
        console.error("Fetch user error:", err);
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
    <div className="bg-gray-100 min-h-screen flex flex-col">
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
             
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>First Name:</strong> {user.name || "N/A"}</p>
            <p className="text-gray-700"><strong>Last Name:</strong> {user.Lname || "N/A"}</p>
            <p className="text-gray-700"><strong>Gender:</strong> {user.Gender || "N/A"}</p>
            <p className="text-gray-700"><strong>Phone:</strong> {user.Phonenumber1 || "N/A"}</p>
            <p className="text-gray-700"><strong>Email:</strong> {user.email || "N/A"}</p>
          </div>
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Membership Status</h3>
            {premiumStatus.isPremium ? (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-md">
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-2">✨</span>
                  <span className="font-bold">Premium Member</span>
                  <span className="ml-2 bg-white text-purple-700 text-xs px-2 py-0.5 rounded-full">
                    {premiumStatus.plan?.toUpperCase()}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  You receive {premiumStatus.discountRate}% discount on all safari packages!
                </p>
                <p className="text-xs mt-1">
                  Premium until: {new Date(premiumStatus.premiumUntil).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="border border-gray-300 p-4 rounded-md">
                <p>Regular User</p>
                <p className="text-sm text-gray-600 mt-1">
                  Upgrade to Premium to enjoy exclusive discounts!
                </p>
                <button 
                  onClick={() => navigate('/user/subscriptions')}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            )}
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
      
      {/* Updated modal rendering with overlay */}
      {isUpdateMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <UpdateProfile user={user} setUser={setUser} setIsUpdateMode={setIsUpdateMode} />
        </div>
      )}
    </div>
  );
};

export default UserProfile;