import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../Componet/CSS/Dashboard.css';
import SafariReviewModal from './SafariReviewModal';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [safaris, setSafaris] = useState({});
  const [selectedSafari, setSelectedSafari] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'safari'

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/users/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
        
        // Extract safari notifications and fetch safari details
        const safariNotifications = response.data.filter(
          n => n.type === 'SAFARI_CREATED' || n.type === 'SAFARI_UPDATED'
        );
        
        if (safariNotifications.length > 0) {
          fetchSafariDetails(safariNotifications, token);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    };
    
    const fetchSafariDetails = async (safariNotifs, token) => {
      try {
        const safariMap = {};
        
        for (const notif of safariNotifs) {
          if (notif.details && notif.details.safariId) {
            try {
              const response = await axios.get(`http://localhost:8070/safaris/${notif.details.safariId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              safariMap[notif.details.safariId] = response.data;
            } catch (err) {
              console.error(`Error fetching safari ${notif.details.safariId}:`, err);
            }
          }
        }
        
        setSafaris(safariMap);
      } catch (err) {
        console.error('Error fetching safari details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const handleReviewClick = (safariId) => {
    setSelectedSafari(safaris[safariId]);
    setIsReviewModalOpen(true);
  };
  
  const handleApprove = async (feedback) => { // Add feedback parameter
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8070/safaris/${selectedSafari._id}/approve`, 
        { feedback }, // Now feedback is defined
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await markNotificationAsRead(selectedSafari._id);
      setIsReviewModalOpen(false);
      
      // Show success message
      alert('Safari package approved successfully!');
      
      // Refresh notifications
      window.location.reload();
    } catch (err) {
      console.error('Error approving safari:', err);
      alert('Failed to approve safari: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };
  
  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use the feedback from the modal
      const feedback = document.getElementById('rejection-feedback').value;
      
      if (!feedback) {
        alert('Please provide feedback for rejection');
        return;
      }
      
      await axios.put(`http://localhost:8070/safaris/${selectedSafari._id}/reject`, 
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await markNotificationAsRead(selectedSafari._id);
      setIsReviewModalOpen(false);
      
      // Show success message
      alert('Safari package rejected with feedback');
      
      // Refresh notifications
      window.location.reload();
    } catch (err) {
      console.error('Error rejecting safari:', err);
      alert('Failed to reject safari: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const markNotificationAsRead = async (safariId) => {
    try {
      const token = localStorage.getItem('token');
      const notif = notifications.find(n => 
        n.details && n.details.safariId === safariId
      );
      
      if (notif) {
        await axios.put(`http://localhost:8070/users/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'safari') {
      return notifications.filter(n => 
        n.type === 'SAFARI_CREATED' || n.type === 'SAFARI_UPDATED'
      );
    }
    return notifications;
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading notifications...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="notifications-container p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Notifications</h2>
          
          {/* Filter tabs */}
          <div className="flex mb-4 border-b">
            <button 
              className={`py-2 px-4 mr-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600'}`}
              onClick={() => setActiveTab('all')}
            >
              All Notifications
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'safari' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600'}`}
              onClick={() => setActiveTab('safari')}
            >
              Safari Packages
            </button>
          </div>
          
          {filteredNotifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <div className="notifications-list space-y-4">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification._id} 
                  className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{notification.type || 'Notification'}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1">{notification.message}</p>
                  
                  {/* Show action buttons for safari notifications */}
                  {(notification.type === 'SAFARI_CREATED' || notification.type === 'SAFARI_UPDATED') && 
                   notification.details && notification.details.safariId && safaris[notification.details.safariId] && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleReviewClick(notification.details.safariId)}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Review Package
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Safari Review Modal */}
      {selectedSafari && (
        <SafariReviewModal
          safari={selectedSafari}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default AdminNotifications;
