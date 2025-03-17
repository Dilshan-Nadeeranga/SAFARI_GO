import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Componets/CSS/home.css'; // Import the CSS file

const UserHomepage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user details from local storage or API
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="logo">SafariGo</div>
        <nav className="nav">
          <a href="/UserHomepage">Home</a>
          <a href="/discover">Discover</a>
          <a href="/activities">Activities</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
        {/*dropdown*/}
        <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="profileDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="user-profile" onClick={() => navigate('/UserProfile')}>
                      {user ? (
                      <span className="username">{user.name}</span>
                      ) : (
                      <a href="/LoginForm">Login</a>
                      )}
                    </div>
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="profileDropdown">
                    <li><a className="dropdown-item" href="/">Logout Profile</a></li>
                    <li><a className="dropdown-item" href="/UserProfile">User Profile</a></li>
                  </ul>
                </li>
        {/*dropdown*/}
        {/*<div className="user-profile" onClick={() => navigate('/UserProfile')}>
          {user ? (
            <span className="username">{user.name}</span>
          ) : (
            <a href="/LoginForm">Login</a>
          )}
        </div>*/}
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Plan Your Safari Adventure</h1>
          <p>
            Search for safari destinations, select your dates. Whether you're looking for a
            thrilling wildlife experience or a peaceful nature tour, we've got you covered!
          </p>
        </div>
      </section>

      {/* Plan Your Trip Section */}
      <aside className="plan-your-trip">
        <h2>Plan Your Trip</h2>
        <div className="filters">
          <select>
            <option>Date</option>
            <option>Price Low To High</option>
            <option>Price High To Low</option>
            <option>Name (A-Z)</option>
          </select>
        </div>
      </aside>

      {/* Safari Listings */}
      <section className="safari-listings">
        <div className="safari-grid">
          <div className="safari-card">
            <img src="safari1.jpg" alt="Safari 1" />
            <div className="safari-info">
              <h3>Mingo Safari</h3>
              <p>Search destinations, select dates, and book your adventure with ease.</p>
              <button>Book Now</button>
            </div>
          </div>
          <div className="safari-card">
            <img src="safari2.jpg" alt="Safari 2" />
            <div className="safari-info">
              <h3>Wildlife Tour</h3>
              <p>Experience the thrill of wildlife in their natural habitat.</p>
              <button>Book Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SafariGo</h3>
            <p>
              We are dedicated to making safari bookings, exchange, and management easy. We connect
              travelers with trusted safari operators for a broader, free, and fair wildlife
              experience.
            </p>
          </div>
          <div className="footer-section">
            <h3>Links</h3>
            <ul>
              <li><a href="/discover">Discover</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/blog">Blog & Articles</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/community">Community</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Address: No.02 Power Road, Colombo 03</p>
            <p>Phone: 0175-6207</p>
            <p>Email: safarigo@gmail.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 SafariGo. All rights reserved.</p>
          <div className="footer-links">
            <a href="/terms">Terms and Conditions</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserHomepage;