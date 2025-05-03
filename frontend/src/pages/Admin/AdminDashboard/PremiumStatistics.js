import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PremiumStatistics = () => {
  const [stats, setStats] = useState({
    totalPremiumUsers: 0,
    bronzePlan: 0,
    silverPlan: 0,
    goldPlan: 0,
    revenueFromSubscriptions: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to fetch premium statistics that can be called for refresh
  const fetchPremiumStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      console.log("Fetching premium statistics...");
      setRefreshing(true);
      
      // First get basic stats (always try this for total count)
      let basicPremiumCount = 0;
      try {
        console.log("Fetching from admin/stats endpoint");
        const statsResponse = await axios.get('http://localhost:8070/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (statsResponse.data && statsResponse.data.premiumUsers !== undefined) {
          console.log("Successfully retrieved basic premium stats");
          basicPremiumCount = statsResponse.data.premiumUsers || 0;
        }
      } catch (statsError) {
        console.error("Error fetching from admin/stats:", statsError);
      }
      
      // Always try to get detailed breakdown regardless of whether basic stats succeeded
      let subscribers = [];
      let responseReceived = false;
      let detailedStatsAvailable = false;
      
      // Try first endpoint for detailed data
      try {
        console.log("Trying users/premium/subscribers endpoint");
        const response = await axios.get('http://localhost:8070/users/premium/subscribers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        subscribers = response.data;
        responseReceived = true;
        console.log("Success from users/premium/subscribers!");
      } catch (err) {
        console.log("Failed to fetch from users/premium/subscribers, trying admin route");
        
        // Try second endpoint
        try {
          const response = await axios.get('http://localhost:8070/admin/premium-subscribers', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          subscribers = response.data;
          responseReceived = true;
          console.log("Success from admin/premium-subscribers!");
        } catch (adminErr) {
          console.error("Both premium subscriber endpoints failed");
        }
      }
      
      // Process detailed stats if available
      if (responseReceived && subscribers.length > 0) {
        detailedStatsAvailable = true;
        // Process subscribers data for detailed stats
        const bronze = subscribers.filter(s => s.premiumPlan?.toLowerCase() === 'bronze').length;
        const silver = subscribers.filter(s => s.premiumPlan?.toLowerCase() === 'silver').length;
        const gold = subscribers.filter(s => s.premiumPlan?.toLowerCase() === 'gold').length;
        
        // Calculate revenue from subscription history
        let revenue = 0;
        subscribers.forEach(sub => {
          if (sub.subscriptionHistory && sub.subscriptionHistory.length > 0) {
            revenue += sub.subscriptionHistory.reduce((sum, hist) => sum + (hist.amount || 0), 0);
          }
        });
        
        setStats({
          totalPremiumUsers: subscribers.length,
          bronzePlan: bronze,
          silverPlan: silver,
          goldPlan: gold,
          revenueFromSubscriptions: revenue,
          activeSubscriptions: subscribers.length
        });
      } else {
        // No detailed stats available, use basic count but set plan breakdown to unknown
        console.log("No detailed premium subscriber data available");
        setStats({
          totalPremiumUsers: basicPremiumCount,
          bronzePlan: 0,
          silverPlan: 0, 
          goldPlan: 0,
          revenueFromSubscriptions: 0,
          activeSubscriptions: basicPremiumCount
        });
      }
      
      setLoading(false);
      setRefreshing(false);
      setLastUpdated(new Date());
      
      // Log what data source we're using for clarity
      console.log(`Using ${detailedStatsAvailable ? 'detailed' : 'basic'} premium stats data`);
    } catch (err) {
      console.error('Error fetching premium statistics:', err);
      setError(err.message);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchPremiumStatistics();
  };
  
  useEffect(() => {
    fetchPremiumStatistics();
    
    // Optional: Set up auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchPremiumStatistics();
    }, 5 * 60 * 1000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="animate-pulse p-4">Loading premium statistics...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Premium Subscribers</h2>
        <div className="flex items-center">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className={`mr-3 text-sm px-3 py-1 rounded ${refreshing 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
          >
            {refreshing ? (
              <>
                <span className="inline-block animate-spin mr-1">⟳</span> Refreshing...
              </>
            ) : (
              <>Refresh</>
            )}
          </button>
          <Link 
            to="/admin/premium-subscribers"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            View All
          </Link>
        </div>
      </div>
      
      {lastUpdated && (
        <p className="text-xs text-gray-500 mb-3">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-500 mb-1">Total Premium Users</p>
          <p className="text-xl font-bold">{stats.totalPremiumUsers}</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="text-sm text-amber-500 mb-1">Bronze Plan</p>
          <p className="text-xl font-bold">{stats.bronzePlan}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Silver Plan</p>
          <p className="text-xl font-bold">{stats.silverPlan}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm text-yellow-600 mb-1">Gold Plan</p>
          <p className="text-xl font-bold">{stats.goldPlan}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg col-span-2">
          <p className="text-sm text-green-500 mb-1">Subscription Revenue</p>
          <p className="text-xl font-bold">${stats.revenueFromSubscriptions.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <p>Active subscriptions: {stats.activeSubscriptions}</p>
        <Link 
          to="/admin/premium-subscribers"
          className="text-blue-600 hover:text-blue-800"
        >
          Manage Subscriptions →
        </Link>
      </div>
    </div>
  );
};

export default PremiumStatistics;
