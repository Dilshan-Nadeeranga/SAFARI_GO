import React, { useState } from 'react';
import '../Componets/CSS/LoginForm.css'; // Reuse the external CSS file
import axios from 'axios'; // Import axios to make API requests

const RegisterForm = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Clear previous error and success message
    setError('');
    setSuccessMessage('');

    // Prepare customer data
    const customerData = {
      name: fullName,
      Lname: username,
      Gender: 'Not Provided', // Can be updated if you want to add gender
      Phonenumber1: null, // Add phone number fields as required
      Phonenumber2: null, // Add phone number fields as required
      email: email,
      password: password
    };

    try {
      // Make the API request to the backend
      const response = await axios.post('http://localhost:8070/customerRoutes/register', customerData);

      // Handle success
      if (response.status === 201) {
        setSuccessMessage('Registration successful! You can now login.');
      }
    } catch (error) {
      // Handle error
      if (error.response) {
        setError(error.response.data.message || 'An error occurred during registration');
      } else {
        setError('Network error, please try again later.');
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Please Fill out the Form to Register!</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name:</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button type="submit">Register</button>
      </form>
      <p>Yes, I have an account? <a href="/LoginForm">Login</a></p>
    </div>
  );
};

export default RegisterForm;
