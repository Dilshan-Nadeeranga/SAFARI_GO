import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RentVehicle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicle } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [rentalId, setRentalId] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [premiumStatus, setPremiumStatus] = useState({
    isPremium: false,
    discountRate: 0
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  const [rentalData, setRentalData] = useState({
    vehicleId: vehicle?._id || '',
    Fname: '',
    Lname: '',
    Phonenumber1: '',
    email: '',
    startDate: '',
    endDate: '',
    purpose: '',
    driverNeeded: false
  });

  // Calculate number of days between start and end date
  const daysDifference = () => {
    if (!rentalData.startDate || !rentalData.endDate) return 0;
    const start = new Date(rentalData.startDate);
    const end = new Date(rentalData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
  };

  useEffect(() => {
    // Check if we have vehicle data
    if (!vehicle) {
      navigate('/vehicles');
      return;
    }

    // Get user profile data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/LoginForm', { state: { redirectTo: location.pathname, vehicle } });
          return;
        }

        // Fetch user profile to pre-fill form
        const profileResponse = await axios.get('http://localhost:8070/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const profile = profileResponse.data;
        setRentalData(prev => ({
          ...prev,
          Fname: profile.name || '',
          Lname: profile.Lname || '',
          Phonenumber1: profile.Phonenumber1 || '',
          email: profile.email || ''
        }));

        // Fetch premium status
        try {
          const premiumResponse = await axios.get('http://localhost:8070/users/premium/status', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPremiumStatus(premiumResponse.data);
        } catch (err) {
          console.error('Error fetching premium status:', err);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Unable to fetch user data. Please try again.');
      }
    };

    fetchUserData();
  }, [navigate, location, vehicle]);

  // Calculate rental price whenever dates change
  useEffect(() => {
    const days = daysDifference();
    // Base rate of 5000 per day for the vehicle, adjust as needed
    // You can use vehicle.rentalRate instead if it's available
    const baseRate = 5000;
    const baseAmount = days * baseRate;
    
    // Calculate driver fee if needed (1500 per day)
    const driverFee = rentalData.driverNeeded ? days * 1500 : 0;
    
    // Apply premium discount if applicable
    let finalAmount = baseAmount + driverFee;
    if (premiumStatus.isPremium) {
      const discount = finalAmount * (premiumStatus.discountRate / 100);
      finalAmount -= discount;
    }
    
    setTotalAmount(finalAmount);
  }, [rentalData.startDate, rentalData.endDate, rentalData.driverNeeded, premiumStatus]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRentalData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!rentalData.Fname || !rentalData.Lname || !rentalData.Phonenumber1 || 
        !rentalData.email || !rentalData.startDate || !rentalData.endDate) {
      setError('Please fill all required fields');
      return false;
    }

    const today = new Date();
    const startDate = new Date(rentalData.startDate);
    const endDate = new Date(rentalData.endDate);
    
    if (startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return false;
    }

    return true;
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
      
      // Format dates properly to ISO strings
      const formattedStartDate = new Date(rentalData.startDate).toISOString();
      const formattedEndDate = new Date(rentalData.endDate).toISOString();
      
      // Prepare request payload with properly formatted dates
      const requestPayload = {
        ...rentalData,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        amount: totalAmount,
        status: 'pending_payment'
      };
      
      // Log the request data for debugging
      console.log('Sending rental request with data:', requestPayload);
      
      const response = await axios.post(
        'http://localhost:8070/vehicle-rentals/add',
        requestPayload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Rental created successfully:', response.data);
      setRentalId(response.data._id || 'temp-id');
      setShowPayment(true);
    } catch (err) {
      console.error('Error creating rental:', err);
      if (err.response && err.response.data) {
        // Display more specific error message from the server if available
        setError(`Failed to create rental: ${err.response.data.error || err.response.data.message || 'Please check your information and try again'}`);
      } else {
        setError('Failed to create rental. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    // In a real app, integrate with a payment gateway here
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8070/vehicle-rentals/update/${rentalId}`,
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccessMessage('Payment successful! Your vehicle rental is confirmed.');
      
      setTimeout(() => {
        navigate('/user/rentals');
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  // If payment is successful, show a success message
  if (showPayment && loading) {
    return (
      <div className="bg-gray-100 min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for renting with us. Your vehicle rental has been confirmed.
            </p>
            <p className="text-gray-600 mb-6">
              You will be redirected to your rentals page shortly...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If we have a vehicle, render the rental form
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 py-4 px-6">
            <h1 className="text-xl font-bold text-white">Rent a Vehicle</h1>
          </div>
          
          <div className="p-6">
            {/* Vehicle details summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Vehicle Details</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  {vehicle?.images && vehicle.images.length > 0 ? (
                    <img
                      src={`http://localhost:8070/${vehicle.images[0]}`}
                      alt={vehicle.type}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/400x300?text=${vehicle.type}`;
                      }}
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-48 flex items-center justify-center rounded-lg">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                </div>
                
                <div className="md:w-2/3">
                  <h3 className="text-lg font-medium text-gray-800">{vehicle?.type}</h3>
                  <p className="text-gray-600 mb-2">License Plate: {vehicle?.licensePlate}</p>
                  <p className="text-gray-600 mb-2">Capacity: {vehicle?.capacity} passengers</p>
                  
                  {vehicle?.features && vehicle.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-600">Features:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vehicle.features.map((feature, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {premiumStatus.isPremium && (
                    <div className="mt-2 bg-purple-50 border border-purple-200 rounded-md p-3">
                      <p className="text-purple-800 flex items-center">
                        <span className="mr-2">✨</span>
                        Premium Member Discount: {premiumStatus.discountRate}% off
                      </p>
                    </div>
                  )}
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
              /* Rental form */
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="Fname"
                      value={rentalData.Fname}
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
                      value={rentalData.Lname}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="Phonenumber1"
                      value={rentalData.Phonenumber1}
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
                      value={rentalData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={rentalData.startDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={rentalData.endDate}
                      onChange={handleChange}
                      min={rentalData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Rental</label>
                  <textarea
                    name="purpose"
                    value={rentalData.purpose}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please describe why you're renting this vehicle..."
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="driverNeeded"
                      name="driverNeeded"
                      checked={rentalData.driverNeeded}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="driverNeeded" className="ml-2 block text-sm text-gray-700">
                      I need a driver (+Rs 1,500 per day)
                    </label>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <div className="flex justify-between font-medium">
                    <span>Rental Days:</span>
                    <span>{daysDifference()} days</span>
                  </div>
                  {rentalData.driverNeeded && (
                    <div className="flex justify-between mt-2">
                      <span>Driver Fee:</span>
                      <span>Rs {(daysDifference() * 1500).toLocaleString()}</span>
                    </div>
                  )}
                  {premiumStatus.isPremium && (
                    <div className="flex justify-between mt-2 text-purple-700">
                      <span>Premium Discount ({premiumStatus.discountRate}%):</span>
                      <span>-Rs {(totalAmount * premiumStatus.discountRate / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between mt-2 font-bold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>Rs {totalAmount.toLocaleString()}</span>
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
                <div className="bg-gray-50 p-6 rounded-md mb-6">
                  <p className="text-gray-700 mb-4">Please complete your payment to confirm your vehicle rental.</p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium">{vehicle.type}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{daysDifference()} days</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Dates:</span>
                      <span className="font-medium">
                        {new Date(rentalData.startDate).toLocaleDateString()} to {new Date(rentalData.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>Rs {totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                    {loading ? "Processing Payment..." : "Complete Payment"}
                  </button>
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="text-blue-600 hover:underline"
                    disabled={loading}
                  >
                    Back to rental details
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

export default RentVehicle;
