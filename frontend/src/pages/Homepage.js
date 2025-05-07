import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


// Social icons (assuming white versions; replace with actual white icons)
import instagramWhite from "../Componets/assets/instagram-white.png";
import facebookWhite from "../Componets/assets/facebook-white.png";
import twitterWhite from "../Componets/assets/twitter-white.png";
import whatsappWhite from "../Componets/assets/whatsapp-white.png";
import searchIcon from "../Componets/assets/searchimage.png";

// Slider images (stored locally)
import slider1 from "../Componets/assets/slider1.jpg";
import slider2 from "../Componets/assets/slider2.jpg";
import slider3 from "../Componets/assets/slider3.jpg";

// Safari images (stored locally; add more as needed)
import safari1 from "../Componets/assets/safari1.jpg";
import safari2 from "../Componets/assets/safari2.jpg";
import safari3 from "../Componets/assets/safari3.jpg";

// Map image filenames to imported assets
const imageMap = {
  "safari1.jpg": safari1,
  "safari2.jpg": safari2,
  "safari3.jpg": safari3,
};

const sliderImages = [slider1, slider2, slider3];

function HomePage() {
  const [safaris, setSafaris] = useState([]);
  const [filteredSafaris, setFilteredSafaris] = useState([]);
  const [priceFilter, setPriceFilter] = useState(50000);
  const [locationFilter, setLocationFilter] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [safariTypeFilter, setSafariTypeFilter] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  // State for dropdown visibility
  const [isCareersOpen, setIsCareersOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const uniqueSafariTypes = [
    ...new Set(
      safaris.map((safari) => {
        // Add null check for safariType
        if (!safari || !safari.safariType) {
          return "Unknown";
        }
        const normalized = safari.safariType.toLowerCase().trim();
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
      })
    ),
  ];
  const safarisPerPage = 8;

  const navigate = useNavigate();

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsCareersOpen(false);
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBooking = (safari) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "user") {
      const proceed = window.confirm(
        "You need to log in as a user to book a safari. Do you want to proceed to the login page?"
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
        const response = await axios.get("http://localhost:8070/safaris");
        // Only show active safaris that have been approved by admin
        const verifiedSafaris = response.data
          .filter((safari) => safari.status === 'active')
          .map((safari) => ({
            ...safari,
            image: imageMap[safari.imageName] || safari1,
          }));
        setSafaris(verifiedSafaris);
        setFilteredSafaris(verifiedSafaris);

        const uniqueLocations = [
          ...new Set(verifiedSafaris.map((safari) => safari.location))
        ];
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
        ? safari.location.toLowerCase().startsWith(locationFilter.toLowerCase())
        : true;

      const isSafariTypeValid = safariTypeFilter
        ? safari.safariType.toLowerCase() === safariTypeFilter.toLowerCase()
        : true;

      return isPriceValid && isLocationValid && isSafariTypeValid;
    });

    setFilteredSafaris(filtered);
    setCurrentPage(1);
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
      {/* Navbar */}
      <nav className="bg-blue-600 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-white text-2xl font-extrabold">LOGO</a>
          <div className="hidden md:flex items-center space-x-6">
            <a href="/allListings" className="text-white hover:text-blue-200 transition-colors">Safaris</a>
            <a href="/explore-safaris" className="text-white hover:text-blue-200 transition-colors">Explore Safaris</a>
            <div className="relative dropdown-container">
              <button
                className="text-white hover:text-blue-200 flex items-center"
                onClick={() => setIsCareersOpen(!isCareersOpen)}
              >
                Careers
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`absolute ${isCareersOpen ? "block" : "hidden"} bg-white shadow-lg rounded-md mt-2 z-10`}
              >
                <a
                  href="/LoginForm"
                  onClick={() => {
                    setIsCareersOpen(false);
                    navigate("/LoginForm", { state: { role: "guide" } });
                  }}
                  className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
                >
                  Guide
                </a>
                <a
                  href="/LoginForm"
                  onClick={() => {
                    setIsCareersOpen(false);
                    navigate("/LoginForm", { state: { role: "vehicle_owner" } });
                  }}
                  className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
                >
                  Vehicle Owner
                </a>
                <a
                  href="/LoginForm"
                  onClick={() => {
                    setIsCareersOpen(false);
                    navigate("/LoginForm", { state: { role: "user" } });
                  }}
                  className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
                >
                  User
                </a>
              </div>
            </div>
            <a href="/about" className="text-white hover:text-blue-200 transition-colors">About Us</a>
            <a href="/maintenance" className="text-white hover:text-blue-200 transition-colors">Blogs</a>
            <div className="relative dropdown-container">
              <button
                className="text-white hover:text-blue-200 flex items-center"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
              >
                Account
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`absolute ${isAccountOpen ? "block" : "hidden"} bg-white shadow-lg rounded-md mt-2 z-10`}
              >
                <a
                  href="/LoginForm"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/LoginForm");
                  }}
                  className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
                >
                  Login
                </a>
                <a
                  href="/RegistrationForm"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/RegistrationForm");
                  }}
                  className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
          <button className="md:hidden text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Welcome Section with Slider */}
      <section className="bg-blue-100 py-10 text-center">
        <div className="container mx-auto px-4">
          <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-xl mb-6">
            {sliderImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Slide ${index + 1}`}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-blue-50"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % sliderImages.length)}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-blue-50"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4">
            Explore the Wild, Live the Adventure!
          </h1>
          <p className="text-lg text-blue-600 max-w-2xl mx-auto">
            Discover thrilling safari experiences tailored to your preferences with our easy filters!
          </p>
        </div>
      </section>

      {/* Registration Section */}
      <div className="register-options text-center py-10 bg-blue-50">
        <h2 className="text-3xl font-bold text-blue-800 mb-4">Join SafariGo Today</h2>
        <div className="buttons-container">
          <button 
            onClick={() => navigate('/RegistrationForm')}
            className="register-btn primary-btn bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
          >
            Register Now
          </button>
          <p className="mt-4 text-blue-600">
            Sign up as a Customer, Guide, or Vehicle Owner and access our full range of services.
          </p>
        </div>
      </div>

      {/* Safari List and Filters */}
      <div className="container mx-auto px-4 py-10 bg-blue-50">
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-6 mb-6">
          <div className="w-full md:w-80">
            <label htmlFor="location" className="block text-sm font-medium text-blue-700 mb-1">Location</label>
            <select
              id="location"
              className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-blue-800"
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
          {/* <div className="w-full md:w-80">
            <label htmlFor="safariType" className="block text-sm font-medium text-blue-700 mb-1">Safari Type</label>
            <select
              id="safariType"
              className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-blue-800"
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
          </div> */}
          <div className="w-full md:w-80">
            <label htmlFor="priceRange" className="block text-sm font-medium text-blue-700 mb-1">Price Range</label>
            <select
              id="priceRange"
              className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-blue-800"
              value={priceFilter}
              onChange={(e) => setPriceFilter(Number(e.target.value))}
            >
              <option value="">All</option>
              <option value={4000}>Below Rs.10,000 / person</option>
              <option value={12000}>Rs.10,000 - Rs.15,000 / person</option>
              <option value={20000}>Above Rs.15,000 / person</option>
            </select>
          </div>
          <div className="w-full md:w-16 flex items-end">
            <button
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
              onClick={applyFilters}
            >
              <img src={searchIcon} alt="Search" className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentSafaris.length === 0 ? (
            <div className="col-span-full text-center text-xl text-blue-600 font-semibold">
              No safaris match your criteria.
            </div>
          ) : (
            currentSafaris.map((safari) => (
              <div key={safari._id} className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform">
                <img
                  src={safari.image}
                  alt="Safari"
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleBooking(safari)}
                />
                <div className="p-4">
                  <h5 className="text-lg font-semibold text-blue-800">
                    {safari.safariType} - {safari.safariLocation}
                  </h5>
                  <p className="text-blue-600 font-medium">Rs {safari.price.toLocaleString()}</p>
                  <div className="flex mt-2">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className={index < safari.buyerRating ? "text-yellow-400" : "text-blue-200"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center mt-6 gap-3">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              className={`px-4 py-2 rounded-lg shadow-md ${
                currentPage === pageNumber
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              } transition-colors`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <section className="bg-blue-100 py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="flex flex-wrap justify-center gap-8 md:w-1/2">
            <div className="text-center bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-blue-700">5+</h2>
              <p className="text-blue-600">Years of Service</p>
            </div>
            <div className="text-center bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-blue-700">10K+</h2>
              <p className="text-blue-600">Happy Adventurers</p>
            </div>
            <div className="text-center bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-blue-700">100+</h2>
              <p className="text-blue-600">Verified Safaris</p>
            </div>
            <div className="text-center bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-blue-700">20+</h2>
              <p className="text-blue-600">Locations Covered</p>
            </div>
          </div>
          <div className="text-center md:w-1/2 mt-6 md:mt-0">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">Find Your Ideal Safari Experience</h1>
            <p className="text-blue-600 mb-4 max-w-md mx-auto">
              We make it easy for adventurers to find affordable and thrilling safari
              experiences with a splash of blue!
            </p>
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
              onClick={handleBooking}
            >
              Rate Us
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-10 bg-blue-50">
        <h2 className="text-4xl font-bold text-blue-800 text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-white shadow-lg rounded-lg">
            <button
              className="w-full text-left p-4 font-semibold text-blue-800 flex justify-between items-center hover:bg-blue-50 transition-colors"
              onClick={(e) => e.target.nextElementSibling.classList.toggle("hidden")}
            >
              How do I book a safari?
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="p-4 hidden text-blue-600">
              You can book a safari by clicking the "Book a Safari" button and filling out your details.
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg">
            <button
              className="w-full text-left p-4 font-semibold text-blue-800 flex justify-between items-center hover:bg-blue-50 transition-colors"
              onClick={(e) => e.target.nextElementSibling.classList.toggle("hidden")}
            >
              Question 2?
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="p-4 hidden text-blue-600">Answer to question 2.</div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-blue-100 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">
              Subscribe our <span className="text-blue-600">Newsletter</span>
            </h3>
            <p className="text-blue-600 mb-4">
              Join our newsletter to stay on top of current information and events.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-blue-800"
                placeholder="Enter your email address"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Section with White Social Icons and Vertical Quick Navigation */}
      <footer className="bg-blue-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-4 text-blue-200">Contact</h3>
              <ul className="list-none">
                <li className="text-blue-200">Email: support@safarimanagement.com</li>
                <li className="text-blue-200">Phone: +123-456-7890</li>
              </ul>
            </div>
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-4 text-blue-200">Quick Navigation</h3>
              <ul className="list-none space-y-2">
                <li>
                  <a href="/about" className="text-white hover:text-blue-200 transition-colors">About Us</a>
                </li>
                <li>
                  <a href="/contact" className="text-white hover:text-blue-200 transition-colors">Contact Us</a>
                </li>
                <li>
                  <a href="/allListings" className="text-white hover:text-blue-200 transition-colors">Safaris</a>
                </li>
                <li>
                  <a href="/careers" className="text-white hover:text-blue-200 transition-colors">Careers</a>
                </li>
                <li>
                  <a href="/maintenance" className="text-white hover:text-blue-200 transition-colors">Blogs</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-blue-200">Socials</h3>
              <div className="flex gap-4">
                <a href="#" className="text-white hover:text-blue-200 transition-colors">
                  <img src={instagramWhite} alt="Instagram" className="w-10 h-10" />
                </a>
                <a href="#" className="text-white hover:text-blue-200 transition-colors">
                  <img src={whatsappWhite} alt="WhatsApp" className="w-10 h-10" />
                </a>
                <a href="#" className="text-white hover:text-blue-200 transition-colors">
                  <img src={facebookWhite} alt="Facebook" className="w-10 h-10" />
                </a>
                <a href="#" className="text-white hover:text-blue-200 transition-colors">
                  <img src={twitterWhite} alt="Twitter" className="w-10 h-10" />
                </a>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-blue-200">
            © 2025 Safari Management. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

export default HomePage;