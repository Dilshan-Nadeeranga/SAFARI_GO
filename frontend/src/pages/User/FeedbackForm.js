import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FeedbackForm = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    isForAdmin: 'true',
    title: '',
    description: '',
    rating: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('http://localhost:8070/feedback', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        if (error.response?.status === 401) navigate('/LoginForm');
      }
    };
    fetchFeedbacks();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8070/feedback', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFeedbacks([response.data.feedback, ...feedbacks]);
      setIsAdding(false);
      setFormData({ isForAdmin: 'true', title: '', description: '', rating: '' });
    } catch (error) {
      console.error('Error adding feedback:', error);
    }
  };

  const handleUpdateFeedback = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:8070/feedback/${selectedFeedback._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFeedbacks(feedbacks.map(fb => fb._id === selectedFeedback._id ? response.data.feedback : fb));
      setSelectedFeedback(null);
      setFormData({ isForAdmin: 'true', title: '', description: '', rating: '' });
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await axios.delete(`http://localhost:8070/feedback/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFeedbacks(feedbacks.filter(fb => fb._id !== id));
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Feedback Form</h2>
      
      {/* Past Feedbacks */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-700">Past Feedbacks</h3>
        {feedbacks.length === 0 ? (
          <p className="text-gray-600">No feedbacks yet.</p>
        ) : (
          <ul className="space-y-2">
            {feedbacks.map(fb => (
              <li
                key={fb._id}
                onClick={() => {
                  setSelectedFeedback(fb);
                  setFormData({
                    isForAdmin: fb.isForAdmin.toString(),
                    title: fb.title,
                    description: fb.description,
                    rating: fb.rating || '',
                  });
                }}
                className="p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-100 transition"
              >
                <p className="font-medium text-gray-800">{fb.email}</p>
                <p className="text-gray-600 truncate">{fb.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add New Feedback Button */}
      {!isAdding && !selectedFeedback && (
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add New Feedback
        </button>
      )}

      {/* Feedback Form */}
      {(isAdding || selectedFeedback) && (
        <form onSubmit={isAdding ? handleAddFeedback : handleUpdateFeedback} className="mt-6 bg-white p-6 shadow rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Recipient</label>
            <select
              name="isForAdmin"
              value={formData.isForAdmin}
              onChange={handleInputChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Admin</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Rating (Optional, 1-5)</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              min="1"
              max="5"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              {isAdding ? 'Submit' : 'Update'}
            </button>
            {selectedFeedback && (
              <button
                type="button"
                onClick={() => handleDeleteFeedback(selectedFeedback._id)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setSelectedFeedback(null);
                setFormData({ isForAdmin: 'true', title: '', description: '', rating: '' });
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;