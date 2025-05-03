import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AllVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null); // Added for debugging

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        console.log('Fetching vehicles from:', 'http://localhost:8070/vehicles/public');
        
        // Add timeout to ensure request doesn't hang
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // Make the API call
        const response = await axios.get('http://localhost:8070/vehicles/public', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Response received:', response.data);
        
        // Save the response for debugging
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          dataLength: Array.isArray(response.data) ? response.data.length : 0
        });
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} vehicles in response`);
          setVehicles(response.data);
          setFilteredVehicles(response.data);
          
          // Extract unique vehicle types for filtering
          const types = [...new Set(response.data.map(vehicle => vehicle.type))];
          setVehicleTypes(types);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Received invalid data format from server');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        
        // More detailed error message based on error type
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check your network connection and try again.');
        } else if (err.response) {
          setError(`Server error (${err.response.status}): ${err.response.data.message || 'Unknown error'}`);
        } else if (err.request) {
          setError('Could not reach the server. Please check your network connection.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // Filter vehicles based on search term and vehicle type
  useEffect(() => {
    let result = vehicles;
    
    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(vehicle => vehicle.type === filterType);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        vehicle => 
          vehicle.type.toLowerCase().includes(term) ||
          vehicle.features.some(feature => feature.toLowerCase().includes(term)) ||
          (vehicle.ownerName && vehicle.ownerName.toLowerCase().includes(term))
      );
    }
    
    setFilteredVehicles(result);
  }, [searchTerm, filterType, vehicles]);

  // Function to get vehicle image or placeholder
  const getVehicleImage = (vehicle) => {
    if (vehicle.images && vehicle.images.length > 0) {
      return `http://localhost:8070/${vehicle.images[0]}`;
    }
    return `https://via.placeholder.com/300x200?text=${encodeURIComponent(vehicle.type)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Explore Vehicles</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>

      

        {/* Search and filter options */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Vehicles</label>
              <input
                type="text"
                id="search"
                placeholder="Search by type, features, etc."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
              <select
                id="type-filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-red-600 mb-4">⚠️ Error</div>
            <p className="text-xl font-semibold text-red-600">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-xl text-gray-600">No vehicles match your search criteria.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-gray-600">Showing {filteredVehicles.length} vehicle(s)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map(vehicle => (
                <div key={vehicle._id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <img 
                      src={getVehicleImage(vehicle)} 
                      alt={vehicle.type}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(vehicle.type)}`;
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-xl font-bold text-white">{vehicle.type}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Capacity: {vehicle.capacity}</span>
                      </div>
                      <span className="text-sm text-gray-600">{vehicle.licensePlate}</span>
                    </div>
                    
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {vehicle.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                          {vehicle.features.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              +{vehicle.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {vehicle.ownerName && <span>By {vehicle.ownerName}</span>}
                      </div>
                      <button
                        onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllVehicles;
