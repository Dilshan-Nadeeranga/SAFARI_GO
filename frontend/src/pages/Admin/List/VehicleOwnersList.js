import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const VehicleOwnersList = () => {
  const navigate = useNavigate();
  const [vehicleOwners, setVehicleOwners] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // New state variables for modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Starting data fetch with token:", token ? "Valid token" : "No token");
        
        // Get all vehicle owners
        const ownersResponse = await axios.get('http://localhost:8070/users/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Filter for only vehicle owners
        const owners = ownersResponse.data.filter(user => user.role === 'vehicle_owner');
        console.log(`Found ${owners.length} vehicle owners`);
        
        // Get all vehicles (as admin)
        let allVehiclesData = {};
        try {
          const vehiclesResponse = await axios.get('http://localhost:8070/vehicles', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Group vehicles by owner ID
          const vehiclesByOwner = {};
          vehiclesResponse.data.forEach(vehicle => {
            if (!vehiclesByOwner[vehicle.ownerId]) {
              vehiclesByOwner[vehicle.ownerId] = [];
            }
            vehiclesByOwner[vehicle.ownerId].push(vehicle);
          });
          
          allVehiclesData = vehiclesByOwner;
          console.log("Fetched vehicles grouped by owner:", allVehiclesData);
        } catch (err) {
          console.error("Error fetching vehicles:", err);
        }
        
        // Get detailed vehicle owner profiles
        const enrichedOwners = await Promise.all(
          owners.map(async (owner) => {
            try {
              // Try to get detailed profile data for each owner
              const profileResponse = await axios.get(`http://localhost:8070/users/profile/${owner._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              // If profile exists, merge it with basic user data
              if (profileResponse.data) {
                console.log(`Profile found for ${owner.email}:`, profileResponse.data);
                return { ...owner, profile: profileResponse.data };
              }
            } catch (err) {
              console.log(`No additional profile data for ${owner.email}`);
            }
            return owner;
          })
        );
        
        setVehicleOwners(enrichedOwners);
        setVehicles(allVehiclesData);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to load vehicle owners data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter vehicle owners based on search term
  const filteredOwners = vehicleOwners.filter(owner => 
    owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.profile?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get vehicle names
  const getVehicleNames = (owner) => {
    // First try to get vehicles from our fetched vehicles data
    const ownerVehicles = vehicles[owner._id] || [];
    
    if (ownerVehicles.length > 0) {
      // Map to get vehicle types and filter out any empty values
      const vehicleTypes = ownerVehicles.map(v => v.type).filter(Boolean);
      
      // Show first 3 and indicate if there are more
      if (vehicleTypes.length > 3) {
        return `${vehicleTypes.slice(0, 3).join(", ")} +${vehicleTypes.length - 3} more`;
      }
      
      return vehicleTypes.join(", ");
    }
    
    // Try to get vehicles from profile data
    if (owner.profile?.vehicles && owner.profile.vehicles.length > 0) {
      const profileVehicleTypes = owner.profile.vehicles.map(v => v.type).filter(Boolean);
      
      if (profileVehicleTypes.length > 0) {
        if (profileVehicleTypes.length > 3) {
          return `${profileVehicleTypes.slice(0, 3).join(", ")} +${profileVehicleTypes.length - 3} more`;
        }
        return profileVehicleTypes.join(", ");
      }
    }
    
    return "No vehicles";
  };

  // Function to get vehicle count
  const getVehicleCount = (owner) => {
    // First check vehicles from API response
    const ownerVehicles = vehicles[owner._id] || [];
    if (ownerVehicles.length > 0) {
      return ownerVehicles.length;
    }
    
    // Then check profile vehicles
    if (owner.profile?.vehicles && owner.profile.vehicles.length > 0) {
      return owner.profile.vehicles.length;
    }
    
    return 0;
  };

  // Function to get owner name for display
  const getOwnerDisplayName = (owner) => {
    // Check profile first
    if (owner.profile?.name) return owner.profile.name;
    
    // Then check main user object
    if (owner.name) return owner.name;
    
    // Last resort, use email username
    return owner.email ? owner.email.split('@')[0] : "N/A";
  };

  // Function to get company name
  const getCompanyName = (owner) => {
    return owner.profile?.companyName || "N/A";
  };

  // Function to handle the edit button click
  const handleEditOwner = (ownerId) => {
    navigate(`/admin/vehicle-owners/${ownerId}`);
  };

  // Function to handle the view button click
  const handleViewOwner = (owner) => {
    setSelectedOwner(owner);
    setViewModalOpen(true);
  };

  // Function to close the view modal
  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedOwner(null);
  };

  // Function to generate PDF for a single vehicle owner
  const generateSingleOwnerPDF = (owner) => {
    setPdfLoading(true);
    
    try {
      const doc = new jsPDF();
      const ownerName = getOwnerDisplayName(owner);
      
      // Add title and basic info
      doc.setFontSize(18);
      doc.text('Vehicle Owner Details', 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      
      // Add owner info
      doc.setFontSize(14);
      doc.text('Owner Information', 14, 45);
      
      doc.setFontSize(12);
      const ownerInfo = [
        { label: 'ID:', value: owner._id },
        { label: 'Name:', value: ownerName },
        { label: 'Email:', value: owner.email },
        { label: 'Company:', value: getCompanyName(owner) },
        { label: 'Phone:', value: owner.profile?.Phonenumber1 || 'N/A' },
        { label: 'Total Vehicles:', value: getVehicleCount(owner).toString() }
      ];
      
      let yPos = 55;
      ownerInfo.forEach(item => {
        doc.text(`${item.label} ${item.value}`, 14, yPos);
        yPos += 8;
      });
      
      // Add vehicles table
      doc.setFontSize(14);
      doc.text('Vehicles', 14, yPos + 10);
      
      const ownerVehicles = vehicles[owner._id] || [];
      if (ownerVehicles.length > 0) {
        const tableColumns = ['Type', 'License Plate', 'Status', 'Capacity'];
        const tableRows = ownerVehicles.map(vehicle => [
          vehicle.type || 'N/A',
          vehicle.licensePlate || 'N/A',
          vehicle.status || 'N/A',
          vehicle.capacity?.toString() || 'N/A'
        ]);
        
        doc.autoTable({
          head: [tableColumns],
          body: tableRows,
          startY: yPos + 15
        });
      } else {
        doc.setFontSize(12);
        doc.text('No vehicles found', 14, yPos + 20);
      }
      
      // Save the PDF with owner name
      doc.save(`vehicle_owner_${ownerName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    }
    
    setPdfLoading(false);
  };

  // Function to generate PDF for all vehicle owners
  const generateAllOwnersPDF = () => {
    setPdfLoading(true);
    
    try {
      const doc = new jsPDF();
      
      // Add title and report info
      doc.setFontSize(18);
      doc.text('Vehicle Owners Report', 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Owners: ${vehicleOwners.length}`, 14, 38);
      
      // Create table data
      const tableColumns = ['ID', 'Name', 'Email', 'Company', '# Vehicles'];
      const tableRows = vehicleOwners.map(owner => [
        owner._id.substring(0, 8),
        getOwnerDisplayName(owner),
        owner.email,
        getCompanyName(owner),
        getVehicleCount(owner).toString()
      ]);
      
      // Add the table
      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 45,
        styles: { overflow: 'ellipsize' },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 60 },
          3: { cellWidth: 40 },
          4: { cellWidth: 25 }
        }
      });
      
      // Save the PDF
      doc.save('all_vehicle_owners_report.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    }
    
    setPdfLoading(false);
  };

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="users-list">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Vehicle Owners</h2>
       
          </div>
          
          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by email, name, or company..."
              className="w-full p-2 border border-gray-300 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader"></div>
              <p className="ml-3">Loading vehicle owners and vehicles...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Vehicles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOwners.length > 0 ? (
                    filteredOwners.map((owner) => (
                      <tr key={owner._id}>
                        <td>{owner._id.substring(0, 8)}</td>
                        <td>{owner.email}</td>
                        <td>{getOwnerDisplayName(owner)}</td>
                        <td>{getCompanyName(owner)}</td>
                        <td>
                          <div>
                            <span className="font-medium">{getVehicleNames(owner)}</span>
                            <span className="ml-2 bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs">
                              {getVehicleCount(owner)} vehicles
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="view-btn" 
                              onClick={() => handleViewOwner(owner)}
                            >
                              View
                            </button>
                            {/* <button 
                              className="edit-btn" 
                              onClick={() => handleEditOwner(owner._id)}
                            >
                              Edit
                            </button> */}
                            <button
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              onClick={() => generateSingleOwnerPDF(owner)}
                              disabled={pdfLoading}
                            >
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">No vehicle owners found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && (
            <div className="mt-4 text-gray-500 text-sm">
              Showing {filteredOwners.length} of {vehicleOwners.length} vehicle owners
            </div>
          )}
        </div>
        
        {/* View Modal */}
        {viewModalOpen && selectedOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="border-b px-4 py-3 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Vehicle Owner Details</h3>
                <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                {/* Owner Information */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2 border-b pb-2">Owner Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p>{getOwnerDisplayName(selectedOwner)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p>{selectedOwner.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company</p>
                      <p>{getCompanyName(selectedOwner)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p>{selectedOwner.profile?.Phonenumber1 || 'N/A'}</p>
                    </div>
                    {selectedOwner.profile?.address && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p>{selectedOwner.profile.address}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Vehicles Information */}
                <div>
                  <h4 className="text-lg font-medium mb-2 border-b pb-2">Vehicles</h4>
                  {getVehicleCount(selectedOwner) > 0 ? (
                    <div className="space-y-4">
                      {(vehicles[selectedOwner._id] || []).map((vehicle, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Type</p>
                              <p>{vehicle.type || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">License Plate</p>
                              <p>{vehicle.licensePlate || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Status</p>
                              <p className={`${
                                vehicle.status === 'active' ? 'text-green-600' :
                                vehicle.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {vehicle.status || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Capacity</p>
                              <p>{vehicle.capacity || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No vehicles found for this owner.</p>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => generateSingleOwnerPDF(selectedOwner)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2 flex items-center"
                    disabled={pdfLoading}
                  >
                    {pdfLoading ? (
                      <>
                        <div className="spinner mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEditOwner(selectedOwner._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit Owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleOwnersList;
