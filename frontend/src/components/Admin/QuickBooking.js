import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../pages/Admin/Componet/CSS/QuickBooking.css';

const QuickBooking = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    safariId: '',
    Fname: '',
    Lname: '',
    Phonenumber1: '',
    email: '',
    date: '',
    numberOfPeople: 1,
  });
  const [safaris, setSafaris] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dateAvailability, setDateAvailability] = useState({
    checked: false,
    available: true,
    checking: false
  });

  useEffect(() => {
    // Fetch available safaris for the dropdown
    const fetchSafaris = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/safaris/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSafaris(response.data.filter(safari => safari.status === 'approved'));
      } catch (err) {
        console.error('Error fetching safaris:', err);
        setError('Failed to load safaris');
      }
    };

    if (show) {
      fetchSafaris();
      setFormData({
        safariId: '',
        Fname: '',
        Lname: '',
        Phonenumber1: '',
        email: '',
        date: '',
        numberOfPeople: 1,
      });
      setSuccess(false);
      setError(null);
    }
  }, [show]);

  const checkDateAvailability = async (safariId, date) => {
    if (!safariId || !date) return;
    
    setDateAvailability(prev => ({ ...prev, checking: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8070/bookings/check-availability/${safariId}/${date}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setDateAvailability({
        checked: true,
        available: response.data.isAvailable,
        checking: false
      });
      
      if (!response.data.isAvailable) {
        setError('This safari is already booked for the selected date. Please choose another date.');
      } else if (error === 'This safari is already booked for the selected date. Please choose another date.') {
        setError(null);
      }
    } catch (err) {
      console.error('Error checking date availability:', err);
      setDateAvailability({
        checked: true,
        available: true, // Assume available on error to not block user
        checking: false
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Check availability when date or safari changes
    if (name === 'date' && formData.safariId) {
      checkDateAvailability(formData.safariId, value);
    } else if (name === 'safariId' && formData.date) {
      checkDateAvailability(value, formData.date);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.safariId || !formData.Fname || !formData.email || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!dateAvailability.available && dateAvailability.checked) {
      setError('This safari is already booked for the selected date. Please choose another date.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const safari = safaris.find(s => s._id === formData.safariId);
      
      if (!safari) {
        setError('Invalid safari selection');
        return;
      }
      
      const bookingData = {
        ...formData,
        amount: safari.price * formData.numberOfPeople,
        status: 'confirmed',
      };
      
      await axios.post('http://localhost:8070/bookings/add', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
        // Optionally redirect to bookings list
        // navigate('/admin/booking-history');
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 quick-booking-modal">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto quick-booking-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Quick Booking</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            <p>Booking created successfully!</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Safari *
            </label>
            <select
              name="safariId"
              value={formData.safariId}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              required
            >
              <option value="">-- Select Safari --</option>
              {safaris.map(safari => (
                <option key={safari._id} value={safari._id}>
                  {safari.title} - Rs. {safari.price}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="Fname"
                value={formData.Fname}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="Lname"
                value={formData.Lname}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="Phonenumber1"
              value={formData.Phonenumber1}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`shadow border rounded w-full py-2 px-3 text-gray-700 ${
                  !dateAvailability.available && dateAvailability.checked ? 'border-red-500 bg-red-50' : ''
                }`}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              {dateAvailability.checking && (
                <p className="text-xs text-gray-500 mt-1">Checking availability...</p>
              )}
              {!dateAvailability.available && dateAvailability.checked && (
                <p className="text-xs text-red-500 mt-1">
                  Date unavailable. Safari is already booked for this date.
                </p>
              )}
              {dateAvailability.available && dateAvailability.checked && formData.date && (
                <p className="text-xs text-green-500 mt-1">Date available!</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Number of People
              </label>
              <input
                type="number"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                min="1"
                max="20"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickBooking;