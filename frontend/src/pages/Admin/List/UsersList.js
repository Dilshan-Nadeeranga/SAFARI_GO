import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/users/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Get all users with role 'user'
        setUsers(response.data.filter(user => user.role === 'user'));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Helper function to get the display name
  const getDisplayName = (user) => {
    if (user.name) return user.name;
    
    // Look for alternate name fields
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.fullName) return user.fullName;
    
    // If no name fields, display email or id
    return user.email ? user.email.split('@')[0] : "N/A";
  };

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="users-list">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          
          {/* Add search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by email or name..."
              className="w-full p-2 border border-gray-300 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Name</th>
                      
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user._id.substring(0, 8)}</td>
                          <td>{user.email}</td>
                          <td>{getDisplayName(user)}</td>
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
                        <td colSpan="6" className="text-center">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-gray-500 text-sm">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersList;