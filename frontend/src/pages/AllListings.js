import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import fallback images
import safari1 from "../Componets/assets/safari1.jpg";

const AllListings = () => {
  const [safaris, setSafaris] = useState([]);
  const [filteredSafaris, setFilteredSafaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

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
      const price = parseInt(priceFilter);
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
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="bg-blue-600 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-white text-2xl font-extrabold">SafariGo</a>
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-white hover:text-blue-200 transition-colors">Home</a>
            <a href="/explore-safaris" className="text-white hover:text-blue-200 transition-colors">Explore</a>
            <a href="/LoginForm" className="text-white hover:text-blue-200 transition-colors">Login</a>
            <a href="/RegistrationForm" className="text-white hover:text-blue-200 transition-colors">Register</a>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">All Safari Packages</h1>
          <p className="text-lg text-blue-100">Discover amazing safari adventures tailored for you</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
            Showing <span className="font-semibold">{filteredSafaris.length}</span> of{' '}
            <span className="font-semibold">{safaris.length}</span> safari packages
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
                  className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
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

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-200">© 2025 SafariGo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AllListings;

