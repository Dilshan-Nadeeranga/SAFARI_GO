import React, { useState } from 'react';
import axios from 'axios';

const SafariReviewModal = ({ safari, isOpen, onClose, onApprove, onReject }) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8070/safaris/${safari._id}/approve`, 
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onApprove(feedback); // Pass the feedback to parent component
    } catch (err) {
      console.error('Error approving safari:', err);
      alert('Failed to approve safari');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8070/safaris/${safari._id}/reject`, 
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onReject();
    } catch (err) {
      console.error('Error rejecting safari:', err);
      alert('Failed to reject safari: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Review Safari Package</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Safari Details</h3>
              <p><span className="font-medium">Type:</span> {safari.safariType}</p>
              <p><span className="font-medium">Location:</span> {safari.safariLocation}</p>
              <p><span className="font-medium">Price:</span> Rs {safari.price}</p>
            </div>
            <div>
              <h3 className="font-medium">Guide Details</h3>
              <p><span className="font-medium">Guide Name:</span> {safari.guideName}</p>
              <p><span className="font-medium">Experience:</span> {safari.guideExperience} years</p>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback/Comments
            </label>
            <textarea 
              id="rejection-feedback"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback or reason for rejection..."
            />
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              {loading ? 'Processing...' : 'Reject'}
            </button>
            <button 
              onClick={handleApprove}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {loading ? 'Processing...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafariReviewModal;
