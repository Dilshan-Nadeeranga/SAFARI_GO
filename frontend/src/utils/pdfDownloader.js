import axios from 'axios';

// Check if jsPDF is available - with improved initialization
let jsPDF;
try {
  jsPDF = require('jspdf').default;
  // Import the autotable plugin
  const autoTableModule = require('jspdf-autotable');
  
  // Fix issue: manually set the autoTable function if it's not automatically attached
  if (typeof jsPDF.prototype.autoTable !== 'function') {
    jsPDF.prototype.autoTable = autoTableModule;
  }
} catch (error) {
  console.warn('jsPDF or jspdf-autotable not found. Using fallback PDF generation.', error);
  jsPDF = null;
}

/**
 * Download a PDF report either by making an API call or generating on the client
 * @param {string} endpoint - API endpoint to call for server-side generation
 * @param {string} token - Authentication token
 * @param {object} clientData - Data for client-side generation if available
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 * @param {array} customColumns - Optional custom columns for the PDF table
 */
export const downloadPdfReport = async (endpoint, token, clientData = null, onSuccess = null, onError = null, customColumns = null) => {
  // If clientData is provided, generate PDF on the client side
  if (clientData) {
    try {
      if (jsPDF) {
        // Use jsPDF if available
        generateClientSidePdf(clientData, customColumns);
      } else {
        // Use fallback if jsPDF is not available
        generateFallbackReport(clientData, customColumns);
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error generating PDF on client:', error);
      if (onError) onError(error);
    }
    return;
  }

  // Otherwise try to get PDF from server
  try {
    const response = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob' // Important for handling the binary PDF response
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error downloading PDF from server:', error);
    
    // If server download fails, try client-side generation as fallback
    if (clientData) {
      try {
        if (jsPDF) {
          generateClientSidePdf(clientData, customColumns);
        } else {
          generateFallbackReport(clientData, customColumns);
        }
        if (onSuccess) onSuccess();
      } catch (clientError) {
        console.error('Fallback generation failed:', clientError);
        if (onError) onError(clientError);
      }
    } else {
      if (onError) onError(error);
    }
  }
};

/**
 * Generate a PDF on the client side using jsPDF
 * @param {object} data - The data for the report
 * @param {array} customColumns - Optional custom columns for the PDF table
 */
const generateClientSidePdf = (data, customColumns = null) => {
  if (!jsPDF) {
    throw new Error('jsPDF is not available');
  }
  
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(data.title, 14, 22);
  
  // Add generated date
  doc.setFontSize(10);
  doc.text(`Generated on: ${data.generatedDate}`, 14, 32);
  
  // Add filter info
  doc.text(`Status Filter: ${data.filters.status === 'all' ? 'All Bookings' : data.filters.status}`, 14, 38);
  doc.text(`Date Range: ${data.filters.dateRange.start} to ${data.filters.dateRange.end}`, 14, 44);
  
  // Add stats
  doc.setFontSize(12);
  doc.text(`Total Bookings: ${data.stats.total}`, 14, 54);
  doc.text(`Completed: ${data.stats.completed || 'N/A'}`, 14, 60);
  doc.text(`Cancelled: ${data.stats.cancelled || 'N/A'}`, 14, 66);
  doc.text(`Total Revenue: Rs. ${data.stats.totalRevenue.toLocaleString()}`, 14, 72);
  
  // Use custom columns if provided, otherwise use default columns
  const tableColumns = customColumns || [
    { header: 'ID', dataKey: '_id' },
    { header: 'User', dataKey: 'userName' },
    { header: 'Description', dataKey: 'safariName' },
    { header: 'Date', dataKey: 'formattedDate' },
    { header: 'Quantity', dataKey: 'numberOfPeople' },
    { header: 'Amount', dataKey: 'formattedAmount' },
    { header: 'Status', dataKey: 'status' }
  ];
  
  // Format table data
  const tableHeader = tableColumns.map(col => col.header);
  const tableRows = data.bookings.map(item => 
    tableColumns.map(col => {
      const value = item[col.dataKey];
      if (typeof value === 'string' && col.dataKey === '_id') {
        return value.substring(0, 8); // Truncate IDs
      }
      return value || 'N/A';
    })
  );
  
  // Check if autoTable method exists before using it
  if (typeof doc.autoTable === 'function') {
    // Add the table using autoTable
    doc.autoTable({
      startY: 80,
      head: [tableHeader],
      body: tableRows,
      headStyles: {
        fillColor: [66, 135, 245],
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 80 }
    });
  } else {
    // If autoTable not available, add a simple text note
    doc.setFontSize(12);
    doc.text('Table could not be generated - autoTable plugin not available', 14, 80);
    
    // Still try to show some data
    let y = 90;
    tableRows.forEach((row, rowIndex) => {
      if (rowIndex < 10) { // Limit to 10 rows to avoid overflowing the page
        doc.setFontSize(9);
        doc.text(`Item ${rowIndex+1}: ${row.join(' | ')}`, 14, y);
        y += 8;
      }
    });
  }
  
  // Save the PDF with a meaningful filename
  const reportType = data.title.replace(/\s+/g, '-').toLowerCase();
  doc.save(`${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Generate a fallback HTML report when jsPDF is not available
 * @param {object} data - The data for the report
 * @param {array} customColumns - Optional custom columns for the HTML table
 */
const generateFallbackReport = (data, customColumns = null) => {
  // Create a new HTML document for the report
  const reportContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        .info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #4287f5; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .stats { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
        .stat-card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; flex: 1; }
      </style>
    </head>
    <body>
      <h1>${data.title}</h1>
      <div class="info">
        <p><strong>Generated on:</strong> ${data.generatedDate}</p>
        <p><strong>Status Filter:</strong> ${data.filters.status === 'all' ? 'All Bookings' : data.filters.status}</p>
        <p><strong>Date Range:</strong> ${data.filters.dateRange.start} to ${data.filters.dateRange.end}</p>
      </div>
      
      <div class="stats">
        <div class="stat-card">
          <h3>Total Bookings</h3>
          <p>${data.stats.total}</p>
        </div>
        <div class="stat-card">
          <h3>Completed</h3>
          <p>${data.stats.completed}</p>
        </div>
        <div class="stat-card">
          <h3>Cancelled</h3>
          <p>${data.stats.cancelled}</p>
        </div>
        <div class="stat-card">
          <h3>Total Revenue</h3>
          <p>Rs. ${data.stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      <h2>Bookings</h2>
      <table>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>User</th>
            <th>Safari</th>
            <th>Date</th>
            <th>People</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.bookings.map(booking => `
            <tr>
              <td>${booking._id.substring(0, 8)}</td>
              <td>${booking.userName}</td>
              <td>${booking.safariName}</td>
              <td>${booking.formattedDate}</td>
              <td>${booking.numberOfPeople}</td>
              <td>${booking.formattedAmount}</td>
              <td>${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 30px; font-size: 12px; color: #666;">
        <p>Note: This is a simplified HTML version of the report since jsPDF is not installed.</p>
        <p>To get proper PDF reports, please install jsPDF and jspdf-autotable using:</p>
        <code>npm install jspdf jspdf-autotable</code>
      </div>
    </body>
    </html>
  `;
  
  // Create a blob and download
  const blob = new Blob([reportContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `booking-report-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show installation message
  alert('HTML report generated. For proper PDF reports, please install the required packages using: npm install jspdf jspdf-autotable');
};
