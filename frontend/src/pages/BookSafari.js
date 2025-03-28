import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookSafari = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [safari, setSafari] = useState(location.state?.safari || null);
  const [bookingData, setBookingData] = useState({
    Fname: '',
    Lname: '',
    Phonenumber1: '',
    email: '',
    date: '',
    numberOfPeople: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  // Add card payment state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    // Check if safari data exists in location state
    if (!safari && !location.state?.safari) {
      navigate('/explore-safaris');
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/LoginForm', { 
        state: { 
          redirectTo: '/BookSafari',
          safari: location.state?.safari 
        }
      });
      return;
    }

    // Calculate total amount based on safari price and number of people
    if (safari) {
      setTotalAmount(safari.price * bookingData.numberOfPeople);
    }

    // Fetch user profile to pre-fill form
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const profile = response.data;
        setBookingData(prev => ({
          ...prev,
          Fname: profile.name || '',
          Lname: profile.Lname || '',
          Phonenumber1: profile.Phonenumber1 || '',
          email: profile.email || ''
        }));
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    
    fetchUserProfile();
  }, [navigate, location.state, safari]);

  // Update total amount when number of people changes
  useEffect(() => {
    if (safari) {
      setTotalAmount(safari.price * bookingData.numberOfPeople);
    }
  }, [bookingData.numberOfPeople, safari]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Create a booking without payment for now
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8070/bookings/add',
        {
          ...bookingData,
          safariId: safari._id,
          amount: totalAmount,
          status: 'pending_payment',
          date: new Date(bookingData.date).toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBookingId(response.data._id || 'temp-id');
      setShowPayment(true);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!bookingData.Fname || !bookingData.Lname || !bookingData.Phonenumber1 || 
        !bookingData.email || !bookingData.date) {
      setError('Please fill all required fields');
      return false;
    }

    const today = new Date();
    const selectedDate = new Date(bookingData.date);
    if (selectedDate <= today) {
      setError('Please select a future date');
      return false;
    }

    if (bookingData.numberOfPeople < 1 || bookingData.numberOfPeople > safari.capacity) {
      setError(`Number of people must be between 1 and ${safari.capacity}`);
      return false;
    }

    return true;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate card details
    if (!validateCardData()) {
      setLoading(false);
      return;
    }

    try {
      // In a real application, you would send card data to a payment processor
      // For this demo, we'll just simulate a successful payment
      
      // Simulating payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a fake payment ID
      const paymentId = 'VISA_' + Date.now().toString();
      
      // Update booking with payment information
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8070/bookings/update/${bookingId}`,
        {
          status: 'confirmed',
          paymentId,
          paymentDetails: JSON.stringify({
            paymentMethod: 'visa',
            last4: cardData.cardNumber.slice(-4),
            timestamp: new Date().toISOString(),
            safariDetails: {
              title: safari.title,
              location: safari.location,
              date: bookingData.date,
              guideId: safari.guideId // Make sure guideId is included
            }
          })
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Show success message
      setPaymentSuccess(true);
      
      // After 3 seconds, redirect to dashboard
      setTimeout(() => {
        navigate('/user/trips');
      }, 3000);
    } catch (err) {
      console.error('Payment processing error:', err);
      setError('There was a problem processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateCardData = () => {
    // Validate card number (simple check for length)
    if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }

    // Validate cardholder name
    if (!cardData.cardholderName.trim()) {
      setError('Please enter the cardholder name');
      return false;
    }

    // Validate expiry date format (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(cardData.expiryDate)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    // Validate expiry date is in the future
    const [month, year] = cardData.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    if (expiryDate <= today) {
      setError('Card has expired');
      return false;
    }

    // Validate CVV (3-4 digits)
    if (!/^[0-9]{3,4}$/.test(cardData.cvv)) {
      setError('Please enter a valid CVV (3-4 digits)');
      return false;
    }

    return true;
  };

  // Format card number as user types (add spaces)
  const formatCardNumber = (e) => {
    let { value } = e.target;
    value = value.replace(/\D/g, ''); // Remove non-digits
    value = value.substring(0, 16); // Limit to 16 digits
    
    // Add spaces after every 4 digits
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    
    const formatted = parts.join(' ');
    
    setCardData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  // Format expiry date as user types (add slash)
  const formatExpiryDate = (e) => {
    let { value } = e.target;
    value = value.replace(/\D/g, ''); // Remove non-digits
    value = value.substring(0, 4); // Limit to 4 digits
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    
    setCardData(prev => ({
      ...prev,
      expiryDate: value
    }));
  };

  if (!safari) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for booking your safari adventure with us. Your booking has been confirmed.
          </p>
          <p className="text-gray-600 mb-6">
            You will be redirected to your trips page shortly...
          </p>
          <button 
            onClick={() => navigate('/user/trips')}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to My Trips
          </button>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="bg-gray-100 min-h-screen py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-600 py-4 px-6">
              <h1 className="text-xl font-bold text-white">Complete Payment</h1>
            </div>
            
            <div className="p-6">
              {/* Payment details summary */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 mb-2"><span className="font-medium">Safari:</span> {safari.title}</p>
                  <p className="text-gray-700 mb-2"><span className="font-medium">Date:</span> {new Date(bookingData.date).toLocaleDateString()}</p>
                  <p className="text-gray-700 mb-2"><span className="font-medium">People:</span> {bookingData.numberOfPeople}</p>
                  <p className="text-gray-700 font-medium">Total Amount: Rs. {totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Credit Card Form */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
                
                {error && (
                  <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  {/* Card logos */}
                  <div className="flex space-x-2 mb-4">
                    <div className="w-12 h-8 bg-blue-700 rounded-md flex items-center justify-center text-white font-bold text-sm">VISA</div>
                    <div className="w-12 h-8 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 font-bold text-sm">MC</div>
                    <div className="w-12 h-8 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 font-bold text-sm">AMEX</div>
                  </div>
                  
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={formatCardNumber}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={cardData.cardholderName}
                      onChange={handleCardChange}
                      placeholder="John Smith"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={formatExpiryDate}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    {/* CVV */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : `Pay Rs. ${totalAmount.toLocaleString()}`}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-blue-600 hover:underline"
                  disabled={loading}
                >
                  Back to booking details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 py-4 px-6">
            <h1 className="text-xl font-bold text-white">Book Safari Adventure</h1>
          </div>
          
          <div className="p-6">
            {/* Safari details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                {safari.images && safari.images.length > 0 ? (
                  <img
                    src={`http://localhost:8070/${safari.images[0]}`}
                    alt={safari.title}
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Safari';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{safari.title}</h2>
                <p className="text-gray-600 mb-2">Location: {safari.location}</p>
                <p className="text-gray-600 mb-2">Duration: {safari.duration} hours</p>
                <p className="text-gray-600 mb-2">Price per person: Rs. {safari.price.toLocaleString()}</p>
                <p className="text-gray-600 mb-4">Maximum capacity: {safari.capacity} people</p>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-blue-800 font-medium">Total Amount: Rs. {totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Display error message if any */}
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            {!showPayment ? (
              /* Booking form */
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="Fname"
                      value={bookingData.Fname}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="Lname"
                      value={bookingData.Lname}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={bookingData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="Phonenumber1"
                      value={bookingData.Phonenumber1}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={bookingData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of People</label>
                    <input
                      type="number"
                      name="numberOfPeople"
                      value={bookingData.numberOfPeople}
                      min="1"
                      max={safari.capacity}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Proceed to Payment"}
                  </button>
                </div>
              </form>
            ) : (
              /* Payment section */
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Complete Payment</h3>
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <p className="text-gray-700 mb-2">Safari: {safari.title}</p>
                  <p className="text-gray-700 mb-2">Date: {new Date(bookingData.date).toLocaleDateString()}</p>
                  <p className="text-gray-700 mb-2">People: {bookingData.numberOfPeople}</p>
                  <p className="text-gray-700 font-medium">Total Amount: Rs. {totalAmount.toLocaleString()}</p>
                </div>
                
                <div className="mb-6">
                  <form onSubmit={handleCardSubmit} className="space-y-4">
                    {/* Card logos */}
                    <div className="flex space-x-2 mb-4">
                      <div className="w-12 h-8 bg-blue-700 rounded-md flex items-center justify-center text-white font-bold text-sm">VISA</div>
                      <div className="w-12 h-8 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 font-bold text-sm">MC</div>
                      <div className="w-12 h-8 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 font-bold text-sm">AMEX</div>
                    </div>
                    
                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={formatCardNumber}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={cardData.cardholderName}
                        onChange={handleCardChange}
                        placeholder="John Smith"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Expiry Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={cardData.expiryDate}
                          onChange={formatExpiryDate}
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      {/* CVV */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          placeholder="123"
                          maxLength="4"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        disabled={loading}
                      >
                        {loading ? "Processing..." : `Pay Rs. ${totalAmount.toLocaleString()}`}
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="text-blue-600 hover:underline"
                    disabled={loading}
                  >
                    Back to booking details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSafari;
