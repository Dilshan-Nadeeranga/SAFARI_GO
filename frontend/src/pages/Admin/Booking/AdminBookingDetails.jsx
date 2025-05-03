import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';

const AdminBookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [safari, setSafari] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [calculatedRefund, setCalculatedRefund] = useState({
    daysUntilTrip: null,
    refundPercentage: 0,
    refundAmount: 0
  });

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/LoginForm');
          return;
        }

        // Fetch booking details
        const bookingResponse = await axios.get(`http://localhost:8070/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBooking(bookingResponse.data);
        
        // Calculate refund if this is a cancelled booking with no refund info
        if ((bookingResponse.data.status === 'cancelled' || bookingResponse.data.status === 'yet_to_refund') && 
            !bookingResponse.data.refundAmount && 
            !bookingResponse.data.refundPercentage) {
          calculateRefund(bookingResponse.data);
        }
        
        // Fetch safari details
        if (bookingResponse.data.safariId) {
          const safariResponse = await axios.get(`http://localhost:8070/safaris/${bookingResponse.data.safariId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSafari(safariResponse.data);
        }
        
        // Fetch user details
        if (bookingResponse.data.userId) {
          const userResponse = await axios.get(`http://localhost:8070/admin/users/${bookingResponse.data.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(userResponse.data);
        }
        
        setStatusUpdate(bookingResponse.data.status);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, navigate]);

  const calculateRefund = (bookingData) => {
    const tripDate = new Date(bookingData.date);
    const today = new Date();
    const daysUntilTrip = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
    
    let refundPercentage = 0;
    if (daysUntilTrip >= 7) {
      refundPercentage = 100;
    } else if (daysUntilTrip >= 4 && daysUntilTrip <= 6) {
      refundPercentage = 50;
    }
    
    const refundAmount = (bookingData.amount * refundPercentage) / 100;
    
    setCalculatedRefund({
      daysUntilTrip,
      refundPercentage,
      refundAmount
    });
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      const updateData = { status: statusUpdate };
      
      if (statusUpdate === 'yet_to_refund' && calculatedRefund.daysUntilTrip) {
        updateData.daysUntilTrip = calculatedRefund.daysUntilTrip;
        updateData.refundPercentage = calculatedRefund.refundPercentage;
        updateData.refundAmount = calculatedRefund.refundAmount;
      }
      
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8070/bookings/update/${bookingId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local booking state with new status
      setBooking({...booking, status: statusUpdate});
      
      // Show success message with different text based on the update
      if (statusUpdate === 'refunded') {
        alert(`Refund processed successfully. Amount: Rs. ${booking.refundAmount?.toLocaleString() || '0'}`);
      } else {
        alert('Booking status updated successfully');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="home">
        <Sidebar />
        <div className="homeContainer">
          <div className="flex justify-center items-center h-screen">
            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="home">
        <Sidebar />
        <div className="homeContainer">
          <div className="p-4">
            <div className="bg-red-100 p-4 rounded-md mb-4">
              <p className="text-red-700">{error || "Booking not found"}</p>
            </div>
            <button 
              onClick={() => navigate('/admin/booking-history')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Back to Booking History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <button 
              onClick={() => navigate('/admin/booking-history')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Back to Booking History
            </button>
          </div>

          {/* Booking Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Booking #{booking._id.substring(0, 8)}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium 
                ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'}`}
              >
                {booking.status === 'pending_payment' ? 'Pending Payment' : 
                 booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Booking Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date:</span>
                    <span className="font-medium">{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of People:</span>
                    <span className="font-medium">{booking.numberOfPeople}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">Rs. {booking.amount?.toLocaleString() || 'N/A'}</span>
                  </div>
                  {booking.discountApplied && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount Applied:</span>
                      <span className="font-medium text-green-600">{booking.discountRate || 0}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created At:</span>
                    <span className="font-medium">{formatDate(booking.createdAt)}</span>
                  </div>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {booking.Fname} {booking.Lname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{booking.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{booking.Phonenumber1 || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Safari Details</h3>
                {safari ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Safari Name:</span>
                      <span className="font-medium">{safari.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">Rs. {safari.price?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{safari.duration || 'N/A'} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{safari.location || 'N/A'}</span>
                    </div>
                    {safari.images && safari.images.length > 0 && (
                      <div className="mt-4">
                        <span className="text-gray-600 block mb-2">Safari Image:</span>
                        <img 
                          src={`http://localhost:8070/${safari.images[0]}`} 
                          alt={safari.title}
                          className="rounded-md w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Safari information not available</p>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Update Status</h3>
                  <form onSubmit={handleStatusChange} className="flex items-center space-x-4" id="updateStatusForm">
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 flex-1"
                    >
                      <option value="pending_payment">Pending Payment</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="yet_to_refund">Yet to Refund</option>
                      <option value="refunded">Refunded</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Update Status
                    </button>
                  </form>
                </div>

                {/* Show refund details if booking is cancelled or pending refund */}
                {(booking.status === 'yet_to_refund' || booking.status === 'cancelled') && (
                  <div className="mt-6 p-4 border border-orange-200 bg-orange-50 rounded-md">
                    <h3 className="text-lg font-medium mb-2 text-orange-800">Refund Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days Until Trip:</span>
                        <span className="font-medium">
                          {booking.daysUntilTrip || calculatedRefund.daysUntilTrip || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund Policy Applied:</span>
                        <span className="font-medium">
                          {(booking.daysUntilTrip || calculatedRefund.daysUntilTrip) >= 7 
                            ? '100% refund (7+ days before trip)' 
                            : (booking.daysUntilTrip || calculatedRefund.daysUntilTrip) >= 4 
                              ? '50% refund (4-6 days before trip)'
                              : 'No refund (0-3 days before trip)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original Amount:</span>
                        <span className="font-medium">Rs. {booking.amount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-700">Refund Percentage:</span>
                        <span className={`${(booking.refundPercentage || calculatedRefund.refundPercentage) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {booking.refundPercentage || calculatedRefund.refundPercentage || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-orange-200 pt-2 mt-2">
                        <span className="text-gray-800">Refund Amount:</span>
                        <span className={`${(booking.refundAmount || calculatedRefund.refundAmount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Rs. {(booking.refundAmount || calculatedRefund.refundAmount)?.toLocaleString() || '0'}
                        </span>
                      </div>
                      
                      {(booking.refundAmount > 0 || calculatedRefund.refundAmount > 0) && booking.status !== 'refunded' && (
                        <button 
                          onClick={() => {
                            // If we're using calculated values, update the booking first
                            if (!booking.refundAmount && calculatedRefund.refundAmount) {
                              axios.put(
                                `http://localhost:8070/bookings/update/${bookingId}`,
                                {
                                  daysUntilTrip: calculatedRefund.daysUntilTrip,
                                  refundPercentage: calculatedRefund.refundPercentage,
                                  refundAmount: calculatedRefund.refundAmount
                                },
                                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
                              ).then(() => {
                                setStatusUpdate('refunded');
                                document.getElementById('updateStatusForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                              });
                            } else {
                              setStatusUpdate('refunded');
                              document.getElementById('updateStatusForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                            }
                          }}
                          className="w-full mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Process Refund
                        </button>
                      )}
                      
                      {(booking.refundAmount === 0 && calculatedRefund.refundAmount === 0) && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md text-center text-red-700 text-sm">
                          No refund is applicable based on the cancellation policy.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {booking.status === 'refunded' && (
                  <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-md">
                    <h3 className="text-lg font-medium mb-2 text-green-800">Refund Processed</h3>
                    <div className="flex items-center justify-center mb-3 text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original Amount:</span>
                        <span className="font-medium">Rs. {booking.amount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund Percentage:</span>
                        <span className="font-medium">{booking.refundPercentage || 0}%</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-green-200 pt-2 mt-2">
                        <span className="text-gray-800">Refund Amount:</span>
                        <span className="text-green-600">Rs. {booking.refundAmount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processed Date:</span>
                        <span className="font-medium">{booking.refundProcessedDate ? formatDate(booking.refundProcessedDate) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show policy info for all statuses */}
                <div className="mt-6 bg-blue-50 p-4 rounded-md">
                  <h3 className="text-base font-medium mb-2 text-blue-800">Refund Policy Information</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      100% refund if cancelled 7 or more days before the trip
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      50% refund if cancelled 4–6 days before the trip
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      No refund if cancelled 0–3 days before the trip
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingDetails;
