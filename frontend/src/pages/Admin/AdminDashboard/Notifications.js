import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../AdminDashboard/Dashboard.css'; // Adjust CSS as needed

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8070/users/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="notifications">
      <h3>Notifications</h3>
      <ul>
        {notifications.map((notif) => (
          <li key={notif._id}>{notif.message} - {new Date(notif.createdAt).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;