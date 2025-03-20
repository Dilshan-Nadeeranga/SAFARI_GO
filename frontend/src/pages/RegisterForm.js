// frontend/src/pages/RegisterForm.js
import React, { useState } from 'react';
import '../Componets/CSS/LoginForm.css';
import '../Componets/CSS/RegisterForm.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customerData, setCustomerData] = useState({ name: '', Lname: '', Gender: '', Phonenumber1: '', Phonenumber2: '', profilePicture: null });
  const [guideData, setGuideData] = useState({ name: '', experienceYears: '', specialties: '' });
  const [vehicleOwnerData, setVehicleOwnerData] = useState({ name: '', companyName: '', vehicles: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError("Email and Password fields are required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    if (role === 'user' && !customerData.name) {
      setError("Name is required for User");
      return false;
    }
    if (role === 'guide' && (!guideData.name || !guideData.experienceYears || !guideData.specialties)) {
      setError("All Guide fields are required");
      return false;
    }
    if (role === 'vehicle_owner' && (!vehicleOwnerData.name || !vehicleOwnerData.vehicles)) {
      setError("Name and Vehicle Type are required for Vehicle Owner");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setSuccessMessage('');

    let url, data, config = {};

    try {
      if (role === 'user') {
        url = 'http://localhost:8070/users/register/customer';
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('name', customerData.name);
        formData.append('Lname', customerData.Lname);
        formData.append('Gender', customerData.Gender);
        formData.append('Phonenumber1', customerData.Phonenumber1);
        formData.append('Phonenumber2', customerData.Phonenumber2);
        if (customerData.profilePicture) {
          formData.append('profilePicture', customerData.profilePicture);
        }
        data = formData;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else if (role === 'guide') {
        url = 'http://localhost:8070/users/register/guide';
        data = { email, password, ...guideData };
      } else if (role === 'vehicle_owner') {
        url = 'http://localhost:8070/users/register/vehicle_owner';
        const vehiclesArr = [{ type: vehicleOwnerData.vehicles, licensePlate: 'N/A' }];
        data = { email, password, ...vehicleOwnerData, vehicles: JSON.stringify(vehiclesArr) };
      } else {
        return;
      }

      const response = await axios.post(url, data, config);
      if (response.status === 201) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/LoginForm'), 2000);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || error.response.data.error || 'Error during registration');
      } else {
        setError(error.message || 'Error during registration');
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group-row">
          <div className="form-group">
            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="guide">Guide</option>
              <option value="vehicle_owner">Vehicle Owner</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
        </div>

        {role === 'user' && (
          <>
            <div className="form-group-row">
              <div className="form-group"><label>Name:</label><input value={customerData.name} onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })} required /></div>
              <div className="form-group"><label>Last Name:</label><input value={customerData.Lname} onChange={(e) => setCustomerData({ ...customerData, Lname: e.target.value })} /></div>
            </div>
            <div className="form-group-row">
              <div className="form-group"><label>Gender:</label><input value={customerData.Gender} onChange={(e) => setCustomerData({ ...customerData, Gender: e.target.value })} /></div>
              <div className="form-group"><label>Phone 1:</label><input value={customerData.Phonenumber1} onChange={(e) => setCustomerData({ ...customerData, Phonenumber1: e.target.value })} /></div>
            </div>
            <div className="form-group-row">
              <div className="form-group"><label>Phone 2:</label><input value={customerData.Phonenumber2} onChange={(e) => setCustomerData({ ...customerData, Phonenumber2: e.target.value })} /></div>
              <div className="form-group"><label>Profile Picture:</label><input type="file" accept="image/*" onChange={(e) => setCustomerData({ ...customerData, profilePicture: e.target.files[0] })} /></div>
            </div>
          </>
        )}

        {role === 'guide' && (
          <>
            <div className="form-group-row">
              <div className="form-group"><label>Name:</label><input value={guideData.name} onChange={(e) => setGuideData({ ...guideData, name: e.target.value })} required /></div>
              <div className="form-group"><label>Experience (Years):</label><input type="number" value={guideData.experienceYears} onChange={(e) => setGuideData({ ...guideData, experienceYears: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label>Specialties (comma-separated):</label><input value={guideData.specialties} onChange={(e) => setGuideData({ ...guideData, specialties: e.target.value })} required /></div>
          </>
        )}

        {role === 'vehicle_owner' && (
          <>
            <div className="form-group-row">
              <div className="form-group"><label>Name:</label><input value={vehicleOwnerData.name} onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, name: e.target.value })} required /></div>
              <div className="form-group"><label>Company Name:</label><input value={vehicleOwnerData.companyName} onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, companyName: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Vehicle Type:</label><input value={vehicleOwnerData.vehicles} onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, vehicles: e.target.value })} required /></div>
          </>
        )}

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/LoginForm">Login</a></p>
    </div>
  );
};

export default RegisterForm;
