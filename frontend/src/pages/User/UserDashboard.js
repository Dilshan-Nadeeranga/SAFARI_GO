import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Remove recharts imports

const UserDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    canceled: 0,
    total: 0
  });
  // Add premium status state
  const [premiumStatus, setPremiumStatus] = useState({
    isPremium: false,
    plan: null,
    premiumUntil: null,
    discountRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication and role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'user') {
      navigate('/LoginForm');
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await axios.get('http://localhost:8070/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch user bookings (assuming you have a bookings endpoint)
        const bookingsResponse = await axios.get('http://localhost:8070/bookings/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch premium status
        const premiumResponse = await axios.get('http://localhost:8070/users/premium/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile(profileResponse.data);
        setBookings(bookingsResponse.data);
        setPremiumStatus({
          isPremium: premiumResponse.data.isPremium,
          plan: premiumResponse.data.plan,
          premiumUntil: premiumResponse.data.premiumUntil,
          discountRate: premiumResponse.data.discountRate
        });
        
        // Calculate statistics
        const upcoming = bookingsResponse.data.filter(b => b.status === 'upcoming').length;
        const completed = bookingsResponse.data.filter(b => b.status === 'completed').length;
        const canceled = bookingsResponse.data.filter(b => b.status === 'canceled').length;
        
        setStats({
          upcoming,
          completed,
          canceled,
          total: bookingsResponse.data.length
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  // Remove chart data

  if (loading) return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  // Helper function to format subscription details
  const getSubscriptionDisplay = () => {
    if (premiumStatus.isPremium) {
      const planName = premiumStatus.plan?.charAt(0).toUpperCase() + premiumStatus.plan?.slice(1) || 'Premium';
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-amber-600">{planName}</span>
          <div className="mt-1.5 flex items-center">
            <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2">
              {premiumStatus.discountRate}% OFF
            </span>
            <span className="text-xs text-gray-500">
              until {new Date(premiumStatus.premiumUntil).toLocaleDateString()}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-600">Free</span>
          <button 
            onClick={() => navigate('/user/subscriptions')}
            className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Upgrade Now
          </button>
        </div>
      );
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Welcome, {profile?.name || 'User'}!</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/vehicles')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0018 5h-1V4a1 1 0 00-1-1H3z" />
            </svg>
            Explore Vehicles
          </button>
          
          {/* New button to view rentals */}
          <button
            onClick={() => navigate('/user/rentals')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            My Rentals
          </button>

          <button
            onClick={() => navigate('/user/feedback')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            View My Feedback
          </button>
          <button
            onClick={() => navigate('/feedback')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Leave Feedback
          </button>
        </div>
      </div>
      
      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Total Bookings</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Upcoming Trips</h3>
          <p className="text-2xl font-bold text-indigo-600">{stats.upcoming}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Completed Trips</h3>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm flex items-center">
            Subscription
            {premiumStatus.isPremium && (
              <span className="ml-2 flex-shrink-0">
                <span className="h-4 w-4 flex items-center justify-center bg-yellow-400 rounded-full">
                  <span className="text-xs">✨</span>
                </span>
              </span>
            )}
          </h3>
          {getSubscriptionDisplay()}
        </div>
      </div>
      
      {/* Add premium upgrade banner if not premium */}
      {!premiumStatus.isPremium && (
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg shadow-md mb-8 border border-purple-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-purple-800 font-semibold text-lg mb-1">Upgrade to Premium Membership!</h3>
              <p className="text-purple-700">Get up to 15% discount on all safari packages and exclusive benefits.</p>
            </div>
            <button 
              onClick={() => navigate('/user/subscriptions')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md flex items-center"
            >
              <span className="mr-2">✨</span> View Premium Plans
            </button>
          </div>
        </div>
      )}
      
      {/* Remove Charts section and replace with simple stats */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Trip Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-indigo-600 font-medium">Upcoming</h3>
            <p className="text-2xl">{stats.upcoming}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-green-600 font-medium">Completed</h3>
            <p className="text-2xl">{stats.completed}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-red-600 font-medium">Canceled</h3>
            <p className="text-2xl">{stats.canceled}</p>
          </div>
        </div>
      </div>
      
      {/* Add a prominent Explore Vehicles section */}
      <section className="container mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Need transportation for your safari?</h2>
            <p className="text-gray-600 mb-4 md:mb-0">Browse our selection of high-quality safari vehicles with experienced drivers.</p>
          </div>
          <button
            onClick={() => navigate('/vehicles')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0018 5h-1V4a1 1 0 00-1-1H3z" />
            </svg>
            Explore Vehicles
          </button>
        </div>
      </section>
      
      {/* Recent bookings - keep this section as is */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking._id.substring(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length > 5 && (
              <div className="py-3 px-6 text-right">
                <button 
                  onClick={() => navigate('/user/trips')}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View all bookings
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;