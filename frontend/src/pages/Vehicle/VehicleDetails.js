import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        // For public viewing, we don't need authentication
        const response = await axios.get(`http://localhost:8070/vehicles/public/${id}`);
        setVehicle(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vehicle details:', err);
        setError('Failed to load vehicle details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchVehicleDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
      <div className="text-xl font-semibold text-gray-600">Loading vehicle details...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
      <div className="text-xl font-semibold text-red-600">{error}</div>
    </div>
  );

  if (!vehicle) return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
      <div className="text-xl font-semibold text-gray-600">Vehicle not found</div>
    </div>
  );

  // Helper function to get image URL or placeholder
  const getImageUrl = (index) => {
    if (vehicle.images && vehicle.images[index]) {
      return `http://localhost:8070/${vehicle.images[index]}`;
    }
    return `https://via.placeholder.com/800x500?text=${encodeURIComponent(vehicle.type)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Back button */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">{vehicle.type}</h1>
              <button
                onClick={() => navigate('/vehicles')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Back to All Vehicles
              </button>
            </div>
          </div>

          {/* Image gallery */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img 
                src={getImageUrl(activeImageIndex)} 
                alt={`${vehicle.type} - View ${activeImageIndex + 1}`}
                className="object-cover w-full h-80"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/800x500?text=${encodeURIComponent(vehicle.type)}`;
                }}
              />
            </div>
            
            {/* Thumbnails */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="flex overflow-x-auto p-2 gap-2 bg-white">
                {vehicle.images.map((image, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${activeImageIndex === idx ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <img 
                      src={`http://localhost:8070/${image}`} 
                      alt={`${vehicle.type} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/100?text=${idx + 1}`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Vehicle Information</h2>
                <p className="mb-3"><span className="font-medium">Type:</span> {vehicle.type}</p>
                <p className="mb-3"><span className="font-medium">License Plate:</span> {vehicle.licensePlate}</p>
                <p className="mb-3"><span className="font-medium">Capacity:</span> {vehicle.capacity} passengers</p>
                
                {vehicle.features && vehicle.features.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium mb-2">Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.features.map((feature, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Contact Information</h2>
                {vehicle.ownerName && (
                  <p className="mb-3"><span className="font-medium">Owner:</span> {vehicle.ownerName}</p>
                )}
                {vehicle.contactNumber && (
                  <p className="mb-3"><span className="font-medium">Contact:</span> {vehicle.contactNumber}</p>
                )}
                <div className="mt-6 space-y-3">
                  <button 
                    onClick={() => navigate('/rent-vehicle', { state: { vehicle } })}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Rent this Vehicle
                  </button>
                  
                  <button 
                    onClick={() => window.location.href = `tel:${vehicle.contactNumber}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full flex items-center justify-center gap-2"
                    disabled={!vehicle.contactNumber}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Contact Owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
