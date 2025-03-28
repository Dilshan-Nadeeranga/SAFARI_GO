import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';

const VehicleOwnersList = () => {
  const [vehicleOwners, setVehicleOwners] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="users-list">
          <h2 className="text-xl font-semibold mb-4">All Vehicle Owners</h2>
          
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
            <p>Loading vehicle owners and vehicles...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
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
                            <button className="view-btn">View</button>
                            <button className="edit-btn">Edit</button>
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
      </div>
    </div>
  );
};

export default VehicleOwnersList;
