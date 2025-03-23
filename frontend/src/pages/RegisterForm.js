// frontend/src/pages/RegisterForm.js
import React, { useState } from 'react';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="user">User</option>
                <option value="guide">Guide</option>
                <option value="vehicle_owner">Vehicle Owner</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {role === 'user' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    value={customerData.Lname}
                    onChange={(e) => setCustomerData({ ...customerData, Lname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <input
                    value={customerData.Gender}
                    onChange={(e) => setCustomerData({ ...customerData, Gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your gender"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone 1</label>
                  <input
                    value={customerData.Phonenumber1}
                    onChange={(e) => setCustomerData({ ...customerData, Phonenumber1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter primary phone"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone 2</label>
                  <input
                    value={customerData.Phonenumber2}
                    onChange={(e) => setCustomerData({ ...customerData, Phonenumber2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter secondary phone (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCustomerData({ ...customerData, profilePicture: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {role === 'guide' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    value={guideData.name}
                    onChange={(e) => setGuideData({ ...guideData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                  <input
                    type="number"
                    value={guideData.experienceYears}
                    onChange={(e) => setGuideData({ ...guideData, experienceYears: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter years of experience"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Specialties (comma-separated)</label>
                <input
                  value={guideData.specialties}
                  onChange={(e) => setGuideData({ ...guideData, specialties: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Wildlife, Adventure"
                />
              </div>
            </>
          )}

          {role === 'vehicle_owner' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    value={vehicleOwnerData.name}
                    onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    value={vehicleOwnerData.companyName}
                    onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter company name (optional)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                <input
                  value={vehicleOwnerData.vehicles}
                  onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, vehicles: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Jeep, Van"
                />
              </div>
            </>
          )}

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
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a
            href="/LoginForm"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;