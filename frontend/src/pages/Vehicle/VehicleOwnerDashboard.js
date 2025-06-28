import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditVehicleModal from './EditVehicleModal';

const VehicleOwnerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({
    monthlyEarnings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState('cards');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ show: false, type: '', vehicle: null });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'vehicle_owner') {
      navigate('/LoginForm');
      return;
    }
    
    const fetchVehicleOwnerData = async () => {
      try {
        console.log("Fetching vehicle owner data with token:", token.substring(0, 20) + "...");
        
        const profileResponse = await axios.get('http://localhost:8070/users/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Profile data received:", profileResponse.data);
        setProfile(profileResponse.data);
        
        try {
          const vehiclesResponse = await axios.get('http://localhost:8070/vehicles', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setVehicles(vehiclesResponse.data);
        } catch (vehicleError) {
          console.warn("Could not fetch vehicles:", vehicleError);
          setVehicles([]);
        }
        
        const monthlyData = generateMonthlyDataPlaceholder();
        
        setStats({
          monthlyEarnings: monthlyData
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vehicle owner data:', err);
        
        if (err.response?.status === 404) {
          setError('Your profile could not be found. Please contact support.');
        } else if (err.response?.status === 401) {
          setError('Your session has expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setTimeout(() => navigate('/LoginForm'), 2000);
        } else {
          setError('Failed to load dashboard data. Please try refreshing the page.');
        }
        
        setLoading(false);
      }
    };
    
    const generateMonthlyDataPlaceholder = () => {
      return Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthName = month.toLocaleString('default', { month: 'short' });
        const year = month.getFullYear();
        return { name: `${monthName} ${year}`, earnings: 0 };
      }).reverse();
    };
    
    fetchVehicleOwnerData();
  }, [navigate, refreshTrigger]);

  useEffect(() => {
    const handleFocus = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/LoginForm');
  };

  const getVehicleImage = (vehicle) => {
    if (vehicle.images && vehicle.images.length > 0) {
      return `http://localhost:8070/${vehicle.images[0]}`;
    }
    return `https://via.placeholder.com/300x200?text=${encodeURIComponent(vehicle.type)}`;
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleVehicleUpdate = (updatedVehicle) => {
    setVehicles(vehicles.map(v => v._id === updatedVehicle._id ? updatedVehicle : v));
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  };

  const openDeleteConfirmation = (vehicle) => {
    setConfirmAction({
      show: true,
      type: 'delete',
      vehicle
    });
  };

  const handleDeleteVehicle = async () => {
    if (!confirmAction.vehicle) return;
    
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting vehicle with ID:', confirmAction.vehicle._id);
      
      const response = await axios.delete(
        `http://localhost:8070/vehicles/${confirmAction.vehicle._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        setVehicles(vehicle => vehicles.filter(v => v._id !== confirmAction.vehicle._id));
        setConfirmAction({ show: false, type: '', vehicle: null });
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           `Failed to delete vehicle (${error.response?.status || 'unknown error'})`;
      
      alert(errorMessage);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4 gap-4">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span className="text-lg">🏠</span> Home
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
        >
          <span className="text-lg">🚪</span> Logout
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vehicle Owner Dashboard</h1>
          <p className="text-gray-600">
            {profile?.companyName ? `${profile.name} (${profile.companyName})` : profile?.name}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => navigate('/AddVehicle')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Add New Vehicle
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My Vehicles</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Cards View
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Table View
            </button>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-gray-500">No vehicles registered yet.</p>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.licensePlate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.currentBookingId ? `Booking #${vehicle.currentBookingId.substring(0, 8)}` : 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewVehicle(vehicle)} 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEditVehicle(vehicle)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => openDeleteConfirmation(vehicle)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={getVehicleImage(vehicle)} 
                    alt={`${vehicle.type} - ${vehicle.licensePlate}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(vehicle.type)}`;
                    }}
                  />
                  {vehicle.images && vehicle.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                      +{vehicle.images.length - 1} more
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{vehicle.type}</h3>
                    <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <span className="mr-2">Capacity: {vehicle.capacity}</span>
                    {vehicle.currentBookingId ? (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Booked</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Available</span>
                    )}
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
                  <div className="flex justify-end space-x-2 mt-3">
                    <button 
                      onClick={() => handleViewVehicle(vehicle)} 
                      className="text-blue-600 hover:text-blue-900 text-sm mr-3"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEditVehicle(vehicle)} 
                      className="text-indigo-600 hover:text-indigo-900 text-sm mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => openDeleteConfirmation(vehicle)} 
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">Vehicle Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {selectedVehicle && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">Vehicle Information</h3>
                    <p className="mb-2"><span className="font-semibold">Type:</span> {selectedVehicle.type}</p>
                    <p className="mb-2"><span className="font-semibold">License Plate:</span> {selectedVehicle.licensePlate}</p>
                    <p className="mb-2"><span className="font-semibold">Capacity:</span> {selectedVehicle.capacity} passengers</p>
                    {/*<p className="mb-2"><span className="font-semibold">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full 
                        ${selectedVehicle.status === 'active' ? 'bg-green-100 text-green-800' : 
                          selectedVehicle.status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {selectedVehicle.status}
                      </span>
                    </p>*/}
                    <p className="mb-2"><span className="font-semibold">Features:</span> {selectedVehicle.features?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">Owner Information</h3>
                    <p className="mb-2"><span className="font-semibold">Owner Name:</span> {selectedVehicle.ownerName}</p>
                    <p className="mb-2"><span className="font-semibold">Contact Number:</span> {selectedVehicle.contactNumber}</p>
                  </div>
                </div>
                
                {selectedVehicle.images && selectedVehicle.images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">Vehicle Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedVehicle.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={`http://localhost:8070/${image}`} 
                            alt={`Vehicle ${index + 1}`}
                            className="w-full h-40 object-cover rounded-md"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(selectedVehicle.type)}`;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">Documents</h3>
                  <div className="flex flex-col space-y-3">
                    {selectedVehicle.licenseDoc ? (
                      <a 
                        href={`http://localhost:8070/${selectedVehicle.licenseDoc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View License Document
                      </a>
                    ) : (
                      <p className="text-gray-500">No license document available</p>
                    )}
                    
                    {selectedVehicle.insuranceDoc ? (
                      <a 
                        href={`http://localhost:8070/${selectedVehicle.insuranceDoc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Insurance Document
                      </a>
                    ) : (
                      <p className="text-gray-500">No insurance document available</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <EditVehicleModal
          vehicle={selectedVehicle}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleVehicleUpdate}
        />
      )}

      {confirmAction.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {confirmAction.type === 'delete' ? 'Confirm Vehicle Removal' : 'Confirmation'}
            </h3>
            
            <p className="mb-6">
              {confirmAction.type === 'delete' && `Are you sure you want to remove ${confirmAction.vehicle?.type} (${confirmAction.vehicle?.licensePlate})? This action cannot be undone.`}
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction({ show: false, type: '', vehicle: null })}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              
              {confirmAction.type === 'delete' && (
                <button
                  onClick={handleDeleteVehicle}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Yes, Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleOwnerDashboard;