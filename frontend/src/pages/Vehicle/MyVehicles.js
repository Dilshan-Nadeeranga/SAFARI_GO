// frontend/src/pages/Vehicle/MyVehicles.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { FaCar, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaUpload } from "react-icons/fa"; // Import icons

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState({});
  const [editingVehicleId, setEditingVehicleId] = useState(null); // New state for editing
  const [editVehicle, setEditVehicle] = useState({}); // New state for edit form
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/LoginForm");
          return;
        }

        const [vehiclesRes, userRes] = await Promise.all([
          axios.get("http://localhost:8070/vehicles", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8070/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setVehicles(vehiclesRes.data);
        setUser(userRes.data);
        setNewVehicle({ ownerName: userRes.data.name, ownerContact: userRes.data.Phonenumber1 });
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/LoginForm");
        } else {
          setError("Failed to fetch vehicles or user profile. Please try again later.");
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axios.delete(`http://localhost:8070/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setVehicles(vehicles.filter((v) => v._id !== id));
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle.");
      }
    }
  };

  const handleAddVehicle = async () => {
    const requiredFields = [
      "type",
      "brand",
      "model",
      "registrationNumber",
      "seatingCapacity",
      "luggageCapacity",
      "numberOfDoors",
    ];
    if (requiredFields.some((field) => !newVehicle[field])) {
      setError("All fields should be filled");
      return;
    }
    console.log("Uploading picture:", newVehicle.picture);

    try {
      const data = new FormData();
      Object.entries(newVehicle).forEach(([key, value]) => data.append(key, value));
      const response = await axios.post("http://localhost:8070/vehicles", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setVehicles([...vehicles, response.data]);
      setIsAdding(false);
      setNewVehicle({ ownerName: user.name, ownerContact: user.Phonenumber1 });
      setError("");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Failed to add vehicle.");
    }
  };

  const handleUpdateVehicle = async () => {
    const requiredFields = [
      "type",
      "brand",
      "model",
      "registrationNumber",
      "seatingCapacity",
      "luggageCapacity",
      "numberOfDoors",
    ];
    if (requiredFields.some((field) => !editVehicle[field])) {
      setError("All required fields must be filled");
      return;
    }

    try {
      const data = new FormData();
      Object.entries(editVehicle).forEach(([key, value]) => {
        if (key !== "picture" || (key === "picture" && value instanceof File)) {
          data.append(key, value);
        }
      });

      const response = await axios.put(
        `http://localhost:8070/vehicles/${editingVehicleId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setVehicles(
        vehicles.map((v) => (v._id === editingVehicleId ? response.data : v))
      );
      setEditingVehicleId(null);
      setEditVehicle({});
      setError("");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      setError("Failed to update vehicle.");
    }
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex flex-col">
      <Header user={user} />
      <div className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaCar className="mr-3 text-indigo-600" /> My Vehicles
          </h2>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300"
            >
              <FaPlus className="mr-2" /> Add Vehicle
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
            {error}
          </div>
        )}

        {/* Vehicles List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              <FaCar className="text-5xl mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No vehicles found. Add a vehicle to get started!</p>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300"
              >
                {/* Vehicle Image */}
                <div className="h-48 w-full">
                  <img
                    src={
                      vehicle.picture
                        ? `http://localhost:8070/${vehicle.picture.replace(/\\/g, "/")}`
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Vehicle Details */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-gray-600">{vehicle.type}</p>
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Reg: {vehicle.registrationNumber}</p>
                    <p>Seats: {vehicle.seatingCapacity} | Doors: {vehicle.numberOfDoors}</p>
                    <p>Luggage: {vehicle.luggageCapacity} kg</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="p-5 pt-0 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditingVehicleId(vehicle._id);
                      setEditVehicle({ ...vehicle });
                    }}
                    className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    <FaEdit className="mr-1" /> Update
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle._id)}
                    className="flex items-center bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Vehicle Form */}
        {isAdding && (
          <div className="mt-10 bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaCar className="mr-3 text-indigo-600" /> Add a New Vehicle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="col-span-full">
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <FaUpload className="mr-2 text-indigo-600" /> Vehicle Image
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewVehicle({ ...newVehicle, picture: e.target.files[0] })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Owner Name (Disabled) */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Owner Name</label>
                <input
                  value={newVehicle.ownerName || ""}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              {/* Owner Contact (Disabled) */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Owner Contact</label>
                <input
                  value={newVehicle.ownerContact || ""}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              {/* Vehicle Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Vehicle Type</label>
                <input
                  placeholder="Vehicle Type"
                  onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Brand */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Brand</label>
                <input
                  placeholder="Brand"
                  onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Model */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Model</label>
                <input
                  placeholder="Model"
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Registration Number */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Registration Number</label>
                <input
                  placeholder="Registration Number"
                  onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* License Plate (Optional) */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">License Plate (Optional)</label>
                <input
                  placeholder="License Plate (optional)"
                  onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Seating Capacity */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Seating Capacity</label>
                <input
                  type="number"
                  placeholder="Seating Capacity"
                  onChange={(e) => setNewVehicle({ ...newVehicle, seatingCapacity: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Luggage Capacity */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Luggage Capacity (kg)</label>
                <input
                  type="number"
                  placeholder="Luggage Capacity"
                  onChange={(e) => setNewVehicle({ ...newVehicle, luggageCapacity: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Number of Doors */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Number of Doors</label>
                <input
                  type="number"
                  placeholder="Number of Doors"
                  onChange={(e) => setNewVehicle({ ...newVehicle, numberOfDoors: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {/* Error Message in Form */}
            {error && (
              <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-lg">
                {error}
              </div>
            )}
            {/* Form Actions */}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleAddVehicle}
                className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300"
              >
                <FaSave className="mr-2" /> Save Vehicle
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition duration-300"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Vehicle Form */}
        {editingVehicleId && (
          <div className="mt-10 bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaCar className="mr-3 text-indigo-600" /> Edit Vehicle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="col-span-full">
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <FaUpload className="mr-2 text-indigo-600" /> Vehicle Image
                </label>
                <input
                  type="file"
                  onChange={(e) => setEditVehicle({ ...editVehicle, picture: e.target.files[0] })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Vehicle Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Vehicle Type</label>
                <input
                  value={editVehicle.type || ""}
                  onChange={(e) => setEditVehicle({ ...editVehicle, type: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Brand */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Brand</label>
                <input
                  value={editVehicle.brand || ""}
                  onChange={(e) => setEditVehicle({ ...editVehicle, brand: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Model */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Model</label>
                <input
                  value={editVehicle.model || ""}
                  onChange={(e) => setEditVehicle({ ...editVehicle, model: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Registration Number */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Registration Number</label>
                <input
                  value={editVehicle.registrationNumber || ""}
                  onChange={(e) => setEditVehicle({ ...editVehicle, registrationNumber: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* License Plate (Optional) */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">License Plate (Optional)</label>
                <input
                  value={editVehicle.licensePlate || ""}
                  onChange={(e) => setEditVehicle({ ...editVehicle, licensePlate: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Seating Capacity */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Seating Capacity</label>
                <input
                  type="number"
                  value={editVehicle.seatingCapacity || ""}
                  onChange={(e) => setEditVehicle({ ...editVehicle, seatingCapacity: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Luggage Capacity */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Luggage Capacity (kg)</label>
                <input
                  type="number"
                  value={editVehicle.luggageCapacity || ""}
                  onChange={(e) => setEditVehicle({ ...editVehicle, luggageCapacity: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Number of Doors */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Number of Doors</label>
                <input
                  type="number"
                  value={editVehicle.numberOfDoors || ""}
                  onChange={(e) => setEditVehicle({ ...editVehicle, numberOfDoors: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {/* Error Message in Form */}
            {error && (
              <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-lg">
                {error}
              </div>
            )}
            {/* Form Actions */}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleUpdateVehicle}
                className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300"
              >
                <FaSave className="mr-2" /> Update Vehicle
              </button>
              <button
                onClick={() => setEditingVehicleId(null)}
                className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition duration-300"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVehicles;