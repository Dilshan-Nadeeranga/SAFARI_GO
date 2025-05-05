
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import safari1 from "../Componets/assets/safari1.jpg";
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
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-3xl font-extrabold tracking-tight">SafariGo</div>
          <nav className="hidden md:flex space-x-8">
            <a href="/UserHomepage" className="hover:text-blue-200 transition-colors font-medium">Home</a>
            <a href="/discover" className="hover:text-blue-200 transition-colors font-medium">Discover</a>
            <a href="/activities" className="hover:text-blue-200 transition-colors font-medium">Activities</a>
            <a href="/about" className="hover:text-blue-200 transition-colors font-medium">About</a>
            <a href="/contact" className="hover:text-blue-200 transition-colors font-medium">Contact</a>
            {premiumStatus?.isPremium && (
              <a href="/user/subscriptions" className="flex items-center hover:text-blue-200 transition-colors font-medium">
                <span className="text-yellow-300 mr-2">✨</span>
                Premium
                <span className="ml-2 bg-yellow-400 text-blue-900 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {premiumStatus.discountRate}% OFF
                </span>
              </a>
            )}
          </nav>
          <div className="relative group">
            <div className="flex items-center cursor-pointer">
              {user ? (
                <div className="flex items-center space-x-3">
                  {user.profilePicture ? (
                    <img
                      src={`http://localhost:8070/${user.profilePicture}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <img
                      src="/default-profile.png"
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                  )}
                  <span
                    className="text-white hover:text-blue-200 flex items-center font-medium"
                    onClick={() => navigate("/UserProfile")}
                  >
                    {user.name}
                    {premiumStatus?.isPremium && (
                      <span className="ml-2 bg-yellow-400 text-blue-900 text-xs px-2 py-0.5 rounded-full font-bold">
                        PREMIUM
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <a href="/UserProfile" className="text-white hover:text-blue-200 font-medium">User Profile</a>
              )}
            </div>
            {user && (
              <ul className="absolute right-0 hidden group-hover:block bg-white shadow-2xl rounded-lg mt-2 w-48 z-10">
                <li>
                  <a
                    href="/"
                    onClick={handleLogout}
                    className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    Logout
                  </a>
                </li>
                <li>
                  <a
                    href="/UserProfile"
                    className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    User Profile
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Beautiful Picture */}
      <section
        className="relative bg-cover bg-center h-[60vh] flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 text-center z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Embark on Your Safari Adventure
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Discover thrilling wildlife experiences and serene nature tours tailored just for you.
          </p>
          <button
            onClick={() => navigate('/user/safaris')}
            className="bg-yellow-400 text-blue-900 font-semibold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors"
          >
            Explore Tours
          </button>
        </div>
      </section>

      {/* Plan Your Trip Section */}
      <aside className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Plan Your Perfect Trip</h2>
        <div className="max-w-sm">
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
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
          <h2 className="text-3xl font-bold text-gray-800">Available Safari Tours</h2>
          <button
            onClick={() => navigate('/user/safaris')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            View All Tours
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingTours ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-600">Loading featured tours...</p>
            </div>
          ) : featuredTours.length > 0 ? (
            featuredTours.map((tour) => (
              <div 
                key={tour._id} 
                className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow"
              >
                {tour.images && tour.images.length > 0 ? (
                  <img
                    src={`http://localhost:8070/${tour.images[0]}`}
                    alt={tour.title}
                    className="w-full h-56 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = safari1;
                    }}
                  />
                ) : (
                  <img src={safari1} alt={tour.title} className="w-full h-56 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800">{tour.title}</h3>
                  <p className="text-gray-600 mt-3 line-clamp-3">
                    {tour.description ? tour.description : 'Explore this amazing safari experience!'}
                  </p>
                  <button 
                    className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    onClick={() => navigate('/BookSafari', { state: { safari: tour } })}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-600 mb-4">No featured tours available at the moment.</p>
              <button
                onClick={() => navigate('/user/safaris')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Browse All Tours
              </button>
            </div>
          )}
        </div>
      </section>
      
      {/* Featured Experiences */}
      <section className="container mx-auto px-4 py-12 bg-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Experiences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow">
            <img src={safari1} alt="Safari 1" className="w-full h-56 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">Mingo Safari</h3>
              <p className="text-gray-600 mt-3 line-clamp-3">
                Search destinations, select dates, and book your adventure with ease.
              </p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow">
            <img src={safari2} alt="Safari 2" className="w-full h-56 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">Wildlife Tour</h3>
              <p className="text-gray-600 mt-3 line-clamp-3">
                Explore wildlife in their natural habitat with expert guides.
              </p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow">
            <img src={safari3} alt="Safari 3" className="w-full h-56 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">Adventure Safari</h3>
              <p className="text-gray-600 mt-3 line-clamp-3">
                The ultimate adventure experience for thrill-seekers.
              </p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Transportation Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Need Transportation for Your Safari?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl">
              Browse our selection of high-quality safari vehicles with experienced drivers.
              From rugged jeeps to comfortable vans, we have the perfect transportation for your adventure.
            </p>
            <button
              onClick={navigateToExploreVehicles}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold"
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

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-blue-200 mb-4">SafariGo</h3>
              <p className="text-blue-100 leading-relaxed">
                We are dedicated to making safari bookings, exchange, and management easy. We connect
                travelers with trusted safari operators for a broader, free, and fair wildlife
                experience.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-200 mb-4">Links</h3>
              <ul className="space-y-3">
                <li><a href="/discover" className="text-blue-100 hover:text-blue-200 transition-colors">Discover</a></li>
                <li><a href="/about" className="text-blue-100 hover:text-blue-200 transition-colors">About Us</a></li>
                <li><a href="/blog" className="text-blue-100 hover:text-blue-200 transition-colors">Blog & Articles</a></li>
                <li><a href="/feedback" className="text-blue-100 hover:text-blue-200 transition-colors">Leave Feedback</a></li>
                <li><a href="/services" className="text-blue-100 hover:text-blue-200 transition-colors">Services</a></li>
                <li><a href="/community" className="text-blue-100 hover:text-blue-200 transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-200 mb-4">Contact</h3>
              <p className="text-blue-100">Address: No.02 Power Road, Colombo 03</p>
              <p className="text-blue-100">Phone: 0175-6207</p>
              <p className="text-blue-100">Email: safarigo@gmail.com</p>
            </div>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-blue-200">
            <p>© 2025 SafariGo. All rights reserved.</p>
            <div className="space-x-6 mt-4 md:mt-0">
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