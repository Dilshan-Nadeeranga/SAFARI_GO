import React from 'react';
import { useNavigate } from 'react-router-dom';

const PremiumStatusSummary = ({ premiumStatus, size = 'normal' }) => {
  const navigate = useNavigate();
  
  if (!premiumStatus) {
    return null;
  }
  
  const { isPremium, plan, premiumUntil, discountRate } = premiumStatus;
  
  // Generate plan display name with proper capitalization
  const planName = plan?.charAt(0).toUpperCase() + plan?.slice(1) || 'Premium';
  
  // Different sizes for different contexts
  if (size === 'compact') {
    if (isPremium) {
      return (
        <div className="flex items-center">
          <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
            <span className="mr-1">✨</span> {planName}
          </span>
          <span className="ml-1 text-xs text-gray-500">({discountRate}% OFF)</span>
        </div>
      );
    }
    return null;
  }
  
  if (isPremium) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-3 rounded-md border border-purple-200">
        <div className="flex items-center mb-1">
          <span className="text-purple-700 mr-2">✨</span>
          <span className="font-medium text-purple-800">{planName} Member</span>
          <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">{discountRate}% OFF</span>
        </div>
        <p className="text-xs text-purple-700">
          Active until: {new Date(premiumUntil).toLocaleDateString()}
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-3 border border-gray-200 rounded-md">
      <p className="text-gray-600 mb-2">You're not a premium member yet.</p>
      <button 
        onClick={() => navigate('/user/subscriptions')}
        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Upgrade Now
      </button>
    </div>
  );
};

export default PremiumStatusSummary;
