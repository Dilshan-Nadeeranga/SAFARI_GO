import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PremiumSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/LoginForm');
      return;
    }
    
    const fetchSubscribers = async () => {
      try {
        const response = await axios.get('http://localhost:8070/users/premium/subscribers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSubscribers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching premium subscribers:', err);
        setError('Failed to load premium subscribers');
        setLoading(false);
      }
    };
    
    fetchSubscribers();
  }, [navigate]);

  // Function to get the badge color based on plan
  const getPlanBadgeColor = (plan) => {
    switch(plan) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'silver': return 'bg-gray-200 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Premium Subscribers</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Active Premium Members</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {subscribers.length} active
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription History</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.length > 0 ? (
                subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subscriber.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{subscriber.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadgeColor(subscriber.premiumPlan)}`}>
                        {subscriber.premiumPlan ? subscriber.premiumPlan.charAt(0).toUpperCase() + subscriber.premiumPlan.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.discountRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.premiumUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.subscriptionHistory && subscriber.subscriptionHistory.length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">View History ({subscriber.subscriptionHistory.length})</summary>
                          <ul className="mt-2 space-y-1 text-xs">
                            {subscriber.subscriptionHistory.map((sub, index) => (
                              <li key={index} className="bg-gray-50 p-2 rounded">
                                <div><strong>Plan:</strong> {sub.plan}</div>
                                <div><strong>Purchased:</strong> {new Date(sub.purchasedAt).toLocaleDateString()}</div>
                                <div><strong>Expires:</strong> {new Date(sub.expiresAt).toLocaleDateString()}</div>
                                <div><strong>Amount:</strong> ${sub.amount}</div>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        'No history'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No premium subscribers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PremiumSubscribers;
