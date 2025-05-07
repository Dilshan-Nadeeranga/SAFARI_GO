import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../Componet/CSS/Dashboard.css';

const AdminFeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const feedbackRes = await axios.get('http://localhost:8070/feedback/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const guidesRes = await axios.get('http://localhost:8070/users/guides', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFeedback(feedbackRes.data);
        setGuides(guidesRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load feedback data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAssignGuide = async () => {
    if (!selectedGuide) {
      alert('Please select a guide');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const guideInfo = guides.find(g => g._id === selectedGuide);
      const guideName = guideInfo?.name || guideInfo?.email || 'Selected guide';
      
      await axios.put(`http://localhost:8070/feedback/assign-guide/${selectedFeedback._id}`, 
        { 
          guideId: selectedGuide,
          notificationDetails: {
            feedbackText: selectedFeedback.text.substring(0, 50) + (selectedFeedback.text.length > 50 ? '...' : ''),
            rating: selectedFeedback.rating,
            userName: selectedFeedback.userId?.name || selectedFeedback.userId?.email || 'Customer',
            requiredAction: 'Please review and respond to this feedback as soon as possible.'
          }
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setFeedback(feedback.map(f => 
        f._id === selectedFeedback._id 
          ? {...f, guideId: selectedGuide, status: 'assigned'} 
          : f
      ));
      
      setSelectedFeedback(null);
      setSelectedGuide('');
      
      alert(`Feedback successfully assigned to ${guideName}. They will be notified immediately.`);
    } catch (err) {
      console.error('Error assigning guide:', err);
      alert('Failed to assign guide');
    }
  };
  
  const handleAdminResponse = async () => {
    if (!adminResponse.trim()) {
      alert('Please enter a response');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const payload = { feedbackMsg: adminResponse.trim() };
      
      setLoading(true);
      
      const response = await axios.put(
        `http://localhost:8070/feedback/respond/${selectedFeedback._id}`, 
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      setFeedback(feedback.map(f => 
        f._id === selectedFeedback._id 
          ? {...f, adminResponse, status: 'responded'} 
          : f
      ));
      
      setSelectedFeedback(null);
      setAdminResponse('');
      
      alert('Response submitted successfully');
    } catch (err) {
      console.error('Error submitting response:', err);
      let errorMessage = 'Failed to submit response';
      
      if (err.response) {
        errorMessage = err.response.data.message || err.response.data.error || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:8070/feedback/${feedbackId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFeedback(feedback.filter(f => f._id !== feedbackId));
      
      alert('Feedback deleted successfully');
    } catch (err) {
      console.error('Error deleting feedback:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      let errorMessage = 'Failed to delete feedback';
      
      if (err.response) {
        errorMessage = err.response.data.message || err.response.data.error || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };
  
  const getFeedbackStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
      case 'assigned':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Assigned</span>;
      case 'responded':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Responded</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Resolved</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
    }
  };

  if (loading) return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4">Loading feedback data...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4 text-red-500">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Feedback Management</h2>
            <a 
              href="/admin/feedback-report" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3zm1 3h12v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6z" clipRule="evenodd" />
                <path d="M6 8a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7z" />
              </svg>
              View Feedback Report
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            {feedback.length === 0 ? (
              <p>No feedback available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feedback.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.userId?.name || item.userId?.email || 'Anonymous'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {'⭐'.repeat(item.rating)} ({item.rating}/5)
                        </td>
                        <td className="px-6 py-4">
                          <div className="line-clamp-2">{item.text}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getFeedbackStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.guideId ? (
                            guides.find(g => g._id === item.guideId?._id || g._id === item.guideId)?.name || 
                            guides.find(g => g._id === item.guideId?._id || g._id === item.guideId)?.email || 
                            'Assigned Guide'
                          ) : 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedFeedback(item);
                              setAdminResponse(item.adminResponse || '');
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Respond
                          </button>
                          <button 
                            onClick={() => handleDeleteFeedback(item._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {selectedFeedback && !adminResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Assign Feedback to Guide</h3>
              <div className="mb-4">
                <p><strong>Feedback:</strong> {selectedFeedback.text}</p>
                <p><strong>Rating:</strong> {selectedFeedback.rating}/5</p>
                <p><strong>From:</strong> {selectedFeedback.userId?.name || selectedFeedback.userId?.email || 'Anonymous'}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Guide
                </label>
                <select 
                  value={selectedGuide} 
                  onChange={(e) => setSelectedGuide(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">-- Select a guide --</option>
                  {guides.map(guide => (
                    <option key={guide._id} value={guide._id}>
                      {guide.name || guide.email}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  The selected guide will receive a notification with details about this feedback and required actions.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedFeedback(null);
                    setSelectedGuide('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignGuide}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Assign & Notify Guide
                </button>
              </div>
            </div>
          </div>
        )}
        
        {selectedFeedback && adminResponse !== undefined && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Respond to Feedback</h3>
              <div className="mb-4">
                <p><strong>Feedback:</strong> {selectedFeedback.text}</p>
                <p><strong>Rating:</strong> {selectedFeedback.rating}/5</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="4"
                  placeholder="Enter your response..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedFeedback(null);
                    setAdminResponse('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminResponse}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackManagement;