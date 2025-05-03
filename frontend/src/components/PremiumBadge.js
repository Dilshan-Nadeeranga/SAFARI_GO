import React from 'react';

const PremiumBadge = ({ type = "default", plan = null }) => {
  if (type === "small") {
    return (
      <span className="inline-flex items-center">
        <span className="text-yellow-500 mr-1">✨</span>
        <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
          PREMIUM {plan ? `(${plan.toUpperCase()})` : ''}
        </span>
      </span>
    );
  }
  
  if (type === "header") {
    return (
      <div className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1 text-sm text-white">
        <span className="text-yellow-300 mr-1">✨</span> Premium Member
        {plan && <span className="ml-1 bg-white text-purple-700 text-xs px-1 py-0.5 rounded-full">{plan.toUpperCase()}</span>}
      </div>
    );
  }
  
  // Default badge
  return (
    <div className="inline-flex items-center">
      <span className="text-yellow-500 mr-1">✨</span>
      <span className="font-medium">Premium</span>
      {plan && <span className="ml-1 text-sm">({plan.toUpperCase()})</span>}
    </div>
  );
};

export default PremiumBadge;
