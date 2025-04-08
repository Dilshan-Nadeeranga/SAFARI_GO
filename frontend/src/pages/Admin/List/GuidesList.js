import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../AdminDashboard/Sidebar';
import '../AdminDashboard/Dashboard.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const GuidesList = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

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

  const handleViewGuide = (guide) => {
    setSelectedGuide(guide);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedGuide(null);
  };

  // Generate PDF for a single guide
  const generateGuidePdf = (guide) => {
    setPdfLoading(true);
    
    try {
      const doc = new jsPDF();
      
      // Add title and basic info
      doc.setFontSize(18);
      doc.text(`Guide Profile: ${guide.name || guide.email}`, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add a horizontal line
      doc.setLineWidth(0.5);
      doc.line(14, 35, 196, 35);
      
      // Add guide info
      doc.setFontSize(14);
      doc.text('Personal Information', 14, 45);
      
      // Basic guide information
      const guideInfo = [
        { label: 'ID:', value: guide._id },
        { label: 'Name:', value: guide.name || 'Not provided' },
        { label: 'Email:', value: guide.email },
        { label: 'Experience:', value: `${guide.experienceYears || 'Not specified'} years` },
        { label: 'Contact:', value: guide.contactNumber || 'Not provided' },
      ];
      
      let yPos = 55;
      guideInfo.forEach(item => {
        doc.text(`${item.label} ${item.value}`, 14, yPos);
        yPos += 10;
      });
      
      // Add specialties if available
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Specialties', 14, yPos);
      yPos += 10;
      
      if (guide.specialties && guide.specialties.length > 0) {
        guide.specialties.forEach(specialty => {
          doc.setFontSize(12);
          doc.text(`• ${specialty}`, 20, yPos);
          yPos += 8;
        });
      } else {
        doc.setFontSize(12);
        doc.text('No specialties listed', 20, yPos);
        yPos += 10;
      }
      
      // Add languages if available
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Languages', 14, yPos);
      yPos += 10;
      
      if (guide.languages && guide.languages.length > 0) {
        guide.languages.forEach(language => {
          doc.setFontSize(12);
          doc.text(`• ${language}`, 20, yPos);
          yPos += 8;
        });
      } else {
        doc.setFontSize(12);
        doc.text('No languages listed', 20, yPos);
        yPos += 10;
      }
      
      // Add bio if available
      if (guide.bio) {
        yPos += 10;
        doc.setFontSize(14);
        doc.text('Biography', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        const bioLines = doc.splitTextToSize(guide.bio, 180);
        doc.text(bioLines, 14, yPos);
      }
      
      // Save the PDF
      doc.save(`guide_profile_${guide.name || guide._id.substring(0, 8)}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

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
                          <button 
                            className="view-btn"
                            onClick={() => handleViewGuide(guide)}
                          >
                            View
                          </button>
                          <button 
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 ml-2"
                            onClick={() => generateGuidePdf(guide)}
                            disabled={pdfLoading}
                          >
                            {pdfLoading ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                PDF
                              </span>
                            ) : (
                              <>PDF</>
                            )}
                          </button>
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

        {/* View Guide Modal */}
        {viewModalOpen && selectedGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="border-b px-4 py-3 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Guide Details</h3>
                <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                {/* Guide profile image */}
                <div className="flex justify-center mb-4">
                  {selectedGuide.profilePicture ? (
                    <img 
                      src={`http://localhost:8070/${selectedGuide.profilePicture}`}
                      alt={`${selectedGuide.name || 'Guide'}'s profile`}
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Guide';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Guide information */}
                <div className="space-y-3">
                  <p><span className="font-medium">ID:</span> {selectedGuide._id}</p>
                  <p><span className="font-medium">Name:</span> {selectedGuide.name || "Not provided"}</p>
                  <p><span className="font-medium">Email:</span> {selectedGuide.email}</p>
                  <p><span className="font-medium">Experience:</span> {selectedGuide.experienceYears || "Not specified"} years</p>
                  
                  {selectedGuide.specialties && selectedGuide.specialties.length > 0 && (
                    <div>
                      <p className="font-medium">Specialties:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedGuide.specialties.map((specialty, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedGuide.contactNumber && (
                    <p><span className="font-medium">Contact:</span> {selectedGuide.contactNumber}</p>
                  )}
                  
                  {selectedGuide.languages && selectedGuide.languages.length > 0 && (
                    <div>
                      <p className="font-medium">Languages:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedGuide.languages.map((language, index) => (
                          <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedGuide.bio && (
                    <div>
                      <p className="font-medium">Bio:</p>
                      <p className="text-gray-600 text-sm">{selectedGuide.bio}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeViewModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidesList;
