// src/services/PrintService.js
import qz from 'qz-tray';

class PrintService {
  constructor() {
    this.isConnected = false;
  }

  // Initialize QZ Tray connection
  async connect() {
    try {
      if (!this.isConnected) {
        await qz.websocket.connect();
        this.isConnected = true;
        console.log('QZ Tray connected successfully');
      }
      return true;
    } catch (error) {
      console.error('Failed to connect to QZ Tray:', error);
      throw new Error('QZ Tray connection failed. Make sure QZ Tray is running.');
    }
  }

  // Disconnect from QZ Tray
  async disconnect() {
    try {
      if (this.isConnected) {
        await qz.websocket.disconnect();
        this.isConnected = false;
        console.log('QZ Tray disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting from QZ Tray:', error);
    }
  }

  // Get available printers
  async getPrinters() {
    try {
      await this.connect();
      const printers = await qz.printers.find();
      console.log('Available printers:', printers);
      return printers;
    } catch (error) {
      console.error('Error getting printers:', error);
      throw error;
    }
  }

  // Print raw data (for thermal/receipt printers)
  async printRaw(printerName, data) {
    try {
      await this.connect();
      
      const config = qz.configs.create(printerName);
      const printData = [data];
      
      await qz.print(config, printData);
      console.log('Print job sent successfully');
      return true;
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }

  // Print HTML content
  async printHTML(printerName, htmlContent) {
    try {
      await this.connect();
      
      const config = qz.configs.create(printerName);
      const printData = [{
        type: 'html',
        format: 'plain',
        data: htmlContent
      }];
      
      await qz.print(config, printData);
      console.log('HTML print job sent successfully');
      return true;
    } catch (error) {
      console.error('HTML print error:', error);
      throw error;
    }
  }

  // Print PDF (base64 encoded)
  async printPDF(printerName, base64PDF) {
    try {
      await this.connect();
      
      const config = qz.configs.create(printerName);
      const printData = [{
        type: 'pdf',
        format: 'base64',
        data: base64PDF
      }];
      
      await qz.print(config, printData);
      console.log('PDF print job sent successfully');
      return true;
    } catch (error) {
      console.error('PDF print error:', error);
      throw error;
    }
  }
}

export default new PrintService();