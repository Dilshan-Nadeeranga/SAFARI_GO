// frontend/src/pages/LoginForm.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract redirect information from location.state
  const redirectTo = location.state?.redirectTo || '';
  const safariData = location.state?.safari || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
  
    try {
      const response = await axios.post('http://localhost:8070/users/login', { email, password });
      console.log('Login response:', response.data);
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        console.log('Role set in localStorage:', localStorage.getItem('role'));
        setSuccessMessage('Login successful! Redirecting...');
        
        // Handle redirect with safari data if available
        if (redirectTo === '/BookSafari' && safariData) {
          setTimeout(() => navigate('/BookSafari', { state: { safari: safariData } }), 1000);
          return;
        }
        
        // Default redirects based on role
        switch (response.data.role) {
          case 'user':
            setTimeout(() => navigate('/UserHomepage'), 1000);
            break;
          case 'guide':
            setTimeout(() => navigate('/GuideDashboard'), 1000);
            break;
          case 'vehicle_owner':
            setTimeout(() => navigate('/VehicleOwnerDashboard'), 1000);
            break;
          case 'admin':
            setTimeout(() => navigate('/Dashboard'), 1000);
            break;
          default:
            setTimeout(() => navigate('/'), 1000);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back!</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-sm text-center">{successMessage}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href="/RegistrationForm"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;