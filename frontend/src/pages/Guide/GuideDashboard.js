// Import core dependencies
import React, { useState, useEffect } from 'react'; // React and hooks for state and lifecycle
import { useNavigate } from 'react-router-dom'; // Navigation hook
import axios from 'axios'; // HTTP requests
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Chart components
import SafariForm from './SafariForm'; // Form for safari packages
import SafariList from './SafariList'; // List of safari packages

// Define GuideDashboard component
const GuideDashboard = () => {
  const navigate = useNavigate(); // Navigation setup

  // State for guide data
  const [profile, setProfile] = useState(null); // Guide profile
  const [tours, setTours] = useState([]); // Guide's tours
  const [stats, setStats] = useState({ // Tour statistics
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    totalEarnings: 0,
    ratings: []
  });
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // State for safari management
  const [activeTab, setActiveTab] = useState('dashboard'); // Current tab (dashboard, safaris, profile)
  const [safaris, setSafaris] = useState([]); // Safari packages
  const [isFormVisible, setIsFormVisible] = useState(false); // Show/hide safari form
  const [selectedSafari, setSelectedSafari] = useState(null); // Selected safari for editing
  const [safariStats, setSafariStats] = useState({ // Safari package stats
    active: 0,
    pending: 0,
    inactive: 0
  });
  const [refreshSafaris, setRefreshSafaris] = useState(false); // Trigger safari refresh

  // State for profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false); // Profile edit mode
  const [profileFormData, setProfileFormData] = useState({ // Profile form data
    name: '',
    phone: '',
    experienceYears: '',
    specialties: '',
    bio: '',
    languages: ''
  });
  const [profilePicture, setProfilePicture] = useState(null); // Profile picture file
  const [profilePicturePreview, setProfilePicturePreview] = useState(null); // Profile picture preview

  // State for notifications
  const [notifications, setNotifications] = useState([]); // Notification list
  const [unreadCount, setUnreadCount] = useState(0); // Unread notification count
  const [showNotifications, setShowNotifications] = useState(false); // Show/hide notifications

  // State for dashboard extras
  const [profileCompletion, setProfileCompletion] = useState(0); // Profile completion percentage
  const [dailyQuote, setDailyQuote] = useState(''); // Random daily quote

  // Array of static quotes for daily display
  const quotes = [
    "“The wilderness holds answers to questions man has not yet learned to ask.” - Nancy Newhall",
    "“In every walk with nature, one receives far more than he seeks.” - John Muir",
    "“Look into nature, and then you will understand everything better.” - Albert Einstein",
  ];

  // Fetch guide data (profile, tours, stats)
  const fetchGuideData = async () => {
    try {
      const token = localStorage.getItem('token'); // Get auth token
      if (!token) {
        navigate('/LoginForm'); // Redirect if no token
        return;
      }

      // Fetch profile and tours via API
      const profileResponse = await axios.get('http://localhost:8070/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const toursResponse = await axios.get('http://localhost:8070/guides/tours', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(profileResponse.data); // Update profile
      setTours(toursResponse.data || []); // Update tours

      // Calculate tour stats
      const toursData = Array.isArray(toursResponse.data) ? toursResponse.data : [];
      const upcoming = toursData.filter(t => t.status === 'upcoming').length;
      const ongoing = toursData.filter(t => t.status === 'ongoing').length;
      const completed = toursData.filter(t => t.status === 'completed').length;
      const totalEarnings = toursData
        .filter(t => t.status === 'completed' && t.fee)
        .reduce((total, tour) => total + (parseFloat(tour.fee) || 0), 0);
      const ratings = toursData
        .filter(t => t.rating && t.date)
        .map(t => ({
          date: new Date(t.date).toLocaleDateString(),
          rating: parseFloat(t.rating) || 0
        }));

      setStats({ upcoming, ongoing, completed, totalEarnings, ratings }); // Update stats

      // Calculate profile completion
      let completedFields = 0;
      if (profileResponse.data.name) completedFields++;
      if (profileResponse.data.experienceYears) completedFields++;
      if (profileResponse.data.specialties && profileResponse.data.specialties.length > 0) completedFields++;
      if (profileResponse.data.profilePicture) completedFields++;
      setProfileCompletion((completedFields / 4) * 100);

      // Set random daily quote
      setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      
      setLoading(false); // Stop loading
    } catch (err) {
      setError('Failed to load guide dashboard.'); // Set error
      setLoading(false);
    }
  };

  // Effect to check auth and fetch data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'guide') {
      navigate('/LoginForm'); // Redirect if not authorized
      return;
    }
    
    fetchGuideData(); // Initial data fetch
    const interval = setInterval(fetchGuideData, 30000); // Periodic fetch every 30s
    return () => clearInterval(interval); // Cleanup
  }, [navigate]);

  // Effect to fetch safari packages
  useEffect(() => {
    if (activeTab === 'safaris' || refreshSafaris) {
      const fetchSafaris = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:8070/safaris/guide', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setSafaris(response.data || []); // Update safaris
          // Update safari stats
          const active = (response.data || []).filter(s => s.status === 'active').length;
          const pending = (response.data || []).filter(s => s.status === 'pending_approval').length;
          const inactive = (response.data || []).filter(s => s.status === 'inactive').length;
          
          setSafariStats({ active, pending, inactive });
          setRefreshSafaris(false); // Reset refresh
        } catch (err) {
          console.error('Error fetching safari packages:', err);
        }
      };
      
      fetchSafaris();
    }
  }, [activeTab, refreshSafaris]);

  // Effect to initialize profile form data
  useEffect(() => {
    if (profile) {
      setProfileFormData({ // Set form data from profile
        name: profile.name || '',
        experienceYears: profile.experienceYears || '',
        specialties: profile.specialties ? profile.specialties.join(', ') : '',
      });
    }
  }, [profile]);

  // Effect to fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/guides/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setNotifications(response.data || []); // Update notifications
        setUnreadCount((response.data || []).filter(n => !n.read).length); // Update unread count
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60000); // Fetch every minute
    return () => clearInterval(intervalId); // Cleanup
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token
    localStorage.removeItem('role'); // Clear role
    navigate('/LoginForm'); // Redirect to login
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8070/guides/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.map(n => // Update notification status
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1)); // Decrease unread count
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file); // Set picture file
      setProfilePicturePreview(URL.createObjectURL(file)); // Set preview
    }
  };

  // Handle profile form changes
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ // Update form data
      ...prev,
      [name]: value
    }));
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData(); // Create form data for multipart request
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
      
      setProfile(response.data); // Update profile
      setIsEditingProfile(false); // Exit edit mode
      setProfilePicture(null); // Clear picture
      setProfilePicturePreview(null); // Clear preview
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    }
  };

  // Handle safari form submission
  const handleSafariSubmit = () => {
    setIsFormVisible(false); // Hide form
    setSelectedSafari(null); // Clear selected safari
    setRefreshSafaris(true); // Trigger refresh
  };

  // Edit safari
  const handleEditSafari = (safari) => {
    setSelectedSafari(safari); // Set safari to edit
    setIsFormVisible(true); // Show form
  };

  // Delete safari
  const handleDeleteSafari = async (safariId) => {
    if (window.confirm('Are you sure you want to delete this safari package?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8070/safaris/${safariId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRefreshSafaris(true); // Trigger refresh
      } catch (err) {
        console.error('Error deleting safari package:', err);
        alert('Failed to delete safari package');
      }
    }
  };

  // Chart data for tour status
  const statusData = [
    { name: 'Upcoming', value: stats.upcoming },
    { name: 'Ongoing', value: stats.ongoing },
    { name: 'Completed', value: stats.completed }
  ];
  const COLORS = ['#0088FE', '#FF8042', '#00C49F']; // Chart colors

  // Render loading or error states
  if (loading) return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  // Main render
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with title, notifications, and buttons */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Guide Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* Notification bell */}
            <div className="relative">
              <button 
                className="text-white focus:outline-none"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">...</svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                  <div className="py-2 px-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-4 px-4 text-gray-500 text-center">No notifications</div>
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
                          <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Logout and feedback buttons */}
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Logout</button>
            <button onClick={() => navigate('/guide-feedback')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Guide Feedback</button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto p-4">
        {/* Tab navigation */}
        <div className="flex border-b mb-4">
          <button className={`py-2 px-4 mr-2 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>
          <button className={`py-2 px-4 mr-2 ${activeTab === 'safaris' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`} onClick={() => setActiveTab('safaris')}>
            Safari Packages
          </button>
          <button className={`py-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`} onClick={() => setActiveTab('profile')}>
            Profile
          </button>
        </div>

        {/* Dashboard tab content */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Welcome, tips, quote, and profile completion */}
            <div className="mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h2 className="text-xl font-semibold">Welcome back, {profile?.name || 'Guide'}!</h2>
                <p className="text-gray-600">👋 Ready to explore?</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-semibold mb-2">Quick Tips</h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Be on time.</li>
                  <li>Keep guests engaged.</li>
                  <li>Carry extra water.</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-semibold mb-2">Daily Quote</h3>
                <p className="text-gray-600">{dailyQuote}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-semibold mb-2">Profile Completion</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{profileCompletion}% complete</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                <p className="text-gray-600">📝 You updated your profile 2 days ago.</p>
              </div>
            </div>
            {/* Safari stats */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
            </div>
          </div>
        )}

        {/* Safari Packages tab content */}
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
                  <button onClick={() => setIsFormVisible(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    Add New Package
                  </button>
                </div>
                <SafariList safaris={safaris} onEdit={handleEditSafari} onDelete={handleDeleteSafari} />
              </>
            )}
          </div>
        )}

        {/* Profile tab content */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Guide Profile</h2>
            {isEditingProfile ? (
              // Profile edit form
              <form onSubmit={handleUpdateProfile} className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile picture upload */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-2 border-blue-500">
                      {profilePicturePreview ? (
                        <img src={profilePicturePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : profile?.profilePicture ? (
                        <img src={`http://localhost:8070/${profile.profilePicture}`} alt="Current Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="block w-full text-sm text-gray-500..." />
                  </div>
                  {/* Profile fields */}
                  <div><input type="text" name="name" value={profileFormData.name} onChange={handleProfileFormChange} className="..." required /></div>
                  <div><input type="number" name="experienceYears" value={profileFormData.experienceYears} onChange={handleProfileFormChange} className="..." required min="0" /></div>
                  <div className="md:col-span-2"><textarea name="specialties" value={profileFormData.specialties} onChange={handleProfileFormChange} rows="3" className="..."></textarea></div>
                </div>
                {/* Form buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="...">Cancel</button>
                  <button type="submit" className="...">Save Changes</button>
                </div>
              </form>
            ) : (
              // Profile display view
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-2 border-blue-500">
                      {profile.profilePicture ? (
                        <img src={`http://localhost:8070/${profile.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
                      )}
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setIsEditingProfile(true)}>
                      Edit Profile
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="space-y-4">
                    <div><h3 className="text-lg font-medium text-gray-800">Name</h3><p className="mt-1 text-gray-600">{profile.name}</p></div>
                    <div><h3 className="text-lg font-medium text-gray-800">Experience</h3><p className="mt-1 text-gray-600">{profile.experienceYears} years</p></div>
                    <div><h3 className="text-lg font-medium text-gray-800">Specialties</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {profile.specialties && profile.specialties.length > 0 ? (
                          profile.specialties.map((specialty, index) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{specialty}</span>
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