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
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [premiumStatus, setPremiumStatus] = useState({
    isPremium: false,
    discountRate: 0,
    premiumUntil: null
  });
  const [priceDetails, setPriceDetails] = useState({
    originalPrice: 0,
    discountAmount: 0,
    finalPrice: 0
  });
  const [dateAvailability, setDateAvailability] = useState({
    checked: false,
    available: true,
    checking: false
  });

  useEffect(() => {
    if (!safari && !location.state?.safari) {
      navigate('/explore-safaris');
      return;
    }

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

    if (safari) {
      setTotalAmount(safari.price * bookingData.numberOfPeople);
    }

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
    
    const fetchPremiumStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8070/users/premium/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPremiumStatus({
          isPremium: response.data.isPremium,
          discountRate: response.data.discountRate,
          premiumUntil: response.data.premiumUntil
        });
      } catch (err) {
        console.error('Error fetching premium status:', err);
      }
    };
    
    fetchUserProfile();
    fetchPremiumStatus();
  }, [navigate, location.state, safari]);

  useEffect(() => {
    if (safari) {
      const originalPrice = safari.price * bookingData.numberOfPeople;
      const discountRate = premiumStatus.isPremium ? premiumStatus.discountRate / 100 : 0;
      const discountAmount = originalPrice * discountRate;
      const finalPrice = originalPrice - discountAmount;
      
      setPriceDetails({
        originalPrice,
        discountAmount,
        finalPrice
      });
      
      setTotalAmount(finalPrice);
    }
  }, [bookingData.numberOfPeople, safari, premiumStatus]);

  const checkDateAvailability = async (date) => {
    if (!safari || !date) return;
    
    setDateAvailability(prev => ({ ...prev, checking: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8070/bookings/check-availability/${safari._id}/${date}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setDateAvailability({
        checked: true,
        available: response.data.isAvailable,
        checking: false
      });
      
      if (!response.data.isAvailable) {
        setError('This safari is already booked for the selected date. Please choose another date.');
      } else {
        if (error === 'This safari is already booked for the selected date. Please choose another date.') {
          setError('');
        }
      }
    } catch (err) {
      console.error('Error checking date availability:', err);
      setDateAvailability({
        checked: true,
        available: true,
        checking: false
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'date') {
      checkDateAvailability(value);
    }
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

    if (!dateAvailability.available) {
      setError('This safari is already booked for the selected date. Please choose another date.');
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

    if (!validateCardData()) {
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const paymentId = 'VISA_' + Date.now().toString();
      
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
              guideId: safari.guideId
            }
          })
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPaymentSuccess(true);
      
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
    if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }

    if (!cardData.cardholderName.trim()) {
      setError('Please enter the cardholder name');
      return false;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(cardData.expiryDate)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    const [month, year] = cardData.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    if (expiryDate <= today) {
      setError('Card has expired');
      return false;
    }

    if (!/^[0-9]{3,4}$/.test(cardData.cvv)) {
      setError('Please enter a valid CVV (3-4 digits)');
      return false;
    }

    return true;
  };

  const formatCardNumber = (e) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '');
    value = value.substring(0, 16);
    
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

  const formatExpiryDate = (e) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '');
    value = value.substring(0, 4);
    
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
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 mb-2"><span className="font-medium">Safari:</span> {safari.title}</p>
                  <p className="text-gray-700 mb-2"><span className="font-medium">Date:</span> {new Date(bookingData.date).toLocaleDateString()}</p>
                  <p className="text-gray-700 mb-2"><span className="font-medium">People:</span> {bookingData.numberOfPeople}</p>
                  <p className="text-gray-700 font-medium">Total Amount: Rs. {totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
                
                {error && (
                  <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="flex space-x-2 mb-4">
                    <div className="w-12 h-8 bg-blue-700 rounded-md flex items-center justify-center text-white font-bold text-sm">VISA</div>
                    <div className="w-12 h-8 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 font-bold text-sm">MC</div>
                    <div className="w-12 h-8 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 font-bold text-sm">AMEX</div>
                  </div>
                  
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
                  <p className="text-blue-800 font-medium mb-1">Original Price: Rs. {priceDetails.originalPrice.toLocaleString()}</p>
                  
                  {premiumStatus.isPremium && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-green-700 font-medium">Premium Discount ({premiumStatus.discountRate}%):</span>
                      <span className="text-green-700">- Rs. {priceDetails.discountAmount.toLocaleString()}</span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Premium Member</span>
                    </div>
                  )}
                  
                  <p className="text-blue-800 font-bold text-lg mt-1">Final Price: Rs. {priceDetails.finalPrice.toLocaleString()}</p>
                </div>
                
                {!premiumStatus.isPremium && (
                  <div className="mt-4 bg-gradient-to-r from-purple-100 to-indigo-100 p-3 rounded-md border border-purple-200">
                    <p className="text-purple-800 font-medium">
                      <span className="mr-1">✨</span>
                      Get up to 15% off by becoming a premium member!
                    </p>
                    <button 
                      onClick={() => navigate('/user/subscriptions')}
                      className="mt-2 text-sm bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      View Premium Plans
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

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
                    className={`w-full px-4 py-2 border ${
                      !dateAvailability.available && dateAvailability.checked
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {dateAvailability.checking && (
                    <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
                  )}
                  {!dateAvailability.available && dateAvailability.checked && (
                    <p className="text-sm text-red-500 mt-1">
                      This date is already booked. Please select another date.
                    </p>
                  )}
                  {dateAvailability.available && dateAvailability.checked && bookingData.date && (
                    <p className="text-sm text-green-500 mt-1">
                      This date is available!
                    </p>
                  )}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSafari;