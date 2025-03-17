import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Componets/CSS/Profile.css";
import UpdateProfile from "./UpdateProfile";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
        const storedUserString = localStorage.getItem("user");

        if (!storedUserString) {
            console.error("No user found in localStorage. Redirecting to login.");
            navigate("/LoginForm");
            return;
        }

        const storedUser = JSON.parse(storedUserString);
        console.log("Stored User in Local Storage:", storedUser);

        if (!storedUser._id) {
            console.error("User ID is missing in localStorage.");
            navigate("/LoginForm");
            return;
        }

        console.log("User ID:", storedUser._id);

        const response = await axios.get(`http://localhost:8070/customerRoutes/${storedUser._id}`);

        console.log("API Response:", response.data);

        if (response.status === 200) {
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to fetch user data. Please try again.");
    }
};



  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await axios.delete(`http://localhost:8070/customerRoutes/${user._id}`);
        alert("Account deleted successfully!");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete account.");
      }
    }
  };

  return (
    <div className={`profile-page ${isUpdateMode ? "blur-background" : ""}`}>
      <header className="profile-header">
        <div className="logo">SafariGo</div>
        <nav className="profile-nav">
          <a href="/UserHomepage">Home</a>
          <a href="/discover">Discover</a>
          <a href="/activities">Activities</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      <main className="main-content">
        <div className="two-column-layout">
          <section className="user-information">
            <h2>User Information</h2>
            {user?.profilePicture && (
              <div className="profile-picture">
                <img src={`http://localhost:8070/${user.profilePicture}`} alt="Profile" />
              </div>
            )}
            <div className="user-info-form">
              <p><strong>First Name:</strong> {user?.name || "N/A"}</p>
              <p><strong>Last Name:</strong> {user?.Lname || "N/A"}</p>
              <p><strong>Gender:</strong> {user?.Gender || "N/A"}</p>
              <p><strong>Phone:</strong> {user?.Phonenumber1 || "N/A"}</p>
              <p><strong>Email:</strong> {user?.email || "N/A"}</p>
              <div className="form-buttons">
                <button className="edit-btn" onClick={() => setIsUpdateMode(true)}>Edit</button>
                <button className="delete-btn" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </section>

          <section className="user-trips">
            <h2>My Trips</h2>
            <div className="trip-card">
              <div className="trip-info">
                <div className="trip-rating">
                  <span>⭐⭐⭐⭐ 4.5 (1200 Reviews)</span>
                </div>
                <div className="trip-details">
                  <p>Non refundable</p>
                  <p>Date: 26th March 2025</p>
                  <p>Duration: Full day</p>
                </div>
                <div className="trip-price">
                  <span>💲1,200</span>
                  <p>Includes taxes and fees</p>
                </div>
              </div>
              <div className="trip-actions">
                <button className="delete-btn">Delete</button>
                <button className="update-btn">Update</button>
                <button className="view-btn">View Details</button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {isUpdateMode && <UpdateProfile user={user} setUser={setUser} setIsUpdateMode={setIsUpdateMode} />}
    </div>
  );
};

export default UserProfile;
