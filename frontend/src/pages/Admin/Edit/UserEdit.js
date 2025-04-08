import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';

const UserEdit = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/LoginForm');
          return;
        }

        const response = await axios.get(`http://localhost:8070/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          role: response.data.role || 'user'
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err.response?.data?.message || 'Failed to load user data');
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

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
      await axios.put(`http://localhost:8070/admin/users/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('User updated successfully');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBack = () => {
    navigate('/admin/users');
  };

  if (loading) return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer flex justify-center items-center">
        <div className="text-xl">Loading user data...</div>
      </div>
    </div>
  );

  if (error && !user) return (
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
          Back to User List
        </button>
      </div>
    </div>
  );

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Edit User</h2>
          <button
            onClick={handleBack}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Back to User List
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
              {user.profilePicture ? (
                <img
                  src={`http://localhost:8070/${user.profilePicture}`}
                  alt={user.name || 'User'}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-gray-600">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">{user.name || 'No Name'}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">User ID: {user._id}</p>
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
                <option value="user">User</option>
                <option value="guide">Guide</option>
                <option value="vehicle_owner">Vehicle Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {user.isPremium && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 font-medium">Premium Status</p>
                <p className="text-sm">
                  This user has a premium subscription
                  {user.premiumUntil && (
                    <> until {new Date(user.premiumUntil).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;
