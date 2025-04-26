import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddVehicle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    licensePlate: '',
    capacity: 4,
    features: '',
    ownerName: '',
    contactNumber: ''
  });
  const [images, setImages] = useState([]);
  const [licenseDoc, setLicenseDoc] = useState(null);
  const [insuranceDoc, setInsuranceDoc] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is a vehicle owner
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'vehicle_owner') {
      navigate('/LoginForm');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      
      // Create image previews
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleLicenseDocChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseDoc(e.target.files[0]);
    }
  };

  const handleInsuranceDocChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setInsuranceDoc(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate required fields
    if (!formData.type || !formData.licensePlate || !formData.ownerName || 
        !formData.contactNumber || !licenseDoc || !insuranceDoc || images.length === 0) {
      setError("Please fill in all required fields including documents and vehicle images");
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const featuresArray = formData.features
        ? formData.features.split(',').map(item => item.trim())
        : [];
      
      // Create FormData for file upload
      const vehicleFormData = new FormData();
      vehicleFormData.append('type', formData.type);
      vehicleFormData.append('licensePlate', formData.licensePlate);
      vehicleFormData.append('capacity', formData.capacity);
      vehicleFormData.append('features', JSON.stringify(featuresArray));
      vehicleFormData.append('ownerName', formData.ownerName);
      vehicleFormData.append('contactNumber', formData.contactNumber);
      
      // Log what we're sending for debugging
      const debugData = {
        type: formData.type,
        licensePlate: formData.licensePlate,
        capacity: formData.capacity,
        features: featuresArray,
        ownerName: formData.ownerName,
        contactNumber: formData.contactNumber,
        licenseDoc: licenseDoc ? licenseDoc.name : 'No file',
        insuranceDoc: insuranceDoc ? insuranceDoc.name : 'No file',
        images: images.map(img => img.name)
      };
      console.log('Sending vehicle data:', debugData);
      
      // Check if files are valid
      if (!(licenseDoc instanceof File)) {
        console.error('Invalid license document:', licenseDoc);
        setError("License document is invalid. Please select a PDF file.");
        setLoading(false);
        return;
      }
      
      if (!(insuranceDoc instanceof File)) {
        console.error('Invalid insurance document:', insuranceDoc);
        setError("Insurance document is invalid. Please select a PDF file.");
        setLoading(false);
        return;
      }
      
      // Append license document
      vehicleFormData.append('licenseDoc', licenseDoc);
      
      // Append insurance document
      vehicleFormData.append('insuranceDoc', insuranceDoc);
      
      // Append all selected vehicle images
      images.forEach((image) => {
        vehicleFormData.append('vehicleImages', image);
      });
      
      console.log('Submitting vehicle data to server...');
      const response = await axios.post(
        'http://localhost:8070/vehicles/',
        vehicleFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Server response:', response.data);
      
      if (response.status === 201) {
        setSuccess(true);
        // Force dashboard to refresh when returning by adding timestamp to localStorage
        localStorage.setItem('dashboard_refresh', Date.now().toString());
        setTimeout(() => {
          navigate('/VehicleOwnerDashboard', { state: { refresh: true } });
        }, 1500);
      }
    } catch (err) {
      console.error('Error adding vehicle:', err);
      
      // Better error handling with response inspection
      if (err.response) {
        console.error('Server responded with:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           'Failed to add vehicle. Please check server logs for details.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clean up image preview URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add New Vehicle</h1>
          <button 
            onClick={() => navigate('/VehicleOwnerDashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
        
        {success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
            Vehicle added successfully! Redirecting to dashboard...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
                {error}
              </div>
            )}
            
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Owner Information</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ownerName">
                Owner Name *
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                value={formData.ownerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="contactNumber">
                Contact Number *
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <h2 className="text-lg font-semibold text-gray-700 mt-6 mb-4 border-b pb-2">Vehicle Information</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="type">
                Vehicle Type *
              </label>
              <input
                id="type"
                name="type"
                type="text"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Jeep, Van, Car, etc."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="licensePlate">
                License Plate Number *
              </label>
              <input
                id="licensePlate"
                name="licensePlate"
                type="text"
                value={formData.licensePlate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ABC-1234"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="capacity">
                Passenger Capacity *
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="features">
                Features (comma-separated)
              </label>
              <input
                id="features"
                name="features"
                type="text"
                value={formData.features}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AC, GPS, Leather Seats"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate features with commas, e.g., "AC, WiFi, Child Seat"
              </p>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-700 mt-6 mb-4 border-b pb-2">Required Documents</h2>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="licenseDoc">
                License Document (PDF) *
              </label>
              <input
                id="licenseDoc"
                name="licenseDoc"
                type="file"
                accept=".pdf"
                onChange={handleLicenseDocChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a PDF of the vehicle's license document
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="insuranceDoc">
                Insurance Document (PDF) *
              </label>
              <input
                id="insuranceDoc"
                name="insuranceDoc"
                type="file"
                accept=".pdf"
                onChange={handleInsuranceDocChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a PDF of the vehicle's insurance document
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="vehicleImages">
                Vehicle Images *
              </label>
              <input
                id="vehicleImages"
                name="vehicleImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can select multiple images. Recommended size: 800x600 pixels.
              </p>
            </div>
            
            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Image Previews:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={src} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Adding...' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddVehicle;
