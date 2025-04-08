import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { downloadPdfReport } from '../../../utils/pdfDownloader';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';

const AdminBookingHistoryRevenueFix = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [users, setUsers] = useState({});
  const [safaris, setSafaris] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    yetToRefund: 0,
    refunded: 0,
    totalRevenue: 0,
    netRevenue: 0,
    refundedAmount: 0
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
        
        // Try to fetch safari details
        try {
          const safarisResponse = await axios.get('http://localhost:8070/safaris/all', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const safarisMap = {};
          safarisResponse.data.forEach(safari => {
            safarisMap[safari._id] = safari;
          });
          setSafaris(safarisMap);
        } catch (safariErr) {
          console.warn('Could not fetch safaris:', safariErr);
          setSafaris({});
        }
        
        // Try to fetch user details
        try {
          const usersResponse = await axios.get('http://localhost:8070/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const usersMap = {};
          usersResponse.data.forEach(user => {
            usersMap[user._id] = user;
          });
          setUsers(usersMap);
        } catch (userErr) {
          console.warn('Could not fetch users:', userErr);
          setUsers({});
        }
        
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
    // Count bookings by status
    const confirmed = bookingsData.filter(b => b.status === 'confirmed').length;
    const completed = bookingsData.filter(b => b.status === 'completed').length;
    const cancelled = bookingsData.filter(b => b.status === 'cancelled').length;
    const yetToRefund = bookingsData.filter(b => b.status === 'yet_to_refund').length;
    const refunded = bookingsData.filter(b => b.status === 'refunded').length;
    
    // Calculate total gross revenue from confirmed/completed bookings
    const grossRevenue = bookingsData
      .filter(b => ['confirmed', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + (b.amount || 0), 0);
    
    // Calculate refunded amount
    const refundedAmount = bookingsData
      .filter(b => b.status === 'refunded')
      .reduce((sum, b) => sum + (b.refundAmount || 0), 0);
    
    // Calculate net revenue (gross revenue minus refunded amount)
    const netRevenue = grossRevenue - refundedAmount;
    
    const stats = {
      total: bookingsData.length,
      confirmed,
      completed,
      cancelled,
      yetToRefund,
      refunded,
      totalRevenue: grossRevenue,
      netRevenue,
      refundedAmount
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

    // Recalculate stats based on filtered data
    calculateBookingStats(
      filterValue === 'all' 
        ? bookings 
        : bookings.filter(b => b.status === filterValue)
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Add this new function to show a breakdown of refunds by policy tier
  const getRefundBreakdown = () => {
    const fullRefunds = bookings
      .filter(b => b.status === 'refunded' && b.refundPercentage === 100)
      .reduce((sum, b) => sum + (b.refundAmount || 0), 0);
      
    const partialRefunds = bookings
      .filter(b => b.status === 'refunded' && b.refundPercentage === 50)
      .reduce((sum, b) => sum + (b.refundAmount || 0), 0);
      
    return { fullRefunds, partialRefunds };
  };
  
  const refundBreakdown = getRefundBreakdown();

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Booking Revenue Report</h1>
          
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
              <h3 className="text-gray-500 text-sm">Awaiting Refund</h3>
              <p className="text-2xl font-bold text-orange-600">{bookingStats.yetToRefund}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Refunded</h3>
              <p className="text-2xl font-bold text-purple-600">{bookingStats.refunded}</p>
            </div>
          </div>
          
          {/* Revenue Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Gross Revenue</h3>
              <p className="text-2xl font-bold text-blue-600">Rs. {bookingStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Refunded Amount</h3>
              <p className="text-2xl font-bold text-red-600">Rs. {bookingStats.refundedAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-2 border-green-200">
              <h3 className="text-gray-500 text-sm">Net Revenue</h3>
              <p className="text-2xl font-bold text-green-600">Rs. {bookingStats.netRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">(Gross Revenue - Refunds)</p>
            </div>
          </div>
          
          {/* Refund Breakdown */}
          {bookingStats.refundedAmount > 0 && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="font-medium text-lg mb-2">Refund Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-green-100 bg-green-50 p-3 rounded-md">
                  <div className="text-sm text-gray-600">100% Refunds (7+ days)</div>
                  <div className="font-medium text-lg text-green-800">Rs. {refundBreakdown.fullRefunds.toLocaleString()}</div>
                </div>
                <div className="border border-yellow-100 bg-yellow-50 p-3 rounded-md">
                  <div className="text-sm text-gray-600">50% Refunds (4-6 days)</div>
                  <div className="font-medium text-lg text-yellow-800">Rs. {refundBreakdown.partialRefunds.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Filter section */}
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
                  <option value="yet_to_refund">Awaiting Refund</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Refund Policy Information */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-medium text-lg mb-2">Refund Policy Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-green-100 bg-green-50 p-3 rounded-md">
                <div className="font-medium text-green-800">100% Refund</div>
                <p className="text-sm mt-1">For cancellations 7 or more days before the trip</p>
              </div>
              <div className="border border-yellow-100 bg-yellow-50 p-3 rounded-md">
                <div className="font-medium text-yellow-800">50% Refund</div>
                <p className="text-sm mt-1">For cancellations 4-6 days before the trip</p>
              </div>
              <div className="border border-red-100 bg-red-50 p-3 rounded-md">
                <div className="font-medium text-red-800">No Refund</div>
                <p className="text-sm mt-1">For cancellations 0-3 days before the trip</p>
              </div>
            </div>
          </div>
          
          {/* Bookings list can go here if needed */}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingHistoryRevenueFix;
