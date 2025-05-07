import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Widget from '../Componet/pages/Widget';
import Chart from '../Componet/chart/Chart';
import Table from './Table';
import "../Componet/CSS/Dashboard.css";
import PremiumStatistics from './PremiumStatistics';
import UserTypeStatistics from './UserTypeStatistics';
import { downloadPdfReport } from '../../../utils/pdfDownloader';

const Dashboard = () => {
  const navigate = useNavigate();
  const [systemStats, setSystemStats] = useState({
    users: 0,
    guides: 0,
    vehicleOwners: 0,
    bookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    revenue: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/LoginForm');
      return;
    }
    
    const fetchAdminDashboardData = async () => {
      try {
        const statsResponse = await axios.get('http://localhost:8070/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const notificationsResponse = await axios.get('http://localhost:8070/users/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const usersResponse = await axios.get('http://localhost:8070/users/all', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const bookingsResponse = await axios.get('http://localhost:8070/bookings?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
          const month = new Date();
          month.setMonth(month.getMonth() - i);
          return {
            name: month.toLocaleString('default', { month: 'short' }),
            revenue: statsResponse.data.revenueByMonth[5-i] || 0
          };
        }).reverse();

        setSystemStats(statsResponse.data);
        setRevenueData(revenueByMonth);
        setNotifications(notificationsResponse.data);
        setRecentUsers(usersResponse.data.slice(0, 8));
        setRecentBookings(bookingsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load admin dashboard');
        setLoading(false);
      }
    };
    
    fetchAdminDashboardData();
  }, [navigate]);

  const handleDownloadPremiumReport = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to download this report');
      return;
    }
    
    const url = selectedPlan === 'all'
      ? 'http://localhost:8070/admin/premium-users/report'
      : `http://localhost:8070/admin/premium-users/report?plan=${selectedPlan}`;
    
    downloadPdfReport(url, token);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading admin dashboard...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="widgets">
          <Widget type="users" count={systemStats.users} diff={4} />
          <Widget type="guides" count={systemStats.guides} diff={1} />
          <Widget type="vehicle-owners" count={systemStats.vehicleOwners} diff={2} />
          <Widget type="bookings" count={systemStats.bookings} diff={8} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Premium Users Report</h2>
              <p className="text-gray-600 text-sm">
                Active Premium Users: {systemStats.premiumUsers || 0}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Plans</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
              <button 
                onClick={handleDownloadPremiumReport}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-blue-800 transition flex items-center shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserTypeStatistics 
            regularUsers={systemStats.regularUsers || systemStats.users - (systemStats.premiumUsers || 0)} 
            premiumUsers={systemStats.premiumUsers || 0} 
          />
          <PremiumStatistics />
        </div>
        
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Bookings</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/admin/booking-revenue')}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Revenue
                </button>
                <button
                  onClick={() => navigate('/admin/booking-history')}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View All
                </button>
              </div>
            </div>
            
            {recentBookings.length === 0 ? (
              <p className="text-gray-500">No recent bookings</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{booking._id.substring(0, 6)}...</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{booking.Fname || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}
                          >
                            {booking.status === 'pending_payment' ? 'Pending Payment' : booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Rs. {booking.amount?.toLocaleString() || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="listContainer">
          <div className="listTitle">Latest Users</div>
          <Table data={recentUsers} />
        </div>
        
        <div className="notifications-container mt-6 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <div className="notifications-list space-y-4">
              {notifications.slice(0, 5).map(notification => (
                <div 
                  key={notification._id} 
                  className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{notification.type}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1">{notification.message}</p>
                </div>
              ))}
              {notifications.length > 5 && (
                <div className="text-right">
                  <button 
                    onClick={() => navigate('/admin/notifications')}
                    className="text-blue-600 hover:underline"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;