// frontend/src/pages/Vehicle/VehicleOwnerProfile.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";

const VehicleOwnerProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/LoginForm");
          return;
        }
        const response = await axios.get("http://localhost:8070/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Profile data:", response.data);
        setUser(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error.message);
        navigate("/LoginForm");
      }
    };

    fetchProfile(); // Call the function inside useEffect
  }, [navigate]); // Dependency array includes navigate

  const handleEdit = () => setIsEditing(true);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSave = async () => {
    try {
      const data = new FormData(); // Use a different variable name to avoid shadowing
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      const response = await axios.put(
        "http://localhost:8070/users/profile/vehicle-owner",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Profile updated:", response.data);
      setUser(response.data); // Update user state with new data
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      alert("Failed to update profile.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      try {
        await axios.delete("http://localhost:8070/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/LoginForm");
      } catch (error) {
        console.error("Error deleting profile:", error);
        alert("Failed to delete profile.");
      }
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header user={user} />
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
        {isEditing ? (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <input
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 border rounded"
              placeholder="Name"
            />
            <input
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 border rounded"
              placeholder="Email"
              disabled // Email typically shouldn't be editable
            />
            <input
              name="Gender"
              value={formData.Gender || ""}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 border rounded"
              placeholder="Gender"
            />
            <input
              name="Phonenumber1"
              value={formData.Phonenumber1 || ""}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 border rounded"
              placeholder="Contact Number"
            />
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="flex space-x-4">
              <button onClick={handleSave} className="bg-blue-600 text-white p-2 rounded">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-gray-600 text-white p-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {user.profilePicture && (
              <img
                src={`http://localhost:8070/${user.profilePicture}`}
                alt="Profile"
                className="w-24 h-24 rounded-full mb-4"
              />
            )}
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email || "Not available"}</p>
            <p><strong>Gender:</strong> {user.Gender || "Not specified"}</p>
            <p><strong>Contact Number:</strong> {user.Phonenumber1 || "Not specified"}</p>
            <div className="flex space-x-4 mt-4">
              <button onClick={handleEdit} className="bg-blue-600 text-white p-2 rounded">
                Edit
              </button>
              <button onClick={handleDelete} className="bg-red-600 text-white p-2 rounded">
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleOwnerProfile;