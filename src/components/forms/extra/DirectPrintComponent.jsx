import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCompanyInfo } from '../../common/CompanyInfoContext';
const DirectPrintComponent = () => {
  const [isQZReady, setQZReady] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [status, setStatus] = useState('Loading QZ Tray...');
  const [isLoading, setIsLoading] = useState(false);
  const [qzVersion, setQzVersion] = useState('');

  // 1. Initialize QZ Tray Connection
 
 

    const fetchPrinters = async () => {
      try {
        setStatus('Loading printers...');
        console.log('Fetching printers from backend...');
        
        const response = await axios.get('http://192.168.100.7:5277/api/Sale/printers');
        console.log('Printer response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setPrinters(response.data);
          if (response.data.length > 0) {
            setSelectedPrinter(String(response.data[0]));
            setStatus('Ready to print');
          } else {
            setStatus('No printers found');
          }
        } else {
          throw new Error('Invalid printer data format');
        }
      } catch (error) {
        console.error('Printer fetch error:', error);
        setStatus(`Printer error: ${error.message}`);
        
        // Fallback: try to get printers directly from QZ Tray
        try {
          console.log('Trying to get printers directly from QZ Tray...');
          const qzPrinters = await window.qz.printers.find();
          console.log('QZ Tray printers:', qzPrinters);
          setPrinters(qzPrinters);
          if (qzPrinters.length > 0) {
            setSelectedPrinter(qzPrinters[0]);
            setStatus('Ready to print (using QZ Tray printers)');
          }
        } catch (qzError) {
          console.error('QZ Tray printer fetch error:', qzError);
          setStatus(`Failed to get printers: ${qzError.message}`);
        }
      }
    };

   const { companyInfo, fetchCompanyInfo } = useCompanyInfo();

  // 3. Handle Print Job with improved error handling
  const handlePrintClick = async () => {
      let company = companyInfo;
    // try {
    //   const response = await axios.get('http://192.168.100.7:5277/api/Sale/test-text');
    //   alert(response.data); // Shows "Print sent successfully."
    // } catch (error) {
    //   console.error('Print error:', error);
    //   alert('Failed to print.');
    // } 
  try {
  const response = await axios.post('http://192.168.100.7:5277/api/Sale/test-text', {
    invoiceNo: 2,
    printerName: 'Black Copper 80',
    companyInfo: company.data
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  alert(response.data);
} catch (error) {
  alert('Printing failed');
  console.error(error);
}

 
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Direct Printing</h2>
      
      {/* Connection Status */}
      <div style={{
        marginBottom: '15px',
        padding: '10px',
        backgroundColor: isQZReady ? '#E8F5E9' : '#FFEBEE',
        color: isQZReady ? '#2E7D32' : '#C62828',
        borderRadius: '4px',
        borderLeft: `4px solid ${isQZReady ? '#4CAF50' : '#F44336'}`
      }}>
        <strong>QZ Tray:</strong> {isQZReady ? '✅ Connected' : '❌ Not Connected'}
        {qzVersion && <div style={{ fontSize: '0.9em', marginTop: '4px' }}>Version: {qzVersion}</div>}
        {!isQZReady && (
          <button 
            onClick={handlePrintClick}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Test Connection
          </button>
        )}
      </div>

      {/* Printer Selection */}
      <div style={{ margin: '15px 0' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Select Printer:
        </label>
        <select
          value={selectedPrinter}
          onChange={(e) => setSelectedPrinter(e.target.value)}
          disabled={!isQZReady || printers.length === 0}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: (!isQZReady || printers.length === 0) ? '#f5f5f5' : 'white'
          }}
        >
          {printers.length === 0 ? (
            <option value="">No printers available</option>
          ) : (
            printers.map((printer) => (
              <option key={printer} value={printer}>{printer}</option>
            ))
          )}
        </select>
      </div>

      {/* Print Button */}
      <button
        onClick={handlePrintClick}
        disabled={!isQZReady || !selectedPrinter || isLoading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: (!isQZReady || !selectedPrinter || isLoading) ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: (!isQZReady || !selectedPrinter || isLoading) ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {isLoading ? '🖨️ Printing...' : '🖨️ Print Now'}
      </button>

      {/* Status Display */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: status.includes('Error') || status.includes('failed') ? '#FFEBEE' : '#E8F5E9',
        color: status.includes('Error') || status.includes('failed') ? '#C62828' : '#2E7D32',
        borderRadius: '4px',
        borderLeft: `4px solid ${status.includes('Error') || status.includes('failed') ? '#F44336' : '#4CAF50'}`
      }}>
        <strong>Status:</strong> {status}
        {!isQZReady && (
          <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
            <div>→ Ensure QZ Tray is running (check system tray)</div>
            <div>→ QZ Tray should be accessible at ws://localhost:8182</div>
            <div>→ Try updating QZ Tray to version 2.1.0 or 2.2.5</div>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '0.85em',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Debug Information:</div>
        <div>• QZ Library: {window.qz ? '✅ Loaded' : '❌ Not Loaded'}</div>
        <div>• QZ Connection: {isQZReady ? '✅ Connected' : '❌ Disconnected'}</div>
        <div>• QZ Version: {qzVersion || 'Unknown'}</div>
        <div>• Printers Found: {printers.length}</div>
        <div>• Selected Printer: {selectedPrinter || 'None'}</div>
        <div>• WebSocket: {window.qz && window.qz.websocket && window.qz.websocket.isActive() ? 'Active' : 'Inactive'}</div>
      </div>
    </div>
  );
};

export default DirectPrintComponent;