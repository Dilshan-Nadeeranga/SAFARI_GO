// frontend/src/pages/UserHomepage.js
// Update Homepage
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { fetchUserProfile } from "../Api"; // Import the fetch function
import safari1 from "../Componets/assets/safari1.jpg"; // Adjusted path assuming "Componets" was a typo
import safari2 from "../Componets/assets/safari2.jpg";
import safari3 from "../Componets/assets/safari3.jpg";

const UserHomepage = () => {
  const [user, setUser] = useState(null);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const navigate = useNavigate();
  const [featuredTours, setFeaturedTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    console.log('Role in UserHomepage:', role);
    if (role !== 'user') {
      console.log('Redirecting to LoginForm because role is not user');
      navigate('/LoginForm');
      return;
    }
    
    // Fetch user profile and premium status
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        // Fetch user profile
        const profileRes = await axios.get("http://localhost:8070/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(profileRes.data);
        
        // Fetch premium status
        const premiumRes = await axios.get("http://localhost:8070/users/premium/status", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPremiumStatus(premiumRes.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      try {
        setLoadingTours(true);
        const response = await axios.get('http://localhost:8070/safaris?limit=3');
        setFeaturedTours(response.data);
        setLoadingTours(false);
      } catch (error) {
        console.error('Error fetching featured tours:', error);
        setLoadingTours(false);
      }
    };

    fetchFeaturedTours();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginForm");
  };

  const navigateToExploreVehicles = () => {
    navigate('/vehicles');
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">SafariGo</div>
          <nav className="hidden md:flex space-x-6">
            <a href="/UserHomepage" className="hover:text-blue-200 transition-colors">Home</a>
            <a href="/discover" className="hover:text-blue-200 transition-colors">Discover</a>
            <a href="/activities" className="hover:text-blue-200 transition-colors">Activities</a>
            <a href="/about" className="hover:text-blue-200 transition-colors">About</a>
            <a href="/contact" className="hover:text-blue-200 transition-colors">Contact</a>
            {premiumStatus?.isPremium && (
              <a href="/user/subscriptions" className="flex items-center hover:text-blue-200 transition-colors">
                <span className="text-yellow-300 mr-1">✨</span>
                <span className="mr-1">Premium</span>
                <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  {premiumStatus.discountRate}% OFF
                </span>
              </a>
            )}
          </nav>
          <div className="relative group">
            <div className="flex items-center cursor-pointer">
              {user ? (
                <div className="flex items-center space-x-2">
                  {user.profilePicture ? (
                    <img
                      src={`http://localhost:8070/${user.profilePicture}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <img
                      src="/default-profile.png" // Ensure this exists in public folder
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span
                    className="text-white hover:text-blue-200 flex items-center"
                    onClick={() => navigate("/UserProfile")}
                  >
                    {user.name}
                    {premiumStatus?.isPremium && (
                      <span className="ml-2 bg-yellow-300 text-blue-800 text-xs px-1.5 py-0.5 rounded-full font-bold">
                        PREMIUM
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <a href="/UserProfile" className="text-white hover:text-blue-200">User Profile</a>
              )}
            </div>
            {user && (
              <ul className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-md mt-2 z-10">
                <li>
                  <a
                    href="/"
                    onClick={handleLogout}
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                  >
                    Logout
                  </a>
                </li>
                <li>
                  <a
                    href="/UserProfile"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                  >
                    User Profile
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-100 py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Plan Your Safari Adventure
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search for safari destinations, select your dates. Whether you're looking for a
            thrilling wildlife experience or a peaceful nature tour, we've got you covered!
          </p>
        </div>
      </section>

      {/* Plan Your Trip Section */}
      <aside className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Plan Your Trip</h2>
        <div className="max-w-xs">
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option>Date</option>
            <option>Price Low To High</option>
            <option>Price High To Low</option>
            <option>Name (A-Z)</option>
          </select>
        </div>
      </aside>

      {/* Safari Listings */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Available Safari Tours</h2>
          <button
            onClick={() => navigate('/user/safaris')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Tours
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loadingTours ? (
            <div className="col-span-3 text-center py-10">
              <p>Loading featured tours...</p>
            </div>
          ) : featuredTours.length > 0 ? (
            featuredTours.map((tour) => (
              <div 
                key={tour._id} 
                className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform"
              >
                {tour.images && tour.images.length > 0 ? (
                  <img
                    src={`http://localhost:8070/${tour.images[0]}`}
                    alt={tour.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = safari1; // fallback image
                    }}
                  />
                ) : (
                  <img src={safari1} alt={tour.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800">{tour.title}</h3>
                  <p className="text-gray-600 mt-2">
                    {tour.description ? `${tour.description.substring(0, 100)}...` : 'Explore this amazing safari experience!'}
                  </p>
                  <button 
                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => navigate('/BookSafari', { state: { safari: tour } })}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p>No featured tours available at the moment.</p>
              <button
                onClick={() => navigate('/user/safaris')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse All Tours
              </button>
            </div>
          )}
        </div>
      </section>
      
      {/* If the original file had hardcoded examples, here they are properly formatted */}
      <section className="container mx-auto px-4 py-10 bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured Experiences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform">
            <img src={safari1} alt="Safari 1" className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">Mingo Safari</h3>
              <p className="text-gray-600 mt-2">
                Search destinations, select dates, and book your adventure with ease.
              </p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform">
            <img src={safari2} alt="Safari 2" className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">Wildlife Tour</h3>
              <p className="text-gray-600 mt-2">
                Explore wildlife in their natural habitat with expert guides.
              </p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform">
            <img src={safari3} alt="Safari 3" className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">Adventure Safari</h3>
              <p className="text-gray-600 mt-2">
                The ultimate adventure experience for thrill-seekers.
              </p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 bg-gray-50">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Need Transportation for Your Safari?</h2>
            <p className="text-gray-600 mb-6">
              Browse our selection of high-quality safari vehicles with experienced drivers.
              From rugged jeeps to comfortable vans, we have the perfect transportation for your adventure.
            </p>
            <button
              onClick={navigateToExploreVehicles}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0018 5h-1V4a1 1 0 00-1-1H3z" />
              </svg>
              Explore Vehicles
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <button
          onClick={navigateToExploreVehicles}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0018 5h-1V4a1 1 0 00-1-1H3z" />
          </svg>
          Explore Vehicles
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-200 mb-4">SafariGo</h3>
              <p className="text-blue-100">
                We are dedicated to making safari bookings, exchange, and management easy. We connect
                travelers with trusted safari operators for a broader, free, and fair wildlife
                experience.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-200 mb-4">Links</h3>
              <ul className="space-y-2">
                <li><a href="/discover" className="text-blue-100 hover:text-blue-200 transition-colors">Discover</a></li>
                <li><a href="/about" className="text-blue-100 hover:text-blue-200 transition-colors">About Us</a></li>
                <li><a href="/blog" className="text-blue-100 hover:text-blue-200 transition-colors">Blog & Articles</a></li>
                <li><a href="/feedback" className="text-blue-100 hover:text-blue-200 transition-colors">Leave Feedback</a></li>
                <li><a href="/services" className="text-blue-100 hover:text-blue-200 transition-colors">Services</a></li>
                <li><a href="/community" className="text-blue-100 hover:text-blue-200 transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-200 mb-4">Contact</h3>
              <p className="text-blue-100">Address: No.02 Power Road, Colombo 03</p>
              <p className="text-blue-100">Phone: 0175-6207</p>
              <p className="text-blue-100">Email: safarigo@gmail.com</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-blue-200">
            <p>© 2023 SafariGo. All rights reserved.</p>
            <div className="space-x-4 mt-4 md:mt-0">
              <a href="/terms" className="hover:text-blue-100 transition-colors">Terms and Conditions</a>
              <a href="/privacy" className="hover:text-blue-100 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserHomepage;