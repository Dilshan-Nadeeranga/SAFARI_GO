import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import safari1 from "../Componets/assets/safari1.jpg";
import safari2 from "../Componets/assets/safari2.jpg";
import safari3 from "../Componets/assets/safari3.jpg";
import safariVideo from "../Componets/assets/safari-video.mp4";

const UserHomepage = () => {
  const [user, setUser] = useState(null);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [featuredTours, setFeaturedTours] = useState([]);
  const [displayedTours, setDisplayedTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [filterOption, setFilterOption] = useState("Date");

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'user') {
      navigate('/LoginForm');
      return;
    }
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const profileRes = await axios.get("http://localhost:8070/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(profileRes.data);
        
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
        const activeTours = response.data.filter(tour => tour.status === 'active');
        setFeaturedTours(activeTours);
        setDisplayedTours(activeTours);
        setLoadingTours(false);
      } catch (error) {
        console.error('Error fetching featured tours:', error);
        setLoadingTours(false);
      }
    };

    fetchFeaturedTours();
  }, []);

  useEffect(() => {
    if (featuredTours.length === 0) return;
    
    let sortedTours = [...featuredTours];
    
    switch (filterOption) {
      case "Date":
        sortedTours.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "Price Low To High":
        sortedTours.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "Price High To Low":
        sortedTours.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "Name (A-Z)":
        sortedTours.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      default:
        break;
    }
    
    setDisplayedTours(sortedTours);
  }, [filterOption, featuredTours]);

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginForm");
  };

  const navigateToExploreVehicles = () => {
    navigate('/vehicles');
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-3xl font-extrabold tracking-tight">SafariGo</div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="/UserHomepage" className="text-lg hover:text-blue-200 transition-colors duration-200">Home</a>
            <a href="/discover" className="text-lg hover:text-blue-200 transition-colors duration-200">Discover</a>
            <a href="/activities" className="text-lg hover:text-blue-200 transition-colors duration-200">Activities</a>
            <a href="/about" className="text-lg hover:text-blue-200 transition-colors duration-200">About</a>
            <a href="/contact" className="text-lg hover:text-blue-200 transition-colors duration-200">Contact</a>
            {premiumStatus?.isPremium && (
              <a href="/user/subscriptions" className="flex items-center text-lg hover:text-blue-200 transition-colors duration-200">
                <span className="text-yellow-300 mr-2">✨</span>
                Premium <span className="ml-2 bg-white text-blue-600 text-xs px-2 py-1 rounded-full">{premiumStatus.discountRate}%</span>
              </a>
            )}
          </nav>

          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>

          <div className="relative group">
            <div className="flex items-center cursor-pointer">
              {user ? (
                <div className="flex items-center space-x-3">
                  {user.profilePicture ? (
                    <img
                      src={`http://localhost:8070/${user.profilePicture}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <img
                      src="/default-profile.png"
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  )}
                  <span
                    className="text-lg font-medium hover:text-blue-200 transition-colors duration-200"
                    onClick={() => navigate("/UserProfile")}
                  >
                    {user.name}
                    {premiumStatus?.isPremium && (
                      <span className="ml-2 bg-yellow-300 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">PREMIUM</span>
                    )}
                  </span>
                </div>
              ) : (
                <a href="/UserProfile" className="text-lg hover:text-blue-200 transition-colors duration-200">User Profile</a>
              )}
            </div>
            {user && (
              <ul className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-lg mt-2 z-10 w-48">
                <li>
                  <a
                    href="/UserProfile"
                    className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    User Profile
                  </a>
                </li>
                <li>
                  <a
                    href="/"
                    onClick={handleLogout}
                    className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden bg-blue-600 text-white px-4 py-4">
            <a href="/UserHomepage" className="block py-2 text-lg hover:text-blue-200 transition-colors">Home</a>
            <a href="/discover" className="block py-2 text-lg hover:text-blue-200 transition-colors">Discover</a>
            <a href="/activities" className="block py-2 text-lg hover:text-blue-200 transition-colors">Activities</a>
            <a href="/about" className="block py-2 text-lg hover:text-blue-200 transition-colors">About</a>
            <a href="/contact" className="block py-2 text-lg hover:text-blue-200 transition-colors">Contact</a>
            {premiumStatus?.isPremium && (
              <a href="/user/subscriptions" className="block py-2 text-lg hover:text-blue-200 transition-colors flex items-center">
                <span className="text-yellow-300 mr-2">✨</span>
                Premium <span className="ml-2 bg-white text-blue-600 text-xs px-2 py-1 rounded-full">{premiumStatus.discountRate}%</span>
              </a>
            )}
          </nav>
        )}
      </header>

      {/* Hero Section with Background Video */}
      <section className="relative h-[70vh] text-white flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={safari1}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src={safariVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="container mx-auto px-4 relative z-20 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in">
            Your Safari Adventure Awaits
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 animate-fade-in-delay">
            Discover thrilling wildlife experiences and serene nature tours with SafariGo.
          </p>
          <button
            onClick={() => navigate('/user/safaris')}
            className="bg-yellow-400 text-blue-800 font-bold py-3 px-8 rounded-full hover:bg-yellow-300 transition-colors duration-300 shadow-lg"
          >
            Explore Tours Now
          </button>
        </div>
      </section>

      {/* Plan Your Trip Section */}
      <aside className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Plan Your Safari</h2>
        <div className="max-w-sm">
          <select 
            className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 transition-colors duration-200"
            value={filterOption}
            onChange={handleFilterChange}
          >
            <option>Date</option>
            <option>Price Low To High</option>
            <option>Price High To Low</option>
            <option>Name (A-Z)</option>
          </select>
        </div>
      </aside>

      {/* Safari Listings */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Featured Safari Tours</h2>
          <button
            onClick={() => navigate('/user/safaris')}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            View All Tours
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingTours ? (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-gray-600 animate-pulse">Loading featured tours...</p>
            </div>
          ) : displayedTours.length > 0 ? (
            displayedTours.map((tour) => (
              <div 
                key={tour._id} 
                className="bg-white shadow-xl rounded-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300"
              >
                {tour.images && tour.images.length > 0 ? (
                  <img
                    src={`http://localhost:8070/${tour.images[0]}`}
                    alt={tour.title}
                    className="w-full h-56 object-cover transform hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = safari1;
                    }}
                  />
                ) : (
                  <img src={safari1} alt={tour.title} className="w-full h-56 object-cover transform hover:scale-105 transition-transform duration-500" />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{tour.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {tour.description ? `${tour.description.substring(0, 100)}...` : 'Explore this amazing safari experience!'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      Rs. {tour.price ? tour.price.toLocaleString() : 'Contact for price'}
                    </span>
                    <button 
                      className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                      onClick={() => navigate('/BookSafari', { state: { safari: tour } })}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-gray-600 mb-4">No featured tours available at the moment.</p>
              <button
                onClick={() => navigate('/user/safaris')}
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Browse All Tours
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="container mx-auto px-4 py-12 bg-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Explore Our Experiences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
            <img src={safari1} alt="Mingo Safari" className="w-full h-56 object-cover transform hover:scale-105 transition-transform duration-500" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Mingo Safari</h3>
              <p className="text-gray-600 mb-4">
                Discover exotic wildlife with our guided Mingo Safari adventure.
              </p>
              <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-xl rounded-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
            <img src={safari2} alt="Wildlife Tour" className="w-full h-56 object-cover transform hover:scale-105 transition-transform duration-500" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Wildlife Tour</h3>
              <p className="text-gray-600 mb-4">
                Experience nature up close with expert guides and stunning views.
              </p>
              <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-xl rounded-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
            <img src={safari3} alt="Adventure Safari" className="w-full h-56 object-cover transform hover:scale-105 transition-transform duration-500" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Adventure Safari</h3>
              <p className="text-gray-600 mb-4">
                Thrilling adventures for those seeking an adrenaline rush.
              </p>
              <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Need Transportation Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-xl rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Need Transportation?</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Explore our fleet of safari vehicles, from rugged jeeps to luxury vans, all driven by experienced professionals.
          </p>
          <button
            onClick={navigateToExploreVehicles}
            className="bg-green-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-green-700 transition-colors duration-300 flex items-center gap-2 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0018 5h-1V4a1 1 0 00-1-1H3z" />
            </svg>
            Explore Vehicles
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-blue-200 mb-4">SafariGo</h3>
              <p className="text-gray-300 leading-relaxed">
                Connecting travelers with trusted safari operators for unforgettable wildlife experiences.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-200 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="/discover" className="text-gray-300 hover:text-blue-200 transition-colors duration-200">Discover</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-blue-200 transition-colors duration-200">About Us</a></li>
                <li><a href="/blog" className="text-gray-300 hover:text-blue-200 transition-colors duration-200">Blog & Articles</a></li>
                <li><a href="/feedback" className="text-gray-300 hover:text-blue-200 transition-colors duration-200">Leave Feedback</a></li>
                <li><a href="/services" className="text-gray-300 hover:text-blue-200 transition-colors duration-200">Services</a></li>
                <li><a href="/community" className="text-gray-300 hover:text-blue-200 transition-colors duration-200">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-200 mb-4">Contact</h3>
              <p className="text-gray-300 mb-2">Address: No.02 Power Road, Colombo 03</p>
              <p className="text-gray-300 mb-2">Phone: 0175-6207</p>
              <p className="text-gray-300">Email: safarigo@gmail.com</p>
            </div>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>© 2025 SafariGo. All rights reserved.</p>
            <div className="space-x-6 mt-4 md:mt-0">
              <a href="/terms" className="hover:text-blue-200 transition-colors duration-200">Terms and Conditions</a>
              <a href="/privacy" className="hover:text-blue-200 transition-colors duration-200">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserHomepage;