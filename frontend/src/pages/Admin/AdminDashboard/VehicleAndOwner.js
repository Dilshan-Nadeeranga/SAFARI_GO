// frontend/src/pages/Admin/AdminDashboard/VehicleAndOwner.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const VehicleAndOwner = () => {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axios.get("http://localhost:8070/admin/vehicle-owners", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOwners(response.data);
      } catch (error) {
        console.error("Error fetching owners:", error);
      }
    };
    fetchOwners();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8070/admin/vehicles/search?licensePlate=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching vehicles:", error);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get("http://localhost:8070/admin/reports/vehicles-rented", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "rented_vehicles_report.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="bg-gray-200 p-4 rounded mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by License Plate"
          className="p-2 border rounded"
        />
        <button onClick={handleSearch} className="ml-2 bg-blue-600 text-white p-2 rounded">
          Search
        </button>
        <button onClick={handleDownloadReport} className="ml-2 bg-green-600 text-white p-2 rounded">
          Download Report
        </button>
      </div>
      {searchResults.length > 0 ? (
        <div>
          <h3>Search Results</h3>
          {searchResults.map((vehicle) => (
            <div key={vehicle._id} className="bg-white p-4 rounded-lg shadow-lg mb-4">
              <p>Type: {vehicle.type}</p>
              <p>Brand: {vehicle.brand}</p>
              <p>Model: {vehicle.model}</p>
              <p>License Plate: {vehicle.licensePlate}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Vehicle Owners</h2>
          {owners.map((owner) => (
            <div
              key={owner._id}
              className="bg-white p-4 rounded-lg shadow-lg mb-4 cursor-pointer"
              onClick={() => setSelectedOwner(owner)}
            >
              <p>Name: {owner.name}</p>
              <p>Email: {owner.email}</p>
            </div>
          ))}
          {selectedOwner && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3>{selectedOwner.name}'s Vehicles</h3>
              {selectedOwner.vehicles.map((vehicle) => (
                <div key={vehicle._id} className="mt-4">
                  <p>Type: {vehicle.type}</p>
                  <p>Brand: {vehicle.brand}</p>
                  <p>Model: {vehicle.model}</p>
                  <p>Registration Number: {vehicle.registrationNumber}</p>
                  <p>License Plate: {vehicle.licensePlate || "N/A"}</p>
                  <p>Seating Capacity: {vehicle.seatingCapacity}</p>
                  <p>Luggage Capacity: {vehicle.luggageCapacity}</p>
                  <p>Number of Doors: {vehicle.numberOfDoors}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleAndOwner;