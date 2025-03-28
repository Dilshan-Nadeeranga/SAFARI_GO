import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../Componet/CSS/Dashboard.css';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminFeedbackReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, assigned, responded, resolved
  const [timeRange, setTimeRange] = useState('all'); // all, week, month, year
  const [sortBy, setSortBy] = useState('date'); // date, rating, status
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  
  useEffect(() => {
    const fetchFeedbackReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/feedback/report', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReportData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching feedback report:', err);
        setError('Failed to load feedback report data');
        setLoading(false);
      }
    };
    
    fetchFeedbackReport();
  }, []);
  
  // Function to filter feedbacks based on selected criteria
  const getFilteredFeedbacks = () => {
    if (!reportData || !reportData.feedbacks) return [];
    
    let filtered = [...reportData.feedbacks];
    
    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(f => f.status === filter);
    }
    
    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date();
      const ranges = {
        week: new Date(now.setDate(now.getDate() - 7)),
        month: new Date(now.setMonth(now.getMonth() - 1)),
        year: new Date(now.setFullYear(now.getFullYear() - 1))
      };
      filtered = filtered.filter(f => new Date(f.createdAt) > ranges[timeRange]);
    }
    
    // Sort feedbacks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        case 'status':
          return sortOrder === 'asc' 
            ? a.status.localeCompare(b.status) 
            : b.status.localeCompare(a.status);
        case 'date':
        default:
          return sortOrder === 'asc' 
            ? new Date(a.createdAt) - new Date(b.createdAt) 
            : new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    return filtered;
  };
  
  // Calculate statistics for the filtered data
  const getFilterStats = () => {
    const filtered = getFilteredFeedbacks();
    
    const stats = {
      total: filtered.length,
      avgRating: filtered.length 
        ? (filtered.reduce((sum, f) => sum + f.rating, 0) / filtered.length).toFixed(1) 
        : 0,
      byStatus: {
        pending: filtered.filter(f => f.status === 'pending').length,
        assigned: filtered.filter(f => f.status === 'assigned').length,
        responded: filtered.filter(f => f.status === 'responded').length,
        resolved: filtered.filter(f => f.status === 'resolved').length
      }
    };
    
    return stats;
  };
  
  // Prepare chart data
  const getPieChartData = () => {
    const stats = getFilterStats();
    
    return {
      labels: ['Pending', 'Assigned', 'Responded', 'Resolved'],
      datasets: [
        {
          data: [
            stats.byStatus.pending,
            stats.byStatus.assigned, 
            stats.byStatus.responded,
            stats.byStatus.resolved
          ],
          backgroundColor: [
            'rgba(255, 206, 86, 0.6)', // pending - yellow
            'rgba(54, 162, 235, 0.6)', // assigned - blue
            'rgba(153, 102, 255, 0.6)', // responded - purple
            'rgba(75, 192, 192, 0.6)', // resolved - green
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Format feedback status badge
  const getFeedbackStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
      case 'assigned':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Assigned</span>;
      case 'responded':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Responded</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Resolved</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
    }
  };
  
  // Handle sort header click
  const handleSortClick = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  if (loading) return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4">Loading feedback report...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4 text-red-500">{error}</div>
      </div>
    </div>
  );
  
  const filteredFeedbacks = getFilteredFeedbacks();
  const filterStats = getFilterStats();

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Feedback Tracking Report</h2>
          
          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="responded">Responded</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Feedback</h3>
              <p className="text-2xl font-bold">{filterStats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Average Rating</h3>
              <p className="text-2xl font-bold">{filterStats.avgRating} / 5</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <h3 className="text-yellow-800 text-sm">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{filterStats.byStatus.pending}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h3 className="text-blue-800 text-sm">Assigned</h3>
              <p className="text-2xl font-bold text-blue-600">{filterStats.byStatus.assigned}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <h3 className="text-green-800 text-sm">Resolved</h3>
              <p className="text-2xl font-bold text-green-600">{filterStats.byStatus.resolved}</p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Feedback Status Distribution</h3>
              <div style={{ height: '300px' }}>
                <Pie data={getPieChartData()} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Resolution Time Tracking</h3>
              <div style={{ height: '300px' }} className="flex items-center justify-center">
                <p className="text-gray-500">No resolution time data available</p>
              </div>
            </div>
          </div>
          
          {/* Feedback Listing */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Feedback Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortClick('date')}
                    >
                      Date
                      {sortBy === 'date' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortClick('rating')}
                    >
                      Rating
                      {sortBy === 'rating' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortClick('status')}
                    >
                      Status
                      {sortBy === 'status' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFeedbacks.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.userId ? (item.userId.name || item.userId.email) : 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-400">{"★".repeat(item.rating)}</span>
                          <span className="text-gray-300">{"★".repeat(5 - item.rating)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2">{item.text}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getFeedbackStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.guideId ? 
                          (item.guideId.name || item.guideId.email) : 
                          (item.status === 'pending' ? 'Not Assigned' : 'Admin')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination could be added here */}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackReport;
