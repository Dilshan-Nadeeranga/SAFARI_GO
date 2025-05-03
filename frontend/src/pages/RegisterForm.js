// frontend/src/pages/RegisterForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterForm.css'; // Create this file if it doesn't exist

const RegisterForm = () => {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customerData, setCustomerData] = useState({ name: '', Lname: '', Gender: '', Phonenumber1: '', Phonenumber2: '', profilePicture: null });
  const [guideData, setGuideData] = useState({ name: '', experienceYears: '', specialties: '' });
  const [vehicleOwnerData, setVehicleOwnerData] = useState({ name: '', companyName: '', vehicles: '', contactNumber: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Form validation function - ensure all required fields are filled
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
    
    // Role-specific validation
    if (role === 'user' && !customerData.name) {
      setError("Name is required for Customer");
      return false;
    }
    if (role === 'guide' && (!guideData.name || !guideData.experienceYears || !guideData.specialties)) {
      setError("All Guide fields are required");
      return false;
    }
    if (role === 'vehicle_owner' && (!vehicleOwnerData.name || !vehicleOwnerData.vehicles || !vehicleOwnerData.contactNumber)) {
      setError("Name, Contact Number and Vehicle Type are required for Vehicle Owner");
      return false;
    }
    return true;
  };

  // Handle file upload for customer profile picture
  const handleFileChange = (e) => {
    setCustomerData({
      ...customerData,
      profilePicture: e.target.files[0]
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setSuccessMessage('');

    let url, data, config = {};

    try {
      // Different API endpoints and data formats for each user type
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
        data = { 
          email, 
          password, 
          name: guideData.name,
          experienceYears: guideData.experienceYears,
          specialties: guideData.specialties 
        };
      } else if (role === 'vehicle_owner') {
        url = 'http://localhost:8070/users/register/vehicle_owner';
        const vehiclesArr = [{ type: vehicleOwnerData.vehicles, licensePlate: 'N/A' }];
        data = { 
          email, 
          password, 
          name: vehicleOwnerData.name,
          companyName: vehicleOwnerData.companyName,
          contactNumber: vehicleOwnerData.contactNumber,
          vehicles: JSON.stringify(vehiclesArr) 
        };
      } else {
        return;
      }

      // Make the API call
      const response = await axios.post(url, data, config);
      if (response.status === 201) {
        setSuccessMessage(`Registration successful as ${role.replace('_', ' ')}! Redirecting to login...`);
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

  // Add proper styling and UX improvements
  return (
    <div className="register-container min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Create Your Account</h2>
          <p className="mt-2 text-gray-600">Join SafariGo and start your adventure</p>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2 px-4 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('guide')}
                  className={`py-2 px-4 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    role === 'guide' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Guide
                </button>
                <button
                  type="button"
                  onClick={() => setRole('vehicle_owner')}
                  className={`py-2 px-4 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    role === 'vehicle_owner' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Vehicle Owner
                </button>
              </div>
            </div>

            {/* Common fields for all users */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Role-specific fields */}
            {role === 'user' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      value={customerData.Lname}
                      onChange={(e) => setCustomerData({ ...customerData, Lname: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={customerData.Gender}
                    onChange={(e) => setCustomerData({ ...customerData, Gender: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      value={customerData.Phonenumber1}
                      onChange={(e) => setCustomerData({ ...customerData, Phonenumber1: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alternate Phone</label>
                    <input
                      value={customerData.Phonenumber2}
                      onChange={(e) => setCustomerData({ ...customerData, Phonenumber2: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      type="tel"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {role === 'guide' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    value={guideData.name}
                    onChange={(e) => setGuideData({ ...guideData, name: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={guideData.experienceYears}
                    onChange={(e) => setGuideData({ ...guideData, experienceYears: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialties (comma-separated)</label>
                  <input
                    value={guideData.specialties}
                    onChange={(e) => setGuideData({ ...guideData, specialties: e.target.value })}
                    required
                    placeholder="e.g., Wildlife, Hiking, Cultural Tours"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate specialties with commas
                  </p>
                </div>
              </div>
            )}

            {role === 'vehicle_owner' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    value={vehicleOwnerData.name}
                    onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, name: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    value={vehicleOwnerData.contactNumber}
                    onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, contactNumber: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name (Optional)</label>
                  <input
                    value={vehicleOwnerData.companyName}
                    onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, companyName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                  <input
                    value={vehicleOwnerData.vehicles}
                    onChange={(e) => setVehicleOwnerData({ ...vehicleOwnerData, vehicles: e.target.value })}
                    required
                    placeholder="e.g., SUV, Jeep, Van"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    You can add more vehicles after registration
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/LoginForm" className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;