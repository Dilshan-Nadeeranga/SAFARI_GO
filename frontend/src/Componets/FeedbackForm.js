import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Componets/CSS/FeedbackForm.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    text: '',
    rating: 5,
    guideId: '',
    tripId: ''
  });
  
  const [guides, setGuides] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found, redirecting to login');
      navigate('/LoginForm', { state: { redirectTo: '/feedback' } });
      return;
    }
    
    // Fetch available guides
    const fetchGuides = async () => {
      try {
        console.log('Fetching guides');
        
        // Try to fetch guides without authentication first
        const response = await axios.get('http://localhost:8070/users/guides');
        setGuides(response.data);
      } catch (err) {
        console.error('Error fetching guides:', err);
        // Don't redirect on guide fetch error, just show empty guides
        setGuides([]);
        setError('Could not load guides. You can still submit feedback without selecting a guide.');
      }
    };
    
    // Fetch user's trips/bookings
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token available for fetching trips');
          setTrips([]);
          return;
        }
        
        console.log('Fetching user trips');
        const response = await axios.get('http://localhost:8070/bookings/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTrips(response.data.filter(booking => 
          booking.status === 'completed' || booking.status === 'confirmed'
        ));
      } catch (err) {
        console.error('Error fetching trips:', err);
        
        // Don't break the form if trips can't be fetched
        setTrips([]);
        
        // Only redirect if it's an auth error
        if (err.response && err.response.status === 401) {
          console.log('Authentication failed when fetching trips');
          localStorage.removeItem('token');
          navigate('/LoginForm', { state: { redirectTo: '/feedback' } });
        }
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchGuides();
    fetchTrips();
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    if (!formData.text.trim()) {
      setError('Please provide feedback text');
      return false;
    }
    
    if (formData.text.trim().length < 10) {
      setError('Please provide more detailed feedback (at least 10 characters)');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You need to be logged in to submit feedback');
        navigate('/LoginForm', { state: { redirectTo: '/feedback' } });
        return;
      }
      
      // Remove empty string values for optional fields
      const submissionData = {
        ...formData,
        guideId: formData.guideId || undefined,
        tripId: formData.tripId || undefined
      };
      
      await axios.post('http://localhost:8070/feedback', submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setFormData({
        text: '',
        rating: 5,
        guideId: '',
        tripId: ''
      });
      
      // Show success message and redirect after delay
      setTimeout(() => {
        navigate('/UserHomepage');
      }, 3000);
      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/LoginForm', { state: { redirectTo: '/feedback' } });
      } else {
        setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
        console.error('Error submitting feedback:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStarLabel = (rating) => {
    switch(rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };
  
  if (loadingData) {
    return (
      <div className="feedback-container">
        <div className="feedback-card loading">
          <div className="loader"></div>
          <p>Loading form data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h2>Share Your Safari Experience</h2>
        <p>Your feedback helps us improve our services and assists other travelers!</p>
        
        {success ? (
          <div className="success-message">
            <svg xmlns="http://www.w3.org/2000/svg" className="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Thank you for your feedback! Redirecting to homepage...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="rating">How would you rate your experience?</label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    aria-label={`${star} stars`}
                    title={getStarLabel(star)}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-text">{getStarLabel(formData.rating)} ({formData.rating}/5)</span>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="guideId" className="required-field">Select a Guide (Optional)</label>
              <select
                id="guideId"
                name="guideId"
                value={formData.guideId}
                onChange={handleChange}
                className="guide-select"
              >
                <option value="">-- Select the guide who assisted you --</option>
                {guides.length > 0 ? (
                  guides.map((guide) => (
                    <option key={guide._id} value={guide._id}>
                      {guide.name || guide.email}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No guides available</option>
                )}
              </select>
              <p className="form-hint">Select the guide who led your safari if applicable</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="tripId">Which safari are you reviewing? (Optional)</label>
              <select
                id="tripId"
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                className="trip-select"
              >
                <option value="">-- Select a safari --</option>
                {trips.length > 0 ? (
                  trips.map((trip) => (
                    <option key={trip._id} value={trip._id}>
                      {trip.safariTitle || `Safari on ${new Date(trip.date).toLocaleDateString()}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No safari bookings found</option>
                )}
              </select>
              <p className="form-hint">Selecting a specific safari helps us improve that experience</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="text" className="required-field">Your Detailed Feedback</label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                required
                placeholder="Please share your experience, what you enjoyed, and any suggestions for improvement..."
                rows="5"
                className="feedback-textarea"
              ></textarea>
              <p className="form-hint">Please provide specific details about your experience</p>
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : 'Submit Feedback'}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/UserHomepage')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
