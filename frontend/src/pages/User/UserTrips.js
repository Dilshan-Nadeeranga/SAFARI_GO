// frontend/src/pages/User/UserTrips.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Added for navigation

const UserTrips = () => {
  const navigate = useNavigate(); // Added for navigation
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/LoginForm"); // Redirect to login if no token
          return;
        }
        const response = await axios.get("http://localhost:8070/bookings/mybookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrips(response.data);
      } catch (error) {
        console.error("Error fetching trips:", error);
        navigate("/LoginForm"); // Redirect to login on error
      }
    };
    fetchTrips();
  }, [navigate]);

  if (!trips) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl">Loading trips...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Trips</h2>
          {trips.length === 0 ? (
            <p className="text-gray-600">No trips booked yet.</p>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Name:</strong> {trip.Fname} {trip.Lname}
                    </p>
                    <p className="text-gray-700">
                      <strong>Email:</strong> {trip.email || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Phone:</strong> {trip.Phonenumber1 || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Safari ID:</strong> {trip.safariId || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTrips;