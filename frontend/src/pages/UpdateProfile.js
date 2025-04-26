import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateProfile = ({ user, setUser, setIsUpdateMode }) => {
  const navigate = useNavigate();
  const [updatedUser, setUpdatedUser] = useState({
    name: "",
    Lname: "",
    Gender: "",
    Phonenumber1: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    if (user) {
      setUpdatedUser({
        name: user.name || "",
        Lname: user.Lname || "",
        Gender: user.Gender || "",
        Phonenumber1: user.Phonenumber1 || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", updatedUser.name);
      formData.append("Lname", updatedUser.Lname);
      formData.append("Gender", updatedUser.Gender);
      formData.append("Phonenumber1", updatedUser.Phonenumber1);
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await axios.put("http://localhost:8070/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        alert("Profile updated successfully!");
        setUser(response.data);
        setIsUpdateMode(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update profile.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginForm");
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl">Loading user data...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-lg rounded-t-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold">SafariGo</div>
            <nav className="hidden md:flex space-x-6">
              <a href="/UserHomepage" className="hover:text-blue-200 transition-colors">Home</a>
              <a href="/discover" className="hover:text-blue-200 transition-colors">Discover</a>
              <a href="/activities" className="hover:text-blue-200 transition-colors">Activities</a>
              <a href="/about" className="hover:text-blue-200 transition-colors">About</a>
              <a href="/contact" className="hover:text-blue-200 transition-colors">Contact</a>
            </nav>
            <div className="relative group">
              <div className="flex items-center cursor-pointer">
                <span className="text-white mr-2">Profile</span>
                {user.profilePicture ? (
                  <img
                    src={`http://localhost:8070/${user.profilePicture}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    {user.name ? user.name[0] : "U"}
                  </div>
                )}
              </div>
              <ul className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-md mt-2 z-10 w-48">
                <li className="px-4 py-2 text-gray-800 font-semibold">Thamidu</li>
                <li className="px-4 py-2 text-gray-600">Welcome, User</li>
                <li>
                  <a href="/dashboard" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Dashboard</a>
                </li>
                <li>
                  <a href="/trips" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Trips</a>
                </li>
                <li>
                  <a href="/subscriptions" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Subscriptions</a>
                </li>
                <li>
                  <a href="/settings" className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Settings</a>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100"
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Update Form */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Update Profile</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="name"
                  value={updatedUser.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="Lname"
                  value={updatedUser.Lname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="Gender"
                  value={updatedUser.Gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="Phonenumber1"
                  value={updatedUser.Phonenumber1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsUpdateMode(false)}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;