import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Import fallback images
import safari1 from "../Componets/assets/safari1.jpg";
import safari2 from "../Componets/assets/safari2.jpg";
import safari3 from "../Componets/assets/safari3.jpg";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user data
  useEffect(() => {
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
  }, []);

  // Fetch activities (safaris)
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://localhost:8070/safaris', {
          params: { status: 'active' }
        });
        
        if (!response.data || !Array.isArray(response.data)) {
          setActivities([]);
          setLoading(false);
          return;
        }
        
        const processedActivities = response.data
          .filter((safari) => !safari.status || safari.status === 'active')
          .map((safari) => {
            let imageUrl = safari1;
            if (safari.images && Array.isArray(safari.images) && safari.images.length > 0) {
              const imagePath = safari.images[0];
              imageUrl = imagePath.startsWith('http') 
                ? imagePath 
                : `http://localhost:8070/${imagePath.replace(/^\/+/, '')}`;
            }
            
            return {
              ...safari,
              image: imageUrl,
            };
          });
        
        setActivities(processedActivities);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error.response?.data?.error || error.message || "Error fetching activities. Please try again later.");
        setActivities([]);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setProfileDropdownOpen(false);
    navigate("/LoginForm");
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    setProfileDropdownOpen(false);
    navigate("/UserProfile");
  };

  const handleBookNow = (activity) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "user") {
      const proceed = window.confirm(
        "You need to log in as a user to book an activity. Do you want to proceed to the login page?"
      );
      if (proceed) {
        navigate("/LoginForm", { state: { safari: activity, redirectTo: '/BookSafari' } });
      }
    } else {
      navigate("/BookSafari", { state: { safari: activity } });
    }
  };

  // Sample activity categories
  const activityCategories = [
    {
      id: 1,
      title: "Wildlife Safari",
      description: "Experience close encounters with wild animals in their natural habitat",
      icon: "🦁",
      image: safari1
    },
    {
      id: 2,
      title: "Bird Watching",
      description: "Discover diverse bird species in beautiful natural settings",
      icon: "🦅",
      image: safari2
    },
    {
      id: 3,
      title: "Nature Photography",
      description: "Capture stunning landscapes and wildlife moments",
      icon: "📸",
      image: safari3
    },
    {
      id: 4,
      title: "Adventure Tours",
      description: "Thrilling experiences for the adventurous soul",
      icon: "⛰️",
      image: safari1
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-3xl font-extrabold tracking-tight">SafariGo</div>
          
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => navigate("/UserHomepage")} className="text-lg hover:text-blue-200 transition-colors duration-200">Home</button>
            <button onClick={() => navigate("/discover")} className="text-lg hover:text-blue-200 transition-colors duration-200">Discover</button>
            <button onClick={() => navigate("/activities")} className="text-lg hover:text-blue-200 transition-colors duration-200">Activities</button>
            <button onClick={() => navigate("/about")} className="text-lg hover:text-blue-200 transition-colors duration-200">About</button>
            <button onClick={() => navigate("/contact")} className="text-lg hover:text-blue-200 transition-colors duration-200">Contact</button>
            {premiumStatus?.isPremium && (
              <button onClick={() => navigate("/user/subscriptions")} className="flex items-center text-lg hover:text-blue-200 transition-colors duration-200">
                <span className="text-yellow-300 mr-2">✨</span>
                Premium <span className="ml-2 bg-white text-blue-600 text-xs px-2 py-1 rounded-full">{premiumStatus.discountRate}%</span>
              </button>
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

          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
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
                  <span className="text-lg font-medium hover:text-blue-200 transition-colors duration-200">
                    {user.name || 'User'}
                    {premiumStatus?.isPremium && (
                      <span className="ml-2 bg-yellow-300 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">PREMIUM</span>
                    )}
                  </span>
                  <svg 
                    className={`w-4 h-4 ml-1 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              ) : (
                <Link to="/LoginForm" className="text-lg hover:text-blue-200 transition-colors duration-200">Login</Link>
              )}
            </div>
            {user && profileDropdownOpen && (
              <ul className="absolute right-0 bg-white shadow-lg rounded-lg mt-2 z-50 w-48 border border-gray-200">
                <li>
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    User Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden bg-blue-600 text-white px-4 py-4">
            <button onClick={() => { navigate("/UserHomepage"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-lg hover:text-blue-200 transition-colors">Home</button>
            <button onClick={() => { navigate("/discover"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-lg hover:text-blue-200 transition-colors">Discover</button>
            <button onClick={() => { navigate("/activities"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-lg hover:text-blue-200 transition-colors">Activities</button>
            <button onClick={() => { navigate("/about"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-lg hover:text-blue-200 transition-colors">About</button>
            <button onClick={() => { navigate("/contact"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-lg hover:text-blue-200 transition-colors">Contact</button>
            {premiumStatus?.isPremium && (
              <button onClick={() => { navigate("/user/subscriptions"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-lg hover:text-blue-200 transition-colors flex items-center">
                <span className="text-yellow-300 mr-2">✨</span>
                Premium <span className="ml-2 bg-white text-blue-600 text-xs px-2 py-1 rounded-full">{premiumStatus.discountRate}%</span>
              </button>
            )}
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Safari Activities</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Explore exciting activities and experiences for your next safari adventure
          </p>
        </div>
      </section>

      {/* Activity Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Activity Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {activityCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => navigate("/allListings")}
            >
              <div className="relative h-48">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4 text-white w-full">
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <h3 className="text-xl font-bold">{category.title}</h3>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Available Activities */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Available Activities</h2>
          <button
            onClick={() => navigate("/allListings")}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            View All
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading activities...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg inline-block">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Activities Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activities.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="bg-white rounded-lg shadow-md p-8">
                  <p className="text-xl text-gray-600 mb-4">No activities available at the moment</p>
                  <p className="text-gray-500">Check back later for new safari activities</p>
                </div>
              </div>
            ) : (
              activities.slice(0, 8).map((activity) => (
                <div
                  key={activity._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={activity.image}
                      alt={activity.title || 'Activity'}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleBookNow(activity)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = safari1;
                      }}
                    />
                    {activity.status === 'active' && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                      {activity.title || 'Safari Activity'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {activity.location || 'Location not specified'}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-blue-600">
                        Rs. {activity.price ? activity.price.toLocaleString() : 'N/A'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {activity.duration || 'N/A'} hours
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {activity.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">
                        Capacity: {activity.capacity || 'N/A'} people
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, index) => (
                          <span
                            key={index}
                            className={index < (activity.buyerRating || activity.rating || 5) ? "text-yellow-400" : "text-gray-300"}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookNow(activity)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of travelers who have experienced unforgettable safari activities with SafariGo
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/RegistrationForm')}
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate('/allListings')}
              className="bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-400 transition-colors border-2 border-white"
            >
              View All Activities
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 SafariGo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Activities;

