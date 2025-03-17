import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Componets/CSS/Profile.css";

const UpdateProfile = ({ user, setUser, setIsUpdateMode }) => {
  const [updatedUser, setUpdatedUser] = useState({
    name: "",
    Lname: "",
    Gender: "",
    Phonenumber1: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setUpdatedUser(user);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8070/customerRoutes/${user?._id}`,
        updatedUser
      );

      if (response.status === 200) {
        alert("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
        setIsUpdateMode(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update profile.");
    }
  };

  if (!user) {
    return <div className="loading">Loading user data...</div>;
  }

  return (
    <div className="update-profile-modal">
      <div className="modal-content">
        <h2>Update Profile</h2>
        <div className="form-group">
          <label>First Name:</label>
          <input type="text" name="name" value={updatedUser.name} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input type="text" name="Lname" value={updatedUser.Lname} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Gender:</label>
          <select name="Gender" value={updatedUser.Gender} onChange={handleInputChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Phone:</label>
          <input type="tel" name="Phonenumber1" value={updatedUser.Phonenumber1} onChange={handleInputChange} />
        </div>
        <div className="modal-buttons">
          <button className="save-btn" onClick={handleUpdate}>Save</button>
          <button className="cancel-btn" onClick={() => setIsUpdateMode(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
