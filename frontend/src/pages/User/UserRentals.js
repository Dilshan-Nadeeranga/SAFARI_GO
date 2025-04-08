import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserRentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/LoginForm');
          return;
        }

        // Fetch user rentals
        const response = await axios.get('http://localhost:8070/vehicle-rentals/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setRentals(response.data);

        // Get all vehicle IDs from rentals
        const vehicleIds = [...new Set(response.data.map(rental => rental.vehicleId))];

        // Fetch vehicle details for each ID
        const vehicleData = {};
        for (const id of vehicleIds) {
          try {
            const vehicleResponse = await axios.get(`http://localhost:8070/vehicles/public/${id}`);
            vehicleData[id] = vehicleResponse.data;
          } catch (err) {
            console.error(`Error fetching vehicle with ID ${id}:`, err);
            vehicleData[id] = { type: 'Unknown Vehicle', images: [] };
          }
        }

        setVehicles(vehicleData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rentals:', err);
        setError('Failed to load your vehicle rentals. Please try again later.');
        setLoading(false);
      }
    };

    fetchRentals();
  }, [navigate]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">My Vehicle Rentals</h1>
      
      {rentals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">You have no vehicle rentals yet.</p>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => navigate('/vehicles')}
          >
            Browse Vehicles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {rentals.map((rental) => {
            const vehicle = vehicles[rental.vehicleId];
            return (
              <div key={rental._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 p-4">
                    {vehicle && vehicle.images && vehicle.images.length > 0 ? (
                      <img
                        src={`http://localhost:8070/${vehicle.images[0]}`}
                        alt={vehicle.type}
                        className="w-full h-40 object-cover rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/300x200?text=${vehicle?.type || 'Vehicle'}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="md:w-3/4 p-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold">{vehicle?.type || 'Unknown Vehicle'}</h2>
                        <p className="text-gray-600">License Plate: {vehicle?.licensePlate || 'N/A'}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(rental.status)}`}>
                          {rental.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Rental Period:</p>
                        <p className="font-medium">
                          {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Driver:</p>
                        <p className="font-medium">{rental.driverNeeded ? 'Included' : 'Self-drive'}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-t pt-4">
                      <div>
                        <p className="text-gray-600 text-sm">Total Amount:</p>
                        <p className="text-lg font-bold">Rs{rental.amount.toLocaleString()}</p>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex gap-3">
                        {rental.status === 'pending_payment' && (
                          <button
                            onClick={() => navigate('/vehicle-rental/payment', { state: { rental, vehicle } })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Complete Payment
                          </button>
                        )}
                        
                        {/* {(rental.status === 'pending_payment' || rental.status === 'confirmed') && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this rental?')) {
                                // Handle cancel logic
                              }
                            }}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        )} */}
                        
                        {/* <button
                          onClick={() => navigate(`/vehicle-rental/details/${rental._id}`)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          View Details
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserRentals;
