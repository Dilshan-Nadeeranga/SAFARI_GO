import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditVehicleModal = ({ vehicle, isOpen, onClose, onUpdate }) => {
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
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vehicle && isOpen) {
      setFormData({
        type: vehicle.type || '',
        licensePlate: vehicle.licensePlate || '',
        capacity: vehicle.capacity || 4,
        features: vehicle.features ? vehicle.features.join(', ') : '',
        ownerName: vehicle.ownerName || '',
        contactNumber: vehicle.contactNumber || ''
      });
      
      setExistingImages(vehicle.images || []);
      setImagePreviews([]);
      setImages([]);
      setError(null);
      setLicenseDoc(null);
      setInsuranceDoc(null);
    }
  }, [vehicle, isOpen]);

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

  const toggleImageSelection = (imagePath) => {
    if (existingImages.includes(imagePath)) {
      setExistingImages(existingImages.filter(img => img !== imagePath));
    } else {
      setExistingImages([...existingImages, imagePath]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
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
      
      // Add existing images to keep
      existingImages.forEach(image => {
        vehicleFormData.append('keepImages', image);
      });
      
      // Add new license document if provided
      if (licenseDoc) {
        vehicleFormData.append('licenseDoc', licenseDoc);
      }
      
      // Add new insurance document if provided
      if (insuranceDoc) {
        vehicleFormData.append('insuranceDoc', insuranceDoc);
      }
      
      // Append new images if any
      images.forEach((image, index) => {
        vehicleFormData.append('vehicleImages', image);
      });
      
      const response = await axios.put(
        `http://localhost:8070/vehicles/${vehicle._id}`,
        vehicleFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.status === 200) {
        onUpdate(response.data.vehicle);
        onClose();
      }
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError(err.response?.data?.error || 'Failed to update vehicle. Please try again.');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Edit Vehicle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">Owner Information</h3>
          
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <h3 className="text-lg font-medium text-gray-700 mb-3 mt-6 border-b pb-2">Vehicle Information</h3>
          
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="features">
              Features (comma-separated)
            </label>
            <input
              id="features"
              name="features"
              type="text"
              value={formData.features}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AC, GPS, Leather Seats"
            />
          </div>
          
          <h3 className="text-lg font-medium text-gray-700 mb-3 mt-6 border-b pb-2">Documents</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="licenseDoc">
              Update License Document (PDF)
            </label>
            <input
              id="licenseDoc"
              name="licenseDoc"
              type="file"
              accept=".pdf"
              onChange={handleLicenseDocChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {vehicle.licenseDoc && (
              <div className="mt-1 text-sm">
                <span className="text-gray-600">Current document: </span>
                <a 
                  href={`http://localhost:8070/${vehicle.licenseDoc}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  View License Document
                </a>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="insuranceDoc">
              Update Insurance Document (PDF)
            </label>
            <input
              id="insuranceDoc"
              name="insuranceDoc"
              type="file"
              accept=".pdf"
              onChange={handleInsuranceDocChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {vehicle.insuranceDoc && (
              <div className="mt-1 text-sm">
                <span className="text-gray-600">Current document: </span>
                <a 
                  href={`http://localhost:8070/${vehicle.insuranceDoc}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Insurance Document
                </a>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Current Images
            </label>
            {vehicle.images && vehicle.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {vehicle.images.map((imagePath, index) => (
                  <div 
                    key={index} 
                    className={`relative border rounded p-1 ${existingImages.includes(imagePath) ? 'border-blue-500' : 'border-gray-300 opacity-50'}`}
                    onClick={() => toggleImageSelection(imagePath)}
                  >
                    <img
                      src={`http://localhost:8070/${imagePath}`}
                      alt={`Vehicle ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/150?text=Image+Error`;
                      }}
                    />
                    <div className="absolute top-1 right-1">
                      <span className={`inline-block w-5 h-5 rounded-full ${existingImages.includes(imagePath) ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                    </div>
                    <div className="text-xs text-center mt-1">
                      {existingImages.includes(imagePath) ? 'Selected' : 'Removed'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No existing images</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="vehicleImages">
              Add New Images
            </label>
            <input
              id="vehicleImages"
              name="vehicleImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {imagePreviews.length > 0 && (
            <div className="mb-4">
              <p className="block text-gray-700 font-medium mb-2">New Images Preview</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={src} 
                      alt={`New upload preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal;
