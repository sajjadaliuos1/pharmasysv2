// src/api/printApi.js
const API_BASE_URL = 'http://192.168.100.7:5277/api';

// Get print data from .NET Core API
export const getPrintData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/print/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // If using auth
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching print data:', error);
    throw error;
  }
};

// Get HTML content for printing
export const getHTMLContent = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/print/html/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error fetching HTML content:', error);
    throw error;
  }
};

// Generate PDF for printing
export const generatePDF = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/print/pdf/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Mark job as printed
export const markAsPrinted = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/print/jobs/${jobId}/printed`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking as printed:', error);
    throw error;
  }
};