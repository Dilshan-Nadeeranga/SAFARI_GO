import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../Componet/CSS/Dashboard.css';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { downloadPdfReport } from '../../../utils/pdfDownloader';

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
      labels: ['Pending',  'Responded',],
      datasets: [
        {
          data: [
            stats.byStatus.pending, 
            stats.byStatus.responded,
           
          ],
          backgroundColor: [
            'rgba(255, 206, 86, 0.6)', // pending - yellow
      
            'rgba(153, 102, 255, 0.6)', // responded - purple
            
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
      
            'rgba(153, 102, 255, 1)',
            
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
   
      case 'responded':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Responded</span>;
     
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

  // Handle PDF report download
  const handleDownloadPdfReport = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to download this report');
      return;
    }

    try {
      // Calculate date range based on timeRange
      let startDate = 'All Time';
      let endDate = new Date().toLocaleDateString();
      
      if (timeRange !== 'all') {
        const now = new Date();
        const end = new Date(now);
        let start = new Date(now);
        
        if (timeRange === 'week') {
          start.setDate(now.getDate() - 7);
          startDate = start.toLocaleDateString();
        } else if (timeRange === 'month') {
          start.setMonth(now.getMonth() - 1);
          startDate = start.toLocaleDateString();
        } else if (timeRange === 'year') {
          start.setFullYear(now.getFullYear() - 1);
          startDate = start.toLocaleDateString();
        }
      }

      // Prepare data for PDF report
      const reportData = {
        title: 'Feedback Summary Report',
        generatedDate: new Date().toLocaleDateString(),
        filters: {
          status: filter === 'all' ? 'All Statuses' : filter.charAt(0).toUpperCase() + filter.slice(1),
          timeRange: timeRange === 'all' ? 'All Time' : `Last ${timeRange === 'week' ? '7 Days' : timeRange === 'month' ? '30 Days' : 'Year'}`,
          dateRange: {
            start: startDate,
            end: endDate
          }
        },
        stats: {
          total: filterStats.total,
          completed: filterStats.byStatus.resolved,
          cancelled: filterStats.byStatus.pending,
          totalRevenue: parseInt(filterStats.avgRating * 100) // Using avgRating * 100 as a placeholder value
        },
        bookings: filteredFeedbacks.map(item => ({
          _id: item._id || 'N/A',
          userName: item.userId ? (item.userId.name || item.userId.email) : 'Anonymous',
          safariName: `Rating: ${item.rating}/5`,
          formattedDate: new Date(item.createdAt).toLocaleDateString(),
          numberOfPeople: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Unknown',
          status: item.guideId ? (item.guideId.name || item.guideId.email) : (item.status === 'pending' ? 'Not Assigned' : 'Admin'),
          formattedAmount: item.text ? (item.text.substring(0, 30) + (item.text.length > 30 ? '...' : '')) : 'No feedback text provided'
        }))
      };

      // Custom columns for feedback report
      const feedbackColumns = [
        { header: 'ID', dataKey: '_id' },
        { header: 'Customer', dataKey: 'userName' },
        { header: 'Rating', dataKey: 'safariName' },
        { header: 'Date', dataKey: 'formattedDate' },
        { header: 'Status', dataKey: 'numberOfPeople' },
        { header: 'Assigned To', dataKey: 'status' },
        { header: 'Feedback', dataKey: 'formattedAmount' }
      ];

      // Call PDF downloader with custom data
      downloadPdfReport(
        null, // No endpoint means client-side generation
        token,
        reportData,
        () => console.log('Feedback report generated successfully'),
        (err) => {
          console.error('Error generating feedback report:', err);
          alert('Failed to generate PDF report. Please try again.');
        },
        feedbackColumns
      );
    } catch (error) {
      console.error('Error preparing feedback report data:', error);
      alert('Failed to generate PDF report. Please try again.');
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Feedback Tracking Report</h2>
            
            <button 
              onClick={handleDownloadPdfReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Report
            </button>
          </div>
          
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
                  <option value="responded">Responded</option>
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
          
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Feedback Status Distribution</h3>
              <div style={{ height: '300px' }}>
                <Pie data={getPieChartData()} options={{ maintainAspectRatio: false }} />
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
//CSS styles for line-clamp (tailwindcss)
export default AdminFeedbackReport;
