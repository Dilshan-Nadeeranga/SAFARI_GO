import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';
import EditVehicleModal from '../../Vehicle/EditVehicleModal';
import { generateVehiclePdf } from '../../../utils/VehiclePdfGenerator';

const AdminVehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleOwners, setVehicleOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ show: false, type: '', vehicle: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const vehiclesResponse = await axios.get('http://localhost:8070/vehicles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("Fetched vehicles:", vehiclesResponse.data);
        setVehicles(vehiclesResponse.data);
        
        const ownersResponse = await axios.get('http://localhost:8070/users/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const owners = ownersResponse.data.filter(user => user.role === 'vehicle_owner');
        const ownersMap = {};
        owners.forEach(owner => {
          ownersMap[owner._id] = owner;
        });
        
        console.log("Owners map created:", ownersMap);
        setVehicleOwners(ownersMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicles data:', error);
        setError('Failed to load vehicles data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.ownerName && vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleVehicleUpdate = (updatedVehicle) => {
    setVehicles(vehicles.map(v => v._id === updatedVehicle._id ? updatedVehicle : v));
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
      
      const response = await axios.delete(
        `http://localhost:8070/vehicles/${confirmAction.vehicle._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        setVehicles(vehicles.filter(v => v._id !== confirmAction.vehicle._id));
        setConfirmAction({ show: false, type: '', vehicle: null });
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Failed to delete vehicle';
      
      alert(errorMessage);
    }
  };

  const getOwnerEmail = (ownerId) => {
    return vehicleOwners[ownerId] ? vehicleOwners[ownerId].email : "Unknown Owner";
  };

  const handleDownloadPdf = (vehicle) => {
    const ownerData = vehicleOwners[vehicle.ownerId] || {};
    generateVehiclePdf(vehicle, ownerData);
  };

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="users-list">
          <h2 className="text-xl font-semibold mb-4">Vehicle Monitoring Dashboard</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search by vehicle type, license plate, or owner..."
                className="w-full p-2 border border-gray-300 rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="text-sm text-gray-600">Total Vehicles</div>
              <div className="text-2xl font-bold">{vehicles.length}</div>
            </div>
          </div>
          
          {loading ? (
            <p className="text-center py-4">Loading vehicles data...</p>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : (
            <>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Doc</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance Doc</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVehicles.map((vehicle) => (
                        <tr key={vehicle._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                🚗
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{vehicle.type}</div>
                                <div className="text-sm text-gray-500">Capacity: {vehicle.capacity}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vehicle.licensePlate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vehicle.ownerName}</div>
                            <div className="text-sm text-gray-500">{getOwnerEmail(vehicle.ownerId)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {vehicle.licenseDoc ? (
                              <a 
                                href={`http://localhost:8070/${vehicle.licenseDoc}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs"
                              >
                                View Document
                              </a>
                            ) : (
                              <span className="text-xs text-red-600">Missing</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {vehicle.insuranceDoc ? (
                              <a 
                                href={`http://localhost:8070/${vehicle.insuranceDoc}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs"
                              >
                                View Document
                              </a>
                            ) : (
                              <span className="text-xs text-red-600">Missing</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewVehicle(vehicle)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(vehicle)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                PDF
                              </span>
                            </button>
                            <button
                              onClick={() => openDeleteConfirmation(vehicle)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredVehicles.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            No vehicles match your search criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredVehicles.length} of {vehicles.length} vehicles
              </div>
            </>
          )}
        </div>
      </div>
      
      {isViewModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">Vehicle Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Vehicle Information</h3>
                  <p className="mb-3"><span className="font-semibold">Vehicle Type:</span> {selectedVehicle.type}</p>
                  <p className="mb-3"><span className="font-semibold">License Plate:</span> {selectedVehicle.licensePlate}</p>
                  <p className="mb-3">
                    <span className="font-semibold">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs leading-5 font-semibold rounded-full 
                      ${selectedVehicle.status === 'active' ? 'bg-green-100 text-green-800' : 
                        selectedVehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {selectedVehicle.status}
                    </span>
                  </p>
                  <p className="mb-3"><span className="font-semibold">Capacity:</span> {selectedVehicle.capacity} passengers</p>
                  <p className="mb-3">
                    <span className="font-semibold">Features:</span> 
                    {selectedVehicle.features && selectedVehicle.features.length > 0 ? (
                      <span className="ml-2">{selectedVehicle.features.join(', ')}</span>
                    ) : (
                      <span className="ml-2 text-gray-500">None specified</span>
                    )}
                  </p>
                  <p className="mb-3"><span className="font-semibold">Added On:</span> {new Date(selectedVehicle.createdAt).toLocaleDateString()}</p>
                  <p className="mb-3"><span className="font-semibold">Last Updated:</span> {new Date(selectedVehicle.updatedAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Owner Information</h3>
                  <p className="mb-3"><span className="font-semibold">Owner Name:</span> {selectedVehicle.ownerName}</p>
                  <p className="mb-3"><span className="font-semibold">Email:</span> {getOwnerEmail(selectedVehicle.ownerId)}</p>
                  <p className="mb-3"><span className="font-semibold">Contact Number:</span> {selectedVehicle.contactNumber}</p>
                  <p className="mb-3">
                    <span className="font-semibold">Owner ID:</span> 
                    <span className="ml-2 font-mono text-sm">{selectedVehicle.ownerId}</span>
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">License Document</h4>
                    {selectedVehicle.licenseDoc ? (
                      <a 
                        href={`http://localhost:8070/${selectedVehicle.licenseDoc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View License Document
                      </a>
                    ) : (
                      <div className="text-red-600">License document not uploaded</div>
                    )}
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Insurance Document</h4>
                    {selectedVehicle.insuranceDoc ? (
                      <a 
                        href={`http://localhost:8070/${selectedVehicle.insuranceDoc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View Insurance Document
                      </a>
                    ) : (
                      <div className="text-red-600">Insurance document not uploaded</div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedVehicle.images && selectedVehicle.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Vehicle Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedVehicle.images.map((imagePath, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={`http://localhost:8070/${imagePath}`}
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
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleDownloadPdf(selectedVehicle)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-4 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isEditModalOpen && selectedVehicle && (
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
                  Yes, Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehiclesList;