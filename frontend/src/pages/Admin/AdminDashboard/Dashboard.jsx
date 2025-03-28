import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
// Fix the import path for Widget
import Widget from '../Componet/pages/Widget';
import Chart from '../Componet/chart/Chart';
import Table from './Table';
import "../Componet/CSS/Dashboard.css";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/LoginForm');
      return;
    }
    
    const fetchAdminDashboardData = async () => {
      try {
        // Fetch system stats for the admin dashboard
        const statsResponse = await axios.get('http://localhost:8070/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch recent notifications
        const notificationsResponse = await axios.get('http://localhost:8070/users/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch recent users
        const usersResponse = await axios.get('http://localhost:8070/users/all', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Set revenue data for chart
        const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
          const month = new Date();
          month.setMonth(month.getMonth() - i);
          return {
            name: month.toLocaleString('default', { month: 'short' }),
            revenue: statsResponse.data.revenueByMonth[5-i] || 0 // Reverse the order to show oldest to newest
          };
        }).reverse();

        setSystemStats(statsResponse.data);
        setRevenueData(revenueByMonth);
        setNotifications(notificationsResponse.data);
        setRecentUsers(usersResponse.data.slice(0, 8)); // Get only the 8 most recent users
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load admin dashboard');
        setLoading(false);
      }
    };
    
    fetchAdminDashboardData();
  }, [navigate]);

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
        
        <div className="charts">
          <Chart 
            title="Last 6 Months Revenue" 
            aspect={2 / 1} 
            data={revenueData}
            dataKey="revenue"
          />
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