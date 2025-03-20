//frontend/src/pages/LoginFrom/js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Componets/CSS/LoginForm.css';
import axios from 'axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:8070/users/login', { email, password });
      if (response.status === 200) {
        setSuccessMessage('Login successful! Redirecting...');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);

        setTimeout(() => {
          switch (response.data.role) {
            case 'user':
              navigate('/UserHomepage');
              break;
            case 'guide':
              navigate('/GuideDashboard');
              break;
            case 'vehicle_owner':
              navigate('/VehicleOwnerDashboard');
              break;
            case 'admin':
              navigate('/Dashboard');
              break;
            default:
              navigate('/');
          }
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back!</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/RegistrationForm">Register</a></p>
    </div>
  );
};

export default LoginForm;