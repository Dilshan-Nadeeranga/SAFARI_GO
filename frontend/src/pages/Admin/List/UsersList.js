import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Componet/CSS/UserList.css';

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, userId: null });
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/users/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Add delete user function
  const handleDeleteUser = async (userId) => {
    // Open confirmation dialog
    setDeleteConfirmation({ show: true, userId });
  };
  
  // Confirm delete user function
  const confirmDeleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = deleteConfirmation.userId;
      
      console.log(`Attempting to delete user with ID: ${userId}`);
      
      // Try our new direct endpoint that bypasses all router middleware
      try {
        console.log(`Trying direct delete endpoint: /delete-user/${userId}`);
        const response = await axios.delete(`http://localhost:8070/delete-user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Delete response:', response.data);
        
        // Update users list after deletion
        setUsers(users.filter(user => user._id !== userId));
        
        // Show success message
        alert('User deleted successfully');
        
        // Close confirmation dialog
        setDeleteConfirmation({ show: false, userId: null });
        return;
      } catch (err) {
        console.error('Error deleting user:', err);
        alert(`Failed to delete user: ${err.response?.data?.message || err.message}`);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred');
    }
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, userId: null });
  };
  
  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Add this new function to handle edit navigation
  const handleEditUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading users...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Users Management</h2>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profilePicture ? (
                            <img className="h-10 w-10 rounded-full" src={`http://localhost:8070/${user.profilePicture}`} alt={user.name || user.email} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">ID: {user._id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.name || 'Not provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                        user.role === 'guide' ? 'bg-green-100 text-green-800' :
                        user.role === 'vehicle_owner' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.isPremium ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.isPremium ? 'Premium' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={() => handleEditUser(user._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={confirmDeleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;