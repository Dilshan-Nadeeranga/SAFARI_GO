import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PublicSafaris = () => {
  const [safaris, setSafaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveSafaris = async () => {
      try {
        const response = await axios.get('http://localhost:8070/safaris');
        // Only display active safaris
        const activeSafaris = response.data.filter(safari => safari.status === 'active');
        setSafaris(activeSafaris);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching safaris:', err);
        setError('Failed to load safari packages');
        setLoading(false);
      }
    };

    fetchActiveSafaris();
  }, []);

  const handleBookNow = (safari) => {
    // Check if user is logged in
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

  // Filter safaris based on search input
  const filteredSafaris = safaris.filter(safari => 
    safari.title?.toLowerCase().includes(filter.toLowerCase()) || 
    safari.location?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading safaris...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Simple Navigation */}
      <nav className="bg-blue-600 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-white text-2xl font-extrabold">LOGO</a>
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-white hover:text-blue-200 transition-colors">Home</a>
            <a href="/LoginForm" className="text-white hover:text-blue-200 transition-colors">Login</a>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Explore Safari Packages</h1>
          <input
            type="text"
            placeholder="Search by title or location"
            className="px-4 py-2 border rounded-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        {filteredSafaris.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No safari packages found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSafaris.map((safari) => (
              <div key={safari._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {safari.images && safari.images.length > 0 ? (
                  <img
                    src={`http://localhost:8070/${safari.images[0]}`}
                    alt={safari.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Safari';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{safari.title}</h2>
                  <p className="text-gray-600 mb-3">{safari.location}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-blue-600">Rs. {safari.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">{safari.duration} hours</span>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">{safari.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Max capacity: {safari.capacity} people</span>
                    <button 
                      onClick={() => handleBookNow(safari)} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicSafaris;
