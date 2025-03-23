// frontend/src/pages/User/UpdateProfile.js
import React, { useState, useEffect } from "react";
import axios from "axios";


const UpdateProfile = ({ user, setUser, setIsUpdateMode }) => {
  const [formData, setFormData] = useState({ name: "", Lname: "", Gender: "", Phonenumber1: "" });
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        Lname: user.Lname || "",
        Gender: user.Gender || "",
        Phonenumber1: user.Phonenumber1 || "",
      });
    }
  }, [user]);

  const validate = () => {
    if (!formData.name.trim()) return alert("First Name is required.");
    if (!formData.Lname.trim()) return alert("Last Name is required.");
    if (!formData.Gender) return alert("Gender is required.");
    if (!/^\d{10}$/.test(formData.Phonenumber1)) return alert("Enter valid 10-digit phone number.");
    return true;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (profilePicture) data.append("profilePicture", profilePicture);

      const res = await axios.put("http://localhost:8070/users/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Profile updated successfully!");
      setUser(res.data);
      setIsUpdateMode(false);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="update-modal">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        <div className="form-group">
          <label>First Name</label>
          <input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input name="Lname" value={formData.Lname} onChange={(e) => setFormData({...formData, Lname: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select name="Gender" value={formData.Gender} onChange={(e) => setFormData({...formData, Gender: e.target.value})}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input name="Phonenumber1" value={formData.Phonenumber1} onChange={(e) => setFormData({...formData, Phonenumber1: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Profile Picture</label>
          <input type="file" accept="image/*" onChange={(e) => setProfilePicture(e.target.files[0])} />
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
