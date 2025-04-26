import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserFeedback();
  }, []);

  const fetchUserFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/LoginForm');
        return;
      }

      const response = await axios.get('http://localhost:8070/feedback/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFeedback(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load your feedback. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEdit = (feedbackItem) => {
    setEditingFeedback(feedbackItem);
    setEditText(feedbackItem.text);
    setEditRating(feedbackItem.rating);
  };

  const handleCancelEdit = () => {
    setEditingFeedback(null);
    setEditText('');
    setEditRating(0);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingFeedback) return;
      
      const token = localStorage.getItem('token');
      
      if (!editText.trim()) {
        alert('Feedback text cannot be empty');
        return;
      }
      
      if (editRating < 1 || editRating > 5) {
        alert('Please select a rating between 1 and 5');
        return;
      }
      
      console.log(`Updating feedback ID: ${editingFeedback._id}`);
      console.log(`API endpoint: http://localhost:8070/feedback/${editingFeedback._id}`);
      
      const response = await axios.put(`http://localhost:8070/feedback/update/${editingFeedback._id}`, {
        text: editText,
        rating: editRating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Server response:', response.data);
      
      setFeedback(feedback.map(f => 
        f._id === editingFeedback._id 
          ? { ...f, text: editText, rating: editRating } 
          : f
      ));
      
      handleCancelEdit();
      alert('Feedback updated successfully');
    } catch (err) {
      console.error('Error updating feedback:', err);
      let errorMessage = 'Failed to update feedback';
      
      if (err.response) {
        errorMessage += `: ${err.response.data.message || err.response.statusText}`;
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      
      alert(errorMessage);
    }
  };

  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < count ? "text-yellow-500" : "text-gray-300"}>★</span>
    ));
  };

  const getStatusBadge = (status) => {
    let badgeClass = "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
    
    switch (status) {
      case 'pending':
        badgeClass += " bg-yellow-100 text-yellow-800";
        break;
      case 'assigned':
        badgeClass += " bg-blue-100 text-blue-800";
        break;
      case 'responded':
        badgeClass += " bg-purple-100 text-purple-800";
        break;
      case 'resolved':
        badgeClass += " bg-green-100 text-green-800";
        break;
      default:
        badgeClass += " bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={badgeClass}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading your feedback...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Feedback</h1>
        <button
          onClick={() => navigate('/feedback')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Leave New Feedback
        </button>
      </div>

      {/* Editing Modal */}
      {editingFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Your Feedback</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating:</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= editRating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Feedback:</label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="4"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {feedback.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500 mb-4">You haven't submitted any feedback yet.</p>
          <button
            onClick={() => navigate('/feedback')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Leave Your First Feedback
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {feedback.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between mb-3">
                <div>
                  <div className="flex items-center">
                    <div className="flex">
                      {renderStars(item.rating)}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(item.status)}
                </div>
              </div>
              
              <p className="text-gray-800 mb-4">{item.text}</p>
              
              {(item.adminResponse || item.guideResponse) && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Response:</h3>
                  {item.adminResponse && (
                    <div className="mb-2 bg-blue-50 p-3 rounded">
                      <p className="text-xs text-blue-700 font-semibold">From Admin:</p>
                      <p className="text-gray-800">{item.adminResponse}</p>
                    </div>
                  )}
                  {item.guideResponse && (
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-green-700 font-semibold">From Guide:</p>
                      <p className="text-gray-800">{item.guideResponse}</p>
                    </div>
                  )}
                </div>
              )}
              
              {item.status !== 'resolved' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Edit Feedback
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFeedback;
