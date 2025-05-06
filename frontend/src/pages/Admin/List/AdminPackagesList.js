import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';
import { toast } from 'react-toastify';

const AdminPackagesList = () => {
  const [safaris, setSafaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'active', 'pending', 'inactive'
  const [selectedSafari, setSelectedSafari] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add state for refresh mechanism

  useEffect(() => {
    const fetchSafaris = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/safaris/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched safaris:', response.data);
        setSafaris(response.data);
      } catch (error) {
        console.error('Error fetching safaris:', error);
        setError('Failed to load safari packages: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSafaris();
  }, [refreshKey]); // Add refreshKey dependency

  const handleUpdateStatus = async (safariId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if server is reachable first
      try {
        await axios.get('http://localhost:8070/api/status');
      } catch (connError) {
        toast.error('Cannot connect to server. Please check if the server is running.');
        return;
      }
      
      // Perform the status update
      await axios.patch(`http://localhost:8070/safaris/${safariId}/status`, 
        { status: newStatus },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }
      );
      
      // Update the local state to reflect the change
      setSafaris(prevSafaris => 
        prevSafaris.map(safari => 
          safari._id === safariId ? { ...safari, status: newStatus } : safari
        )
      );
      
      toast.success(`Safari status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating safari status:', error);
      
      // Handle different types of errors
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your internet connection and server status.');
      } else if (error.response) {
        toast.error(`Server error: ${error.response.data.message || 'Unknown error'}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
      
      // Refresh the data to ensure UI is in sync with backend
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  const handleViewSafari = (safari) => {
    setSelectedSafari(safari);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedSafari(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending_approval': return 'Pending Approval';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  // Filter safaris based on search term and view mode
  const filteredSafaris = safaris.filter(safari => {
    // Check view mode filter
    if (viewMode === 'active' && safari.status !== 'active') return false;
    if (viewMode === 'pending' && safari.status !== 'pending_approval') return false;
    if (viewMode === 'inactive' && safari.status !== 'inactive') return false;
    
    // Check search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        safari.title.toLowerCase().includes(searchLower) ||
        safari.location.toLowerCase().includes(searchLower) ||
        safari.description.toLowerCase().includes(searchLower) ||
        (safari.guideId?.name && safari.guideId.name.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Safari Packages</h1>
          
          {/* Search and filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search by title, location, or guide..."
                className="w-full p-2 border border-gray-300 rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-1/2 flex gap-2">
              <button 
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded-md ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                All
              </button>
              <button 
                onClick={() => setViewMode('active')}
                className={`px-3 py-1 rounded-md ${viewMode === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setViewMode('pending')}
                className={`px-3 py-1 rounded-md ${viewMode === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setViewMode('inactive')}
                className={`px-3 py-1 rounded-md ${viewMode === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
              >
                Inactive
              </button>
            </div>
          </div>
          
          {loading ? (
            <p>Loading safari packages...</p>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
              <p>{error}</p>
            </div>
          ) : filteredSafaris.length === 0 ? (
            <p>No safari packages found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guide
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSafaris.map(safari => (
                    <tr key={safari._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {safari.images && safari.images[0] ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={`http://localhost:8070/${safari.images[0]}`} 
                                alt={safari.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/40?text=Safari";
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{safari.title}</div>
                            <div className="text-sm text-gray-500">{safari.duration} hours | {safari.capacity} people</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{safari.guideId?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{safari.guideId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{safari.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rs. {safari.price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(safari.status)}`}>
                          {getStatusText(safari.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewSafari(safari)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        {safari.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(safari._id, 'active')}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(safari._id, 'inactive')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {safari.status === 'inactive' && (
                          <button
                            onClick={() => handleUpdateStatus(safari._id, 'active')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </button>
                        )}
                        {safari.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(safari._id, 'inactive')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Safari Modal */}
      {isViewModalOpen && selectedSafari && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-3 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Safari Package Details</h3>
              <button 
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Header with status and actions */}
              <div className="flex justify-between items-center mb-4">
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedSafari.status)}`}>
                  {getStatusText(selectedSafari.status)}
                </span>
                
                <div>
                  {selectedSafari.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedSafari._id, 'active');
                          closeViewModal();
                        }}
                        className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedSafari._id, 'inactive');
                          closeViewModal();
                        }}
                        className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedSafari.status === 'inactive' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedSafari._id, 'active');
                        closeViewModal();
                      }}
                      className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700"
                    >
                      Activate
                    </button>
                  )}
                  {selectedSafari.status === 'active' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedSafari._id, 'inactive');
                        closeViewModal();
                      }}
                      className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
              
              {/* Safari details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">{selectedSafari.title}</h4>
                  <p className="mb-4 text-gray-700">{selectedSafari.description}</p>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Guide</h5>
                    <p>{selectedSafari.guideId?.name || 'Unknown'} ({selectedSafari.guideId?.email || 'No email'})</p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Location</h5>
                    <p>{selectedSafari.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Duration</h5>
                      <p>{selectedSafari.duration} hours</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Price</h5>
                      <p>Rs. {selectedSafari.price?.toLocaleString()}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Capacity</h5>
                      <p>{selectedSafari.capacity} people</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">What's Included</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedSafari.includes && selectedSafari.includes.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Safari Images</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedSafari.images && selectedSafari.images.length > 0 ? (
                      selectedSafari.images.map((image, index) => (
                        <div key={index} className="aspect-w-16 aspect-h-9 overflow-hidden rounded-md">
                          <img 
                            src={`http://localhost:8070/${image}`}
                            alt={`Safari ${index + 1}`}
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="col-span-2 text-gray-500 italic">No images available</p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Created</h5>
                    <p>{new Date(selectedSafari.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Last Updated</h5>
                    <p>{new Date(selectedSafari.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackagesList;