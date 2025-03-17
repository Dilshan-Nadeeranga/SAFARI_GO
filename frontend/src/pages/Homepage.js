import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import styles from "../Componets/CSS/dash.css"; // Import CSS styles
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap for styling

import instagram from '../Componets/assets/Instagram.webp';
import facebook from '../Componets/assets/facebook.png';
import twitter from '../Componets/assets/twitter.png';
import whatsapp from '../Componets/assets/whatsapp.png';
import searchIcon from "../Componets/assets/searchimage.png";

function HomePage() {
  const [safaris, setSafaris] = useState([]);
  const [filteredSafaris, setFilteredSafaris] = useState([]);
  const [priceFilter, setPriceFilter] = useState(50000);
  const [locationFilter, setLocationFilter] = useState("");
  const [locations, setLocations] = useState([]); // For dropdown suggestions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [safariTypeFilter, setSafariTypeFilter] = useState("");
  const uniqueSafariTypes = [
    ...new Set(
      safaris.map((safari) => {
        const normalized = safari.safariType.toLowerCase().trim(); // Normalize to lowercase and trim
        return normalized.charAt(0).toUpperCase() + normalized.slice(1); // Capitalize the first letter
      })
    ),
  ];
  const safarisPerPage = 8;

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleBooking = (safari) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      const proceed = window.confirm(
        "You need to log in before booking a safari. Do you want to proceed to the login page?"
      );
      if (proceed) {
        navigate("/LoginForm", { state: { safari } });
      }
    } else {
      navigate("/BookSafari", { state: { safari } });
    }
  };

  useEffect(() => {
    const fetchSafarisAndLocations = async () => {
      try {
        const response = await axios.get("http://localhost:8070/safaris"); // Updated path
        const verifiedSafaris = response.data.filter((safari) => safari.isVerified && !safari.isBooked); // Only verified and not booked safaris
        setSafaris(verifiedSafaris);
        setFilteredSafaris(verifiedSafaris);

        // Extract unique locations for the dropdown
        const uniqueLocations = [...new Set(verifiedSafaris.map((safari) => safari.safariLocation))];
        setLocations(uniqueLocations);

        setLoading(false);
      } catch (error) {
        setError("Error fetching safaris. Please try again later.");
        setLoading(false);
      }
    };

    fetchSafarisAndLocations();
  }, []);

  const applyFilters = () => {
    const filtered = safaris.filter((safari) => {
      const isPriceValid =
        priceFilter === 4000
          ? safari.price < 10000
          : priceFilter === 12000
          ? safari.price >= 10000 && safari.price <= 15000
          : priceFilter === 20000
          ? safari.price > 15000
          : true;

      const isLocationValid = locationFilter
        ? safari.safariLocation.toLowerCase().startsWith(locationFilter.toLowerCase())
        : true;

      const isSafariTypeValid = safariTypeFilter
        ? safari.safariType.toLowerCase() === safariTypeFilter.toLowerCase()
        : true;

      return isPriceValid && isLocationValid && isSafariTypeValid;
    });

    setFilteredSafaris(filtered);
    setCurrentPage(1); // Reset to the first page
  };

  const indexOfLastSafari = currentPage * safarisPerPage;
  const indexOfFirstSafari = indexOfLastSafari - safarisPerPage;
  const currentSafaris = filteredSafaris.slice(indexOfFirstSafari, indexOfLastSafari);
  const totalPages = Math.ceil(filteredSafaris.length / safarisPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleLoginIn = () => {
    sessionStorage.removeItem("token");
    navigate("/LoginForm", { replace: true });
  };

  return (
    <>
      <nav className="body">
        {/* Navigation Bar and Welcome Section Combined */}
        <div className="navbar navbar-expand-lg">
          <div className="container">
            <a className="nav-link text-warning" href="/">LOGO</a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link" href="/allListings">Safaris</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">About Us</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/maintenance">Blogs</a>
                </li>

                {/* Dropdown Menu */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="profileDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Account
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="profileDropdown">
                    <li><a className="dropdown-item" href="/LoginForm">Login</a></li>
                    <li><a className="dropdown-item" href="/RegistrationForm">Register</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <section id="dash">
          <div className="sector01">
            <div className="Homesector1-container">
              <div className="text-section">
                <p className="dash-Maintopic1">Explore the Wild, Live the Adventure – Your Perfect Safari Awaits!</p>
                <p className="dash-Mainpara1">
                  Find the best safari experiences near you instantly! Use our filters to select location, safari type, and budget—no more endless scrolling!
                </p>
              </div>
            </div>
          </div>
        </section>
      </nav>

      <div className="safari-list-container">
        <div className="filter-bar">
          <div className="filter-item">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="safariType">Safari Type</label>
            <select
              id="safariType"
              value={safariTypeFilter}
              onChange={(e) => setSafariTypeFilter(e.target.value)}
            >
              <option value="">Select Safari Type</option>
              {uniqueSafariTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="priceRange">Price Range</label>
            <select
              id="priceRange"
              value={priceFilter}
              onChange={(e) => setPriceFilter(Number(e.target.value))}
            >
              <option value="">All</option>
              <option value={4000}>Below Rs.10,000 / person</option>
              <option value={12000}>Rs.10,000 - Rs.15,000 / person</option>
              <option value={20000}>Above Rs.15,000 / person</option>
            </select>
          </div>

          <button className="filter-search-btn" onClick={applyFilters}>
            <img src={searchIcon} alt="Search" className="search-icon" />
          </button>
        </div>

        <div className="safari-grid">
          {currentSafaris.length === 0 ? (
            <div className="no-results">No safaris match your criteria.</div>
          ) : (
            currentSafaris.map((safari) => (
              <div className="safari-card" key={safari._id}>
                <img
                  src={`http://localhost:8070${safari.images[0]}`}
                  alt="Safari"
                  className="safari-image"
                  onClick={() => handleBooking(safari)}
                />
                <div className="safari-info">
                  <h5>{safari.safariType} - {safari.safariLocation}</h5>
                  <p className="safari-price">Rs {safari.price.toLocaleString()}</p>
                  <h5>Rating:
                    {Array.from({ length: 5 }, (_, index) => (
                      index < safari.buyerRating ? (
                        <span key={index} style={{ color: "#FFD700" }}>★</span> // Filled star
                      ) : (
                        <span key={index} style={{ color: "#D3D3D3" }}>★</span> // Empty star
                      )
                    ))}
                  </h5>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              className={`page-button ${currentPage === pageNumber ? "active" : ""}`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Process Section */}
      <section className="statistics-section">
        <div className="container">
          <div className="stats-left">
            <div className="stat-box">
              <h2 className="stat-value">5+</h2>
              <p className="stat-label">Years of Service</p>
            </div>
            <div className="stat-box">
              <h2 className="stat-value">10K+</h2>
              <p className="stat-label">Happy Adventurers</p>
            </div>
            <div className="stat-box">
              <h2 className="stat-value">100+</h2>
              <p className="stat-label">Verified Safaris</p>
            </div>
            <div className="stat-box">
              <h2 className="stat-value">20+</h2>
              <p className="stat-label">Locations Covered</p>
            </div>
          </div>
          <div className="stats-right">
            <h1 className="section-title">Find Your Ideal Safari Experience</h1>
            <p className="section-description">
              We make it easy for adventurers to find affordable and thrilling safari experiences. Browse verified listings and secure your adventure in just a few clicks.
            </p>
            <div className="buttons">
              <button className="primary-button" onClick={handleBooking}>Rate Us</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <div className={styles['faq-section']}>
        <section id="faq">
          <div className="FAQ-container">
            <h2 className={'faq-heading'}>Frequently Asked Questions</h2>
            <div className="accordion">
              <div className={`accordion-item mb-3`}>
                <h2 className="accordion-header" id="questionOne">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                  >
                    How do I book a safari?
                  </button>
                </h2>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse show"
                  aria-labelledby="questionOne"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    You can book a safari by clicking the "Book a Safari" button and filling out your details.
                  </div>
                </div>
              </div>

              <div className={`accordion-item mb-3`}>
                <h2 className="accordion-header" id="questionTwo">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                    Question 2?
                  </button>
                </h2>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"
                  aria-labelledby="questionTwo"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    Answer to question 2.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-container d-flex justify-content-center align-items-center vh-100">
        <div className="card newsletter-card">
          <div className="row g-0">
            <div className="col-md-8 p-4">
              <h3 className="newlettertopic">
                Subscribe our <strong>Newsletter</strong>
              </h3>
              <p className="text-muted">
                Join our newsletter to stay on top of current information and events.
              </p>
              <form className="d-flex mt-3">
                <input
                  type="email"
                  className="input-box"
                  placeholder="Enter your email address"
                  required
                />
                <button type="submit" className="submit-btn">
                  Submit
                </button>
              </form>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center">
              <div className="illustration"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer section */}
      <section id="contact">
        <div className={styles.footer}>
          <footer>
            <div id="footer_content" className="container">
              <div id="footer_contacts"></div>

              <div className="row">
                <div className="col-md-4">
                  <h3>Contact</h3>
                  <ul className="list-unstyled">
                    <li>Email: support@safarimanagement.com</li>
                    <li>Phone: +123-456-7890</li>
                  </ul>
                </div>

                <div className="col-md-4">
                  <div className="soci">
                    <h3>Socials</h3>
                    <div id="footer_social_media">
                      <a href="#" className="footer-link" id="instagram">
                        <img src={instagram} className="footer-link" id="instagram" />
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      <a href="#" className="footer-link" id="facebook">
                        <img src={whatsapp} className="footer-link" id="Facebook" />
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                      <a href="#" className="footer-link" id="whatsapp">
                        <img src={facebook} className="footer-link" id="whatapp" />
                        <i className="fa-brands fa-whatsapp"></i>
                      </a>
                      <a href="#" className="footer-link" id="twitter">
                        <img src={twitter} className="footer-link" id="twitter" />
                        <i className="fa-brands fa-twitter"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="footer_copyright" className="text-center">
              &copy; 2025 Safari Management. All rights reserved.
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}

export default HomePage;