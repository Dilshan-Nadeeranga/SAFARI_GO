import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserTrips = () => {
  const [bookings, setBookings] = useState([]);
  const [safaris, setSafaris] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // Add this state
  
  // Add states for booking update
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updateData, setUpdateData] = useState({
    numberOfPeople: 1,
    date: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/LoginForm');
          return;
        }
        
        // Fetch user bookings
        const bookingsResponse = await axios.get('http://localhost:8070/bookings/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBookings(bookingsResponse.data);
        
        // Fetch safari details for each booking
        const safariDetails = {};
        for (const booking of bookingsResponse.data) {
          try {
            const safariResponse = await axios.get(`http://localhost:8070/safaris/${booking.safariId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            safariDetails[booking.safariId] = safariResponse.data;
          } catch (err) {
            console.error(`Error fetching safari ${booking.safariId}:`, err);
          }
        }
        setSafaris(safariDetails);
        
        // Fetch user notifications - with better error handling
        try {
          const notificationsResponse = await axios.get('http://localhost:8070/users/notifications/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const userNotifications = notificationsResponse.data;
          setNotifications(userNotifications);
          setUnreadCount(userNotifications.filter(n => !n.read).length);
        } catch (notifErr) {
          console.warn('Could not fetch notifications:', notifErr);
          // Don't fail the whole component if just notifications fail
          setNotifications([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user trips:', err);
        setError('Failed to load trips');
        setLoading(false);
      }
    };

    fetchUserTrips();
  }, [navigate]);

  // Mark notification as read
  const handleNotificationClick = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8070/users/notifications/${notificationId}/read`, {}, {
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

  // Add this function to handle opening the update modal
  const handleUpdateClick = (booking) => {
    setSelectedBooking(booking);
    setUpdateData({
      numberOfPeople: booking.numberOfPeople,
      date: new Date(booking.date).toISOString().split('T')[0]
    });
    setIsUpdateModalOpen(true);
  };

  // Add function to handle cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8070/bookings/update/${bookingId}`,
        { status: 'yet_to_refund' },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update the local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: 'yet_to_refund' } 
          : booking
      ));
      
      alert('Booking cancelled successfully. Your refund will be processed according to the refund policy.');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  // Add function to handle update form changes
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add function to handle update submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError('');
    
    // Validate the form data
    const selectedDate = new Date(updateData.date);
    if (selectedDate <= new Date()) {
      setUpdateError('Please select a future date');
      setUpdateLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8070/bookings/update/${selectedBooking._id}`,
        {
          numberOfPeople: updateData.numberOfPeople,
          date: updateData.date,
          // Calculate new amount based on number of people and safari price
          amount: safaris[selectedBooking.safariId].price * updateData.numberOfPeople
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state with the updated booking
      setBookings(bookings.map(booking => 
        booking._id === selectedBooking._id 
          ? response.data.booking 
          : booking
      ));
      
      setIsUpdateModalOpen(false);
      alert('Booking updated successfully');
    } catch (err) {
      console.error('Error updating booking:', err);
      setUpdateError('Failed to update booking. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Format booking status for display
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending_payment':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending Payment</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Confirmed</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Completed</span>;
      case 'yet_to_refund':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Cancellation Pending</span>;
      case 'refunded':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Refunded</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Cancelled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
    }
  };

  // Add this function to render notification details based on type
  const renderNotificationDetails = (notification) => {
    if (notification.type === 'REFUND_PROCESSED' && notification.details?.refundAmount) {
      return (
        <div className="mt-1 p-2 bg-green-50 border border-green-100 rounded-md">
          <p className="text-sm text-green-700">
            <span className="font-medium">Refund Amount:</span> Rs. {notification.details.refundAmount.toLocaleString()}
          </p>
          {notification.details.processedDate && (
            <p className="text-xs text-green-600">
              Processed on: {new Date(notification.details.processedDate).toLocaleDateString()}
            </p>
          )}
        </div>
      );
    } 
    
    if (notification.type === 'BOOKING_CANCELLATION_RECEIVED' && notification.details?.refundAmount) {
      return (
        <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Expected Refund:</span> Rs. {notification.details.refundAmount.toLocaleString()}
            {notification.details.refundPercentage && (
              <span className="ml-1">({notification.details.refundPercentage}%)</span>
            )}
          </p>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your trips...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Trips</h1>
        
        {/* Notifications dropdown */}
        <div className="relative">
          <button 
            className="relative p-2 bg-white rounded-full shadow-sm"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} // Fix this line
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications panel */}
          {notifications.length > 0 && isNotificationsOpen && ( // Update this condition
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10">
              <div className="p-2">
                <h3 className="text-lg font-semibold px-3 py-2">Notifications</h3>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map(notification => (
                    <div 
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification._id)}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''} border-b last:border-b-0`}
                    >
                      <p className="font-medium text-sm">{notification.message}</p>
                      {renderNotificationDetails(notification)}
                      <span className="text-xs text-gray-500 block mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">You have no bookings yet.</p>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => navigate('/user/safaris')}
          >
            Explore Safaris
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => {
            const safari = safaris[booking.safariId];
            return (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 p-4">
                    {safari && safari.images && safari.images.length > 0 ? (
                      <img
                        src={`http://localhost:8070/${safari.images[0]}`}
                        alt={safari?.title || "Safari"}
                        className="w-full h-40 object-cover rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Safari';
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:w-3/4 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {safari?.title || "Safari Package"}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Location:</span> {safari?.location || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">People:</span> {booking.numberOfPeople}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Amount:</span> Rs. {booking.amount?.toLocaleString() || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Booking ID:</span> {booking._id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Add buttons for update and cancel */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && 
                     booking.status !== 'yet_to_refund' && booking.status !== 'refunded' && (
                      <>
                        <button
                          onClick={() => handleUpdateClick(booking)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          disabled={booking.status === 'completed'}
                        >
                          Update Details
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Cancel Trip
                        </button>
                      </>
                    )}
                    {(booking.status === 'yet_to_refund' || booking.status === 'refunded') && (
                      <div className="text-sm text-gray-600">
                        {booking.status === 'yet_to_refund' 
                          ? 'Your cancellation is pending refund review.' 
                          : 'Your booking has been refunded.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Add Update Booking Modal */}
      {isUpdateModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Update Booking</h2>
            
            {updateError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                {updateError}
              </div>
            )}
            
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of People
                </label>
                <input
                  type="number"
                  name="numberOfPeople"
                  min="1"
                  max={safaris[selectedBooking.safariId]?.capacity || 10}
                  value={updateData.numberOfPeople}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={updateData.date}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Updating...' : 'Update Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTrips;