import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const UserProfile = () => {
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

  const handleSubscribe = async (plan) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8070/users/subscribe",
        { plan },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        alert(`Subscribed to ${plan} plan successfully!`);
        setUser({ ...user, plan });
      }
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      alert("Failed to subscribe to plan.");
    }
  };

  if (!user) {
    return <div className="loading">Loading user data...</div>;
  }

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
            {user.profilePicture && (
              <div className="profile-picture">
                <img src={`http://localhost:8070/${user.profilePicture}`} alt="Profile" />
              </div>
            )}
            <div className="user-info-form">
              <p><strong>First Name:</strong> {user.name || "N/A"}</p>
              <p><strong>Last Name:</strong> {user.Lname || "N/A"}</p>
              <p><strong>Gender:</strong> {user.Gender || "N/A"}</p>
              <p><strong>Phone:</strong> {user.Phonenumber1 || "N/A"}</p>
              <p><strong>Subscription Plan:</strong> {user.plan || "Silver"}</p>
              <div className="form-buttons">
                <button className="edit-btn" onClick={() => setIsUpdateMode(true)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </section>

          <section className="subscription-plans">
            <h2>Subscription Plans</h2>
            <div className="plans">
              <div className="plan-card">
                <h3>Silver</h3>
                <p>Basic features</p>
                <button onClick={() => handleSubscribe("silver")}>Subscribe</button>
              </div>
              <div className="plan-card">
                <h3>Gold</h3>
                <p>Advanced features</p>
                <button onClick={() => handleSubscribe("gold")}>Subscribe</button>
              </div>
              <div className="plan-card">
                <h3>Platinum</h3>
                <p>All features included</p>
                <button onClick={() => handleSubscribe("platinum")}>Subscribe</button>
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