import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FeedbackInbox = () => {
  const [feedbacks, setFeedbacks] = useState([]);
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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Feedback Inbox</h2>
      {feedbacks.length === 0 ? (
        <p className="text-gray-600">No feedbacks yet.</p>
      ) : (
        <ul className="space-y-4">
          {feedbacks.map(fb => (
            <li key={fb._id} className="p-4 bg-white shadow rounded-lg">
              <p className="font-medium text-gray-800">{fb.title}</p>
              <p className="text-gray-600">{fb.description}</p>
              <p className={`mt-2 ${fb.status === 'pending' ? 'text-red-500' : 'text-green-500'}`}>
                Status: {fb.status}
              </p>
              {fb.adminResponse && (
                <p className="mt-2 text-gray-700">
                  <strong>Admin Response:</strong> {fb.adminResponse}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeedbackInbox;