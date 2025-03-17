import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Componets/CSS/LoginForm.css'; // Import the external CSS file
import axios from 'axios'; // Import axios for API requests

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError('');
    setSuccessMessage('');

    try {
      // Sending login request to the backend
      const response = await axios.post('http://localhost:8070/customerRoutes/login', {
        email,
        password,
      });

      if (response.status === 200) {
        setSuccessMessage('Login successful! Redirecting...');
        
        // Store user details (token, username, profile picture) in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user)); 
        
        // Redirect user after login
        setTimeout(() => {
          navigate('/UserHomepage');
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
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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