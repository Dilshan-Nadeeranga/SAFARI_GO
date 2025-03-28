import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';

const AdminBookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [safaris, setSafaris] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    completedRevenue: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/LoginForm');
          return;
        }

        // Fetch all bookings
        const bookingsResponse = await axios.get('http://localhost:8070/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBookings(bookingsResponse.data);
        setFilteredBookings(bookingsResponse.data);
        
        // Fetch safari details for each booking
        const safariDetails = {};
        const userDetails = {};
        
        // Fetch all safaris in one request (more efficient)
        const safarisResponse = await axios.get('http://localhost:8070/safaris/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Create a map for faster lookup
        const safariMap = {};
        safarisResponse.data.forEach(safari => {
          safariMap[safari._id] = safari;
        });
        
        // Fetch all users in one request
        const usersResponse = await axios.get('http://localhost:8070/users/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Create a map for faster lookup
        const userMap = {};
        usersResponse.data.forEach(user => {
          userMap[user._id] = user;
        });
        
        // Update the state with all the fetched data
        setSafaris(safariMap);
        setUsers(userMap);
        
        // Calculate booking stats
        calculateBookingStats(bookingsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking history:', err);
        setError('Failed to load booking history');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const calculateBookingStats = (bookingsData) => {
    const stats = {
      total: bookingsData.length,
      confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
      completed: bookingsData.filter(b => b.status === 'completed').length,
      cancelled: bookingsData.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookingsData.reduce((sum, b) => sum + (b.amount || 0), 0),
      completedRevenue: bookingsData
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.amount || 0), 0)
    };
    
    setBookingStats(stats);
  };

  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    setFilter(filterValue);
    
    if (filterValue === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === filterValue));
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyDateFilter = () => {
    if (!dateRange.start && !dateRange.end) {
      // If no dates selected, reset to current filter
      handleFilterChange({ target: { value: filter } });
      return;
    }

    const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0); // Beginning of time
    const endDate = dateRange.end ? new Date(dateRange.end) : new Date(8640000000000000); // End of time

    const filtered = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      const matchesDate = bookingDate >= startDate && bookingDate <= endDate;
      const matchesStatus = filter === 'all' || booking.status === filter;
      return matchesDate && matchesStatus;
    });

    setFilteredBookings(filtered);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const exportToCsv = () => {
    const headers = [
      'Booking ID', 
      'User', 
      'Safari', 
      'Date', 
      'People', 
      'Amount', 
      'Status'
    ];
    
    const csvData = filteredBookings.map(booking => {
      const safari = safaris[booking.safariId];
      const user = users[booking.userId];
      return [
        booking._id,
        user ? `${user.name || ''} ${user.Lname || ''}` : 'Unknown',
        safari ? safari.title : 'Unknown Safari',
        formatDate(booking.date),
        booking.numberOfPeople,
        booking.amount,
        booking.status
      ];
    });
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `booking-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="home">
        <Sidebar />
        <div className="homeContainer">
          <div className="flex justify-center items-center h-screen">
            <p>Loading booking history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <Sidebar />
        <div className="homeContainer">
          <div className="text-red-500 text-center py-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Booking History Report</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Bookings</h3>
              <p className="text-2xl font-bold">{bookingStats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Completed Trips</h3>
              <p className="text-2xl font-bold text-green-600">{bookingStats.completed}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Cancelled Bookings</h3>
              <p className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Revenue</h3>
              <p className="text-2xl font-bold text-blue-600">Rs. {bookingStats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={filter}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Bookings</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateRangeChange}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateRangeChange}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="self-end">
                <button
                  onClick={applyDateFilter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
              
              <div className="self-end ml-auto">
                <button
                  onClick={exportToCsv}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Export to CSV
                </button>
              </div>
            </div>
          </div>
          
          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Safari</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">People</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map(booking => {
                    const safari = safaris[booking.safariId];
                    const user = users[booking.userId];
                    const guide = safari && users[safari.guideId];
                    
                    return (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking._id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user ? `${user.name || ''} ${user.Lname || ''}` : 'Unknown User'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{safari ? safari.title : 'Unknown Safari'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{guide ? guide.name : 'Unknown Guide'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(booking.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.numberOfPeople}</td>
                        <td className="px-6 py-4 whitespace-nowrap">Rs. {booking.amount?.toLocaleString() || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}
                          >
                            {booking.status === 'pending_payment' ? 'Pending Payment' : 
                             booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No bookings found matching the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingHistory;
