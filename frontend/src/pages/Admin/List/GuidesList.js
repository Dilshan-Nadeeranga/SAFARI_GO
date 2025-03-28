import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';

const GuidesList = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8070/users/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGuides(response.data.filter(user => user.role === 'guide'));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching guides:', error);
        setError('Failed to load guides');
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <div className="users-list">
          <h2 className="text-xl font-semibold mb-4">All Guides</h2>
          
          {loading ? (
            <p>Loading guides...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Experience</th>
                  <th>Specialties</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.length > 0 ? (
                  guides.map((guide) => (
                    <tr key={guide._id}>
                      <td>{guide._id.substring(0, 8)}</td>
                      <td>{guide.email}</td>
                      <td>{guide.name || "N/A"}</td>
                      <td>{guide.experienceYears || "N/A"} years</td>
                      <td>{guide.specialties ? guide.specialties.join(", ") : "N/A"}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn">View</button>
                          <button className="edit-btn">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No guides found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidesList;
