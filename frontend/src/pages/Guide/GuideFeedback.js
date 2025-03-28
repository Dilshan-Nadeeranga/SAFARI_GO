import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GuideFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [guideResponse, setGuideResponse] = useState('');
  const [responseError, setResponseError] = useState('');
  const [responseSuccess, setResponseSuccess] = useState('');
  const [responseType, setResponseType] = useState('custom');
  const [showTips, setShowTips] = useState(true);
  
  const navigate = useNavigate();
  
  // Response templates based on feedback sentiment
  const responseTemplates = {
    positive: "Thank you for your positive feedback! I'm delighted to hear you enjoyed your safari experience. Your comments are valuable and motivate us to maintain our high standards. If you have any future plans to visit again, I'd be happy to assist you.",
    neutral: "Thank you for sharing your feedback. I appreciate your honest assessment of your safari experience. I've noted your comments and will use them to improve our services. If you have any specific suggestions or questions, please feel free to reach out.",
    negative: "Thank you for bringing these concerns to our attention. I sincerely apologize for any aspects of your safari that didn't meet expectations. I take your feedback seriously and will personally ensure that these issues are addressed. I'd appreciate the opportunity to discuss this further with you to resolve any concerns."
  };
  
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/LoginForm');
          return;
        }
        
        const response = await axios.get('http://localhost:8070/feedback/guide', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFeedback(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load your assigned feedback');
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [navigate]);
  
  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    
    if (!guideResponse.trim()) {
      setResponseError('Please enter a response');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8070/feedback/guide/respond/${selectedFeedback._id}`,
        { 
          guideResponse,
          resolveStatus: e.target.id === 'resolve'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state
      setFeedback(feedback.map(item => 
        item._id === selectedFeedback._id 
          ? { 
              ...item, 
              guideResponse, 
              status: e.target.id === 'resolve' ? 'resolved' : 'responded' 
            } 
          : item
      ));
      
      setResponseSuccess('Response submitted successfully');
      
      // Clear form
      setGuideResponse('');
      setSelectedFeedback(null);
      setResponseType('custom');
      
      // Clear success message after 3 seconds
      setTimeout(() => setResponseSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error submitting response:', err);
      setResponseError('Failed to submit response. Please try again.');
    }
  };

  const selectResponseTemplate = (type) => {
    setResponseType(type);
    if (type !== 'custom') {
      setGuideResponse(responseTemplates[type]);
    } else {
      setGuideResponse('');
    }
  };
  
  const getFeedbackStatusLabel = (status) => {
    switch(status) {
      case 'pending': return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'assigned': return { text: 'Assigned', color: 'bg-blue-100 text-blue-800' };
      case 'responded': return { text: 'Responded', color: 'bg-purple-100 text-purple-800' };
      case 'resolved': return { text: 'Resolved', color: 'bg-green-100 text-green-800' };
      default: return { text: status.charAt(0).toUpperCase() + status.slice(1), color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  const getStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getFeedbackSentiment = (rating) => {
    if (rating >= 4) return "positive";
    if (rating >= 3) return "neutral";
    return "negative";
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p>Loading your feedback...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-500 text-center">{error}</p>
          <div className="mt-4 text-center">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Feedback Assigned to Me</h1>
          <div className="text-gray-600">
            Total: {feedback.length} | 
            Pending: {feedback.filter(f => f.status === 'assigned').length} | 
            Resolved: {feedback.filter(f => f.status === 'resolved').length}
          </div>
        </div>
        
        {responseSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {responseSuccess}
          </div>
        )}
        
        {feedback.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No feedback has been assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {feedback.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl text-yellow-500">{getStars(item.rating)}</span>
                        <span className="text-gray-600">({item.rating}/5)</span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        From: {item.userId?.name || item.userId?.email || 'Anonymous User'}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Date: {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-3 py-1 text-sm font-medium rounded-full ${getFeedbackStatusLabel(item.status).color}`}>
                      {getFeedbackStatusLabel(item.status).text}
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
                    <p className="text-gray-800">{item.text}</p>
                  </div>
                  
                  {item.guideResponse && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">Your Response:</h4>
                      <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                        <p className="text-gray-800">{item.guideResponse}</p>
                      </div>
                    </div>
                  )}
                  
                  {item.status !== 'resolved' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedFeedback(item);
                          // Reset response type each time feedback is selected
                          setResponseType('custom');
                          setGuideResponse('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {item.guideResponse ? 'Edit Response' : 'Respond'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Response Modal with Enhanced Guidance */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">Respond to Feedback</h2>
              
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-600">Customer Feedback:</h4>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">{getStars(selectedFeedback.rating)}</span>
                    <span className="text-sm text-gray-600">({selectedFeedback.rating}/5)</span>
                  </div>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2 mt-1 bg-blue-50">
                  <p className="text-gray-800">{selectedFeedback.text}</p>
                </div>
              </div>
              
              {/* Response Tips */}
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-600">Response Guidelines:</h4>
                  <button 
                    onClick={() => setShowTips(!showTips)}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    {showTips ? 'Hide Tips' : 'Show Tips'}
                  </button>
                </div>
                
                {showTips && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Always thank the customer for their feedback, regardless of sentiment</li>
                      <li>Address specific points mentioned in their feedback</li>
                      <li>For negative feedback, apologize and explain how you'll address concerns</li>
                      <li>Be professional and courteous at all times</li>
                      <li>If appropriate, invite the customer to return for another safari</li>
                      <li>Use "Resolve Issue" only when the matter has been fully addressed</li>
                    </ul>
                  </div>
                )}
              </div>
              
              {responseError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {responseError}
                </div>
              )}
              
              <form onSubmit={handleResponseSubmit}>
                {/* Response Template Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select a Response Template:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => selectResponseTemplate('positive')}
                      className={`p-2 rounded border text-left text-sm ${
                        responseType === 'positive' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <span className="font-medium">Positive</span>
                      <p className="text-xs text-gray-500 truncate">For high ratings and positive comments</p>
                    </button>
                    <button 
                      type="button"
                      onClick={() => selectResponseTemplate('neutral')}
                      className={`p-2 rounded border text-left text-sm ${
                        responseType === 'neutral' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      <span className="font-medium">Neutral</span>
                      <p className="text-xs text-gray-500 truncate">For average ratings with mixed feedback</p>
                    </button>
                    <button 
                      type="button"
                      onClick={() => selectResponseTemplate('negative')}
                      className={`p-2 rounded border text-left text-sm ${
                        responseType === 'negative' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                      }`}
                    >
                      <span className="font-medium">Negative</span>
                      <p className="text-xs text-gray-500 truncate">For lower ratings and issues</p>
                    </button>
                    <button 
                      type="button"
                      onClick={() => selectResponseTemplate('custom')}
                      className={`p-2 rounded border text-left text-sm ${
                        responseType === 'custom' ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                      }`}
                    >
                      <span className="font-medium">Custom Response</span>
                      <p className="text-xs text-gray-500 truncate">Write your own response</p>
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Response:</label>
                  <textarea
                    value={guideResponse}
                    onChange={(e) => setGuideResponse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="5"
                    placeholder="Enter your response to the customer's feedback..."
                    required
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500">
                    Be specific and mention aspects from their feedback. Tailor this response to address their concerns directly.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFeedback(null);
                      setGuideResponse('');
                      setResponseError('');
                      setResponseType('custom');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Response
                  </button>
                  <button
                    type="submit"
                    id="resolve"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Resolve Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideFeedback;
