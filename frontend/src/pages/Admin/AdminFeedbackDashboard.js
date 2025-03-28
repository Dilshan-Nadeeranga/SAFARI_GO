import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminFeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('http://localhost:8070/feedback/admin/all', {
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

  const handleRespond = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:8070/feedback/admin/${selectedFeedback._id}`,
        { response, status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setFeedbacks(feedbacks.map(fb => fb._id === selectedFeedback._id ? res.data.feedback : fb));
      setSelectedFeedback(null);
      setResponse('');
      setStatus('pending');
    } catch (error) {
      console.error('Error responding to feedback:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Customer Feedback Dashboard</h2>
      <ul className="space-y-2">
        {feedbacks.map(fb => (
          <li
            key={fb._id}
            onClick={() => {
              setSelectedFeedback(fb);
              setResponse(fb.adminResponse);
              setStatus(fb.status);
            }}
            className="flex justify-between items-center p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-100 transition"
          >
            <span className="text-gray-800">{fb.title} - {fb.email}</span>
            <span className={`font-medium ${fb.status === 'pending' ? 'text-red-500' : 'text-green-500'}`}>
              {fb.status}
            </span>
          </li>
        ))}
      </ul>
      {selectedFeedback && (
        <div className="mt-6 bg-white p-6 shadow rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Feedback Details</h3>
          <p className="text-gray-700"><strong>Title:</strong> {selectedFeedback.title}</p>
          <p className="text-gray-700"><strong>Description:</strong> {selectedFeedback.description}</p>
          <p className="text-gray-700"><strong>Rating:</strong> {selectedFeedback.rating || 'N/A'}</p>
          <form onSubmit={handleRespond}>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Response</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="flex space-x-4 mt-1">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pending"
                    checked={status === 'pending'}
                    onChange={() => setStatus('pending')}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Pending</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="resolved"
                    checked={status === 'resolved'}
                    onChange={() => setStatus('resolved')}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Resolved</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Submit Response
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackDashboard;