import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Import fallback images
import safari1 from "../Componets/assets/safari1.jpg";
import safari2 from "../Componets/assets/safari2.jpg";
import safari3 from "../Componets/assets/safari3.jpg";

const Discover = () => {
  const [safaris, setSafaris] = useState([]);
  const [filteredSafaris, setFilteredSafaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [locations, setLocations] = useState([]);
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

  useEffect(() => {
    const fetchSafaris = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://localhost:8070/safaris', {
          params: { status: 'active' }
        });
        
        console.log('Fetched safaris:', response.data);
        
        if (!response.data || !Array.isArray(response.data)) {
          console.warn('Invalid response format:', response.data);
          setSafaris([]);
          setFilteredSafaris([]);
          setLoading(false);
          return;
        }
        
        // Process safaris
        const processedSafaris = response.data
          .filter((safari) => !safari.status || safari.status === 'active')
          .map((safari) => {
            // Handle images
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
        
        setSafaris(processedSafaris);
        setFilteredSafaris(processedSafaris);

        // Extract unique locations
        const uniqueLocations = [
          ...new Set(processedSafaris.map((safari) => safari.location).filter(Boolean))
        ];
        setLocations(uniqueLocations);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching safaris:', error);
        setError(error.response?.data?.error || error.message || "Error fetching safaris. Please try again later.");
        setSafaris([]);
        setFilteredSafaris([]);
        setLoading(false);
      }
    };

    fetchSafaris();
  }, []);

  // Apply filters whenever search term, location, or price changes
  useEffect(() => {
    let filtered = [...safaris];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(safari =>
        safari.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        safari.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        safari.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(safari =>
        safari.location?.toLowerCase() === locationFilter.toLowerCase()
      );
    }

    // Price filter
    if (priceFilter) {
      filtered = filtered.filter(safari => {
        if (priceFilter === 'low') {
          return safari.price < 10000;
        } else if (priceFilter === 'medium') {
          return safari.price >= 10000 && safari.price <= 15000;
        } else if (priceFilter === 'high') {
          return safari.price > 15000;
        }
        return true;
      });
    }

    setFilteredSafaris(filtered);
  }, [searchTerm, locationFilter, priceFilter, safaris]);

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

  const handleBookNow = (safari) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "user") {
      const proceed = window.confirm(
        "You need to log in as a user to book a safari. Do you want to proceed to the login page?"
      );
      if (proceed) {
        navigate("/LoginForm", { state: { safari, redirectTo: '/BookSafari' } });
      }
    } else {
      navigate("/BookSafari", { state: { safari } });
    }
  };

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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Discover Amazing Safaris</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
            Explore breathtaking wildlife experiences and discover the beauty of nature with our curated safari packages
          </p>
        </div>
      </div>

      {/* Featured Destinations */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Popular Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative h-64 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform">
            <img src={safari1} alt="Yala National Park" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Yala National Park</h3>
                <p className="text-blue-100">Home to leopards and diverse wildlife</p>
              </div>
            </div>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform">
            <img src={safari2} alt="Wilpattu National Park" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Wilpattu National Park</h3>
                <p className="text-blue-100">Ancient ruins and natural lakes</p>
              </div>
            </div>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform">
            <img src={safari3} alt="Udawalawe National Park" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Udawalawe National Park</h3>
                <p className="text-blue-100">Elephant watching paradise</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Your Perfect Safari</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search safaris..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="">All Prices</option>
                <option value="low">Below Rs. 10,000</option>
                <option value="medium">Rs. 10,000 - Rs. 15,000</option>
                <option value="high">Above Rs. 15,000</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLocationFilter('');
                  setPriceFilter('');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-700">
          <p className="text-lg">
            Showing <span className="font-semibold text-blue-600">{filteredSafaris.length}</span> of{' '}
            <span className="font-semibold text-blue-600">{safaris.length}</span> safari packages
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading safari packages...</p>
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

        {/* Safari Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSafaris.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="bg-white rounded-lg shadow-md p-8">
                  <p className="text-xl text-gray-600 mb-4">No safari packages found</p>
                  <p className="text-gray-500">
                    {searchTerm || locationFilter || priceFilter
                      ? 'Try adjusting your filters'
                      : 'No active safari packages available at the moment'}
                  </p>
                </div>
              </div>
            ) : (
              filteredSafaris.map((safari) => (
                <div
                  key={safari._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={safari.image}
                      alt={safari.title || 'Safari Package'}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleBookNow(safari)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = safari1;
                      }}
                    />
                    {safari.status === 'active' && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                      {safari.title || 'Safari Package'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {safari.location || 'Location not specified'}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-blue-600">
                        Rs. {safari.price ? safari.price.toLocaleString() : 'N/A'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {safari.duration || 'N/A'} hours
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {safari.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">
                        Capacity: {safari.capacity || 'N/A'} people
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, index) => (
                          <span
                            key={index}
                            className={index < (safari.buyerRating || safari.rating || 5) ? "text-yellow-400" : "text-gray-300"}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookNow(safari)}
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
      </div>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of travelers who have experienced unforgettable safari adventures with SafariGo
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
              View All Packages
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

export default Discover;

