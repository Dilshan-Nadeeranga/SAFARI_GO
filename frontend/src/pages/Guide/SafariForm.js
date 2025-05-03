import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SafariForm = ({ safari, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
    price: '',
    capacity: '',
    includes: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data if editing an existing safari
  useEffect(() => {
    if (safari) {
      setFormData({
        title: safari.title || '',
        description: safari.description || '',
        location: safari.location || '',
        duration: safari.duration || '',
        price: safari.price || '',
        capacity: safari.capacity || '',
        includes: safari.includes ? safari.includes.join(', ') : ''
      });
    }
  }, [safari]);

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
      
      // Clean up previous previews to avoid memory leaks
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        console.log(`Adding form field: ${key} = ${formData[key]}`);
        formDataToSend.append(key, formData[key]);
      });
      
      // Append images if any
      if (images.length > 0) {
        console.log(`Adding ${images.length} images`);
        images.forEach((image) => {
          formDataToSend.append('images', image);
          console.log(`Added image: ${image.name}`);
        });
      } else if (safari && safari.images) {
        console.log('No new images to upload. Keeping existing images.');
        // Optionally add a flag to indicate keeping existing images
        formDataToSend.append('keepExistingImages', 'true');
      }
      
      console.log('Submitting form with token:', token.substring(0, 10) + '...');
      
      if (safari) {
        // Update existing safari
        console.log(`Updating safari: ${safari._id}`);
        const response = await axios.put(`http://localhost:8070/safaris/${safari._id}`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Update response:', response.data);
      } else {
        // Create new safari
        console.log('Creating new safari package');
        const response = await axios.post('http://localhost:8070/safaris', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Creation response:', response.data);
      }
      
      // Clean up image previews
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      onSubmit(); // Notify parent component of successful submission
    } catch (err) {
      console.error('Error submitting safari package:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
        setError(err.response.data.error || err.response.data.message || 'Failed to submit safari package');
      } else if (err.request) {
        console.error('Request was made but no response received');
        setError('Server did not respond. Please try again later.');
      } else {
        setError('Error preparing request: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">
        {safari ? 'Edit Safari Package' : 'Add New Safari Package'}
      </h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Safari package title"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="location">
              Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Safari location"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the safari package"
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="duration">
              Duration (hours) *
            </label>
            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Duration in hours"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
              Price (Rs) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Price in rupees"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="capacity">
              Group Capacity *
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
              placeholder="Maximum group size"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="includes">
            What's Included (comma-separated) *
          </label>
          <input
            id="includes"
            name="includes"
            type="text"
            value={formData.includes}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Guide, Transport, Lunch, Binoculars"
          />
          <p className="text-xs text-gray-500 mt-1">Separate items with commas</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="images">
            Safari Images {!safari && '*'}
          </label>
          <input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={!safari}
          />
          <p className="text-xs text-gray-500 mt-1">You can select up to 5 images. Maximum size: 5MB per image.</p>
        </div>
        
        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-4">
            <p className="block text-gray-700 font-medium mb-2">Image Previews:</p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative">
                  <img 
                    src={src} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Existing images (if editing) */}
        {safari && safari.images && safari.images.length > 0 && (
          <div className="mb-4">
            <p className="block text-gray-700 font-medium mb-2">Current Images:</p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {safari.images.map((imagePath, index) => (
                <div key={index} className="relative">
                  <img 
                    src={`http://localhost:8070/${imagePath}`}
                    alt={`Safari ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Submitting...' : safari ? 'Update Package' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SafariForm;
