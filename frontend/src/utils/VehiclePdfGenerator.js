import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a PDF for a vehicle with details
 * @param {Object} vehicle - The vehicle data
 * @param {Object} ownerData - Owner data if available
 */
export const generateVehiclePdf = (vehicle, ownerData = {}) => {
  try {
    // Initialize the PDF document
    const doc = new jsPDF();
    
    // Add title and metadata
    doc.setFontSize(20);
    doc.text(`Vehicle Details: ${vehicle.type}`, 14, 22);
    
    // Add report generation info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Vehicle ID: ${vehicle._id}`, 14, 35);
    doc.setTextColor(0);
    
    // Add a horizontal line
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);
    
    // Add vehicle image if available
    let yPos = 45;
    if (vehicle.images && vehicle.images.length > 0) {
      try {
        // Attempt to add the first image
        // Note: This requires the image to be accessible via URL
        const imgUrl = `http://localhost:8070/${vehicle.images[0]}`;
        doc.addImage(imgUrl, 'JPEG', 140, 45, 55, 40);
      } catch (imgErr) {
        console.warn('Could not add image to PDF:', imgErr);
      }
    }
    
    // Add vehicle info
    doc.setFontSize(14);
    doc.text('Vehicle Information', 14, yPos);
    doc.setFontSize(10);
    
    yPos += 10;
    
    const vehicleInfo = [
      { label: 'Type:', value: vehicle.type || 'N/A' },
      { label: 'License Plate:', value: vehicle.licensePlate || 'N/A' },
      { label: 'Capacity:', value: `${vehicle.capacity || 'N/A'} passengers` },
      { label: 'Features:', value: vehicle.features && vehicle.features.length ? vehicle.features.join(', ') : 'None' }
    ];

    vehicleInfo.forEach(item => {
      doc.text(`${item.label} ${item.value}`, 14, yPos);
      yPos += 8;
    });
    
    // Add owner info
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Owner Information', 14, yPos);
    doc.setFontSize(10);
    
    yPos += 10;
    
    const ownerEmail = ownerData.email || 'Unknown Email';
    
    const ownerInfo = [
      { label: 'Name:', value: vehicle.ownerName || 'N/A' },
      { label: 'Email:', value: ownerEmail },
      { label: 'Contact:', value: vehicle.contactNumber || 'N/A' },
      { label: 'Owner ID:', value: vehicle.ownerId || 'N/A' }
    ];

    ownerInfo.forEach(item => {
      doc.text(`${item.label} ${item.value}`, 14, yPos);
      yPos += 8;
    });
    
    // Add document status
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Document Status', 14, yPos);
    doc.setFontSize(10);
    
    yPos += 10;
    
    const docStatus = [
      { 
        label: 'License Document:', 
        value: vehicle.licenseDoc ? 'Submitted' : 'Not Submitted',
        path: vehicle.licenseDoc ? `http://localhost:8070/${vehicle.licenseDoc}` : null 
      },
      { 
        label: 'Insurance Document:', 
        value: vehicle.insuranceDoc ? 'Submitted' : 'Not Submitted',
        path: vehicle.insuranceDoc ? `http://localhost:8070/${vehicle.insuranceDoc}` : null 
      }
    ];

    docStatus.forEach(item => {
      doc.text(`${item.label} ${item.value}`, 14, yPos);
      yPos += 6;
      if (item.path) {
        doc.setTextColor(0, 0, 255);
        doc.text(`Document Link: ${item.path}`, 20, yPos);
        doc.setTextColor(0);
      }
      yPos += 8;
    });
    
    // Additional vehicle images as a table if available
    if (vehicle.images && vehicle.images.length > 1) {
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Vehicle Images URLs', 14, yPos);
      doc.setFontSize(10);
      
      const tableData = vehicle.images.map((img, index) => {
        return [`Image ${index + 1}`, `http://localhost:8070/${img}`];
      });
      
      doc.autoTable({
        startY: yPos + 5,
        head: [['Image', 'URL']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 }
      });
    }
    
    // Add footer with page number
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF with vehicle details
    const filename = `vehicle-${vehicle.licensePlate.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating vehicle PDF:', error);
    return false;
  }
};