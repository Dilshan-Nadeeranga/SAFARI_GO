// frontend/src/pages/UserHomepage.js.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../Api"; // Import the fetch function
import safari1 from "../Componets/assets/safari1.jpg"; // Adjusted path assuming "Componets" was a typo
import safari2 from "../Componets/assets/safari2.jpg";

const UserHomepage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    console.log('Role in UserHomepage:', role);
    if (role !== 'user') {
      console.log('Redirecting to LoginForm because role is not user');
      navigate('/LoginForm');
    }
    // Uncomment and implement fetchUserProfile if needed
    // fetchUserProfile().then((data) => setUser(data)).catch((err) => console.error(err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginForm");
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
                    className="text-white hover:text-blue-200"
                    onClick={() => navigate("/UserProfile")}
                  >
                    {user.name}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform">
            <img
              src={safari1} //image 
              alt="Safari 1"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">Mingo Safari</h3>
              <p className="text-gray-600 mt-2">
                Search destinations, select dates, and book your adventure with ease.
              </p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Book Now
              </button>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform">
            <img
              src={safari2}
              alt="Safari 2"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">Wildlife Tour</h3>
              <p className="text-gray-600 mt-2">
                Experience the thrill of wildlife in their natural habitat.
              </p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
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