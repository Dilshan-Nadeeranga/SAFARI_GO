import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SafariForm from './SafariForm';
import SafariList from './SafariList';

const GuideDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tours, setTours] = useState([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    totalEarnings: 0,
    ratings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add logout handler function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/LoginForm');
  };

  // Add state for safari management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [safaris, setSafaris] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedSafari, setSelectedSafari] = useState(null);
  const [safariStats, setSafariStats] = useState({
    active: 0,
    pending: 0,
    inactive: 0
  });
  const [refreshSafaris, setRefreshSafaris] = useState(false);

  // Add this state after the other useState declarations
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    phone: '',
    experienceYears: '',
    specialties: '',
    bio: '',
    languages: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'guide') {
      navigate('/LoginForm');
      return;
    }
    
    const fetchGuideData = async () => {
      try {
        // Fetch guide profile
        const profileResponse = await axios.get('http://localhost:8070/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch guide's tours (you'll need to create this endpoint)
        const toursResponse = await axios.get('http://localhost:8070/guides/tours', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile(profileResponse.data);
        setTours(toursResponse.data);
        
        // Calculate statistics
        const upcoming = toursResponse.data.filter(t => t.status === 'upcoming').length;
        const ongoing = toursResponse.data.filter(t => t.status === 'ongoing').length;
        const completed = toursResponse.data.filter(t => t.status === 'completed').length;
        const totalEarnings = toursResponse.data
          .filter(t => t.status === 'completed')
          .reduce((total, tour) => total + tour.fee, 0);
          
        // Extract ratings data
        const ratings = toursResponse.data
          .filter(t => t.rating)
          .map(t => ({ date: new Date(t.date).toLocaleDateString(), rating: t.rating }));
          
        setStats({
          upcoming,
          ongoing,
          completed,
          totalEarnings,
          ratings
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching guide data:', err);
        setError('Failed to load guide dashboard');
        setLoading(false);
      }
    };
    
    fetchGuideData();
  }, [navigate]);

  // Add useEffect to fetch safari packages
  useEffect(() => {
    if (activeTab === 'safaris' || refreshSafaris) {
      const fetchSafaris = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:8070/safaris/guide', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setSafaris(response.data);
          
          // Calculate safari stats
          const active = response.data.filter(s => s.status === 'active').length;
          const pending = response.data.filter(s => s.status === 'pending_approval').length;
          const inactive = response.data.filter(s => s.status === 'inactive').length;
          
          setSafariStats({ active, pending, inactive });
          setRefreshSafaris(false);
        } catch (err) {
          console.error('Error fetching safari packages:', err);
        }
      };
      
      fetchSafaris();
    }
  }, [activeTab, refreshSafaris]);

  // Initialize profile form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileFormData({
        name: profile.name || '',
        experienceYears: profile.experienceYears || '',
        specialties: profile.specialties ? profile.specialties.join(', ') : '',
      });
    }
  }, [profile]);

  // Add useEffect to fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/guides/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    
    fetchNotifications();
    
    // Set up interval to check for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8070/guides/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  // Handle profile form field changes
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('name', profileFormData.name);
      formData.append('experienceYears', profileFormData.experienceYears);
      formData.append('specialties', profileFormData.specialties);
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
      
      const response = await axios.put('http://localhost:8070/guides/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state with the updated profile
      setProfile(response.data);
      setIsEditingProfile(false);
      setProfilePicture(null);
      setProfilePicturePreview(null);
      
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Handle safari form submit (create or update)
  const handleSafariSubmit = () => {
    setIsFormVisible(false);
    setSelectedSafari(null);
    setRefreshSafaris(true);
  };

  // Handle safari edit
  const handleEditSafari = (safari) => {
    setSelectedSafari(safari);
    setIsFormVisible(true);
  };

  // Handle safari delete
  const handleDeleteSafari = async (safariId) => {
    if (window.confirm('Are you sure you want to delete this safari package?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8070/safaris/${safariId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Refresh the list
        setRefreshSafaris(true);
      } catch (err) {
        console.error('Error deleting safari package:', err);
        alert('Failed to delete safari package');
      }
    }
  };

  // Chart data
  const statusData = [
    { name: 'Upcoming', value: stats.upcoming },
    { name: 'Ongoing', value: stats.ongoing },
    { name: 'Completed', value: stats.completed }
  ];
  
  const COLORS = ['#0088FE', '#FF8042', '#00C49F'];

  if (loading) return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Guide Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* Notifications Bell Icon */}
            <div className="relative">
              <button 
                className="text-white focus:outline-none"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                  <div className="py-2 px-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-4 px-4 text-gray-500 text-center">
                      No notifications
                    </div>
                  ) : (
                    <div>
                      {notifications.map(notification => (
                        <div 
                          key={notification._id} 
                          className={`py-3 px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => markAsRead(notification._id)}
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.type}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
            <button onClick={() => navigate('/guide-feedback')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Guide Feedback
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto p-4">
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`py-2 px-4 mr-2 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`py-2 px-4 mr-2 ${activeTab === 'safaris' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveTab('safaris')}
          >
            Safari Packages
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        {/* Dashboard content */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ...existing dashboard content... */}
            
            {/* Safari Stats Card */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Safari Packages</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <p className="text-sm text-green-800">Active</p>
                  <p className="text-2xl font-bold text-green-600">{safariStats.active}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{safariStats.pending}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <p className="text-sm text-red-800">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{safariStats.inactive}</p>
                </div>
              </div>
            </div>
            
            {/* ...other dashboard content... */}
          </div>
        )}

        {/* Safari Packages content */}
        {activeTab === 'safaris' && (
          <div>
            {isFormVisible ? (
              <SafariForm 
                safari={selectedSafari} 
                onSubmit={handleSafariSubmit} 
                onCancel={() => {
                  setIsFormVisible(false);
                  setSelectedSafari(null);
                }} 
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Safari Packages</h2>
                  <button
                    onClick={() => setIsFormVisible(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Add New Package
                  </button>
                </div>
                
                <SafariList 
                  safaris={safaris} 
                  onEdit={handleEditSafari} 
                  onDelete={handleDeleteSafari} 
                />
              </>
            )}
          </div>
        )}

        {/* Profile content */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Guide Profile</h2>
            
            {isEditingProfile ? (
              // Profile Edit Form
              <form onSubmit={handleUpdateProfile} className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Picture Upload */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-2 border-blue-500">
                      {profilePicturePreview ? (
                        <img 
                          src={profilePicturePreview} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover" 
                        />
                      ) : profile?.profilePicture ? (
                        <img
                          src={`http://localhost:8070/${profile.profilePicture}`}
                          alt="Current Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Guide';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Picture
                      </label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfilePictureChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileFormData.name}
                      onChange={handleProfileFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Experience Years Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Years
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={profileFormData.experienceYears}
                      onChange={handleProfileFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>
                  
                  {/* Specialties Field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialties (comma-separated)
                    </label>
                    <textarea
                      name="specialties"
                      value={profileFormData.specialties}
                      onChange={handleProfileFormChange}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
                
                {/* Form Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              // Profile Display View
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Image Section */}
                <div className="col-span-1">
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-2 border-blue-500">
                      {profile.profilePicture ? (
                        <img
                          src={`http://localhost:8070/${profile.profilePicture}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Guide';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="col-span-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">Name</h3>
                      <p className="mt-1 text-gray-600">{profile.name}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">Experience</h3>
                      <p className="mt-1 text-gray-600">{profile.experienceYears} years</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">Specialties</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {profile.specialties && profile.specialties.length > 0 ? (
                          profile.specialties.map((specialty, index) => (
                            <span 
                              key={index} 
                              className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {specialty}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No specialties listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideDashboard;
