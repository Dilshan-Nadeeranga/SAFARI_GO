//frontend/src/pages/Guide/GuideDashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GuideDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('role') !== 'guide') navigate('/LoginForm');
  }, [navigate]);

  return (
    <div>
      <h1>Guide Dashboard</h1>
      <p>Welcome, Guide! Manage your safari tours here.</p>
    </div>
  );
};

export default GuideDashboard;