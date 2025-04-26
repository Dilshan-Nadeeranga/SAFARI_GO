import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';

const VehicleOwnerEdit = () => {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    contactNumber: '',
    role: 'vehicle_owner'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/LoginForm');
          return;
        }

        // Fetch user data
        const userResponse = await axios.get(`http://localhost:8070/admin/users/${ownerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setOwner(userResponse.data);
        
        // Attempt to fetch profile data
        try {
          const profileResponse = await axios.get(`http://localhost:8070/users/profile/${ownerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (profileResponse.data) {
            setFormData({
              name: profileResponse.data.name || userResponse.data.name || '',
              email: userResponse.data.email || '',
              companyName: profileResponse.data.companyName || '',
              contactNumber: profileResponse.data.Phonenumber1 || '',
              role: userResponse.data.role || 'vehicle_owner'
            });
          } else {
            setFormData({
              name: userResponse.data.name || '',
              email: userResponse.data.email || '',
              companyName: '',
              contactNumber: '',
              role: userResponse.data.role || 'vehicle_owner'
            });
          }
        } catch (err) {
          console.warn("Could not fetch profile data:", err);
          setFormData({
            name: userResponse.data.name || '',
            email: userResponse.data.email || '',
            companyName: '',
            contactNumber: '',
            role: userResponse.data.role || 'vehicle_owner'
          });
        }
        
        // Fetch vehicles for this owner
        try {
          const vehiclesResponse = await axios.get('http://localhost:8070/vehicles', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Filter for only vehicles owned by this vehicle owner
          const ownerVehicles = vehiclesResponse.data.filter(
            vehicle => vehicle.ownerId === ownerId
          );
          
          setVehicles(ownerVehicles);
        } catch (err) {
          console.warn("Could not fetch vehicles:", err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching owner:', err);
        setError(err.response?.data?.message || 'Failed to load owner data');
        setLoading(false);
      }
    };

    fetchOwner();
  }, [ownerId, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Update basic user data
      await axios.put(`http://localhost:8070/admin/users/${ownerId}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Try to update profile data if it exists
      try {
        await axios.put(`http://localhost:8070/users/profile/${ownerId}`, {
          name: formData.name,
          companyName: formData.companyName,
          Phonenumber1: formData.contactNumber
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.warn("Could not update profile data:", err);
      }
      
      setSuccess('Vehicle owner updated successfully');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating vehicle owner:', err);
      setError(err.response?.data?.message || 'Failed to update vehicle owner');
      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBack = () => {
    navigate('/admin/vehicle-owners');
  };

  if (loading) return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer flex justify-center items-center">
        <div className="text-xl">Loading owner data...</div>
      </div>
    </div>
  );

  if (error && !owner) return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer flex flex-col justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={handleBack}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Back to Vehicle Owners List
        </button>
      </div>
    </div>
  );

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Edit Vehicle Owner</h2>
          <button
            onClick={handleBack}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Back to Vehicle Owners List
          </button>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4">
              {owner.profilePicture ? (
                <img
                  src={`http://localhost:8070/${owner.profilePicture}`}
                  alt={owner.name || 'Vehicle Owner'}
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=Owner';
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-gray-600">
                  {(owner.name || owner.email || 'O').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">{owner.name || 'No Name'}</h3>
              <p className="text-gray-600">{owner.email}</p>
              <p className="text-sm text-gray-500">Owner ID: {owner._id}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNumber">
                Contact Number
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="vehicle_owner">Vehicle Owner</option>
                <option value="user">User</option>
                <option value="guide">Guide</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {/* Display vehicles associated with this owner */}
            {vehicles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Associated Vehicles</h3>
                <div className="bg-gray-50 p-3 rounded border">
                  <ul className="divide-y divide-gray-200">
                    {vehicles.map(vehicle => (
                      <li key={vehicle._id} className="py-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{vehicle.type}</p>
                            <p className="text-sm text-gray-500">{vehicle.licensePlate}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full 
                            ${vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 
                              vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {vehicle.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Update Vehicle Owner
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleOwnerEdit;
