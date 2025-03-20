import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VehicleOwnerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('role') !== 'vehicle_owner') navigate('/LoginForm');
  }, [navigate]);

  return (
    <div>
      <h1>Vehicle Owner Dashboard</h1>
      <p>Welcome, Vehicle Owner! Manage your vehicles here.</p>
    </div>
  );
};

export default VehicleOwnerDashboard;