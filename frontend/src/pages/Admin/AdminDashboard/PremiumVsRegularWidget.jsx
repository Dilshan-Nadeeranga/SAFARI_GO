import React from 'react';
import { Link } from 'react-router-dom';

const PremiumVsRegularWidget = ({ regularCount, premiumCount }) => {
  const total = regularCount + premiumCount;
  const premiumPercentage = total > 0 ? Math.round((premiumCount / total) * 100) : 0;
  
  return (
    <div className="widget">
      <div className="left">
        <span className="title">User Types</span>
        <div className="counter">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{regularCount} Regular</span>
            <span className="font-bold text-yellow-500">{premiumCount} Premium</span>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-yellow-400 h-2.5 rounded-full" 
            style={{ width: `${premiumPercentage}%` }}
          ></div>
        </div>
        <span className="link">
          <Link to="/admin/premium-subscribers">View premium subscribers</Link>
        </span>
      </div>
      <div className="right">
        <div className="percentage positive">
          <span>{premiumPercentage}%</span>
        </div>
        {/* Premium users icon */}
        <div className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default PremiumVsRegularWidget;
