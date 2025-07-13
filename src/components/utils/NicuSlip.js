import { getNicuPrint } from "../../api/API";

export const NicuSlip = async (invoiceNo, companyInfo) => {
  try {
    const invoiceData = await getNicuPrint(invoiceNo);

    if (!invoiceData || !invoiceData.data || !invoiceData.data.data) {
      console.error("Invoice data is null or incomplete:", invoiceData);
      alert("Error: Unable to load invoice data. Please try again.");
      return;
    }

    if (!companyInfo || !companyInfo.data) {
      console.error("Company info is null or incomplete:", companyInfo);
      alert("Error: Unable to load company information. Please try again.");
      return;
    }

    const admissionDatetime = invoiceData?.data?.data?.admissionDatetime;
    const date = admissionDatetime
      ? new Date(admissionDatetime).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
      : '';

    const dischargeDatetime = invoiceData?.data?.data?.dischargeDatetime;
    const discharge = dischargeDatetime
      ? new Date(dischargeDatetime).toLocaleDateString("en-GB")
      : '';

    let printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>NICU Slip - ${invoiceNo}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              .no-print { display: none !important; }
              .print-colors {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            
          
            
            body {
               font-family: Arial, sans-serif;
              font-size: 14px;
              line-height: 1.2;
              margin: 0;
              padding: 2mm;
              color: #000000;
              width: 72mm;
              background: white;
            }
            
            .receipt-container {
              width: 100%;
              max-width: 66mm;
              margin: 0 auto;
            }
            
            /* Header Section */
            .header {
              text-align: center;
             
              border-bottom: 2px solid #000;
            }
            
            .clinic-name {
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;              
              color: #000000;
            }
            
            .clinic-subtitle {
              font-size: 14px;
              color: #000000;
              
            }
            
            .contact-info {
              font-size: 14px;
              color: #000000;
              font-style: italic;
            }
            
            /* NICU Badge */
            .nicu-badge {
              background: #000;
              color: #fff;
              text-align: center;
              padding: 1px 1px;
              margin: 1mm 0;
              font-size: 14px;
              font-weight: bold;
              letter-spacing: 2px;
              border-radius: 2px;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            /* Patient Info Section */
            .patient-section {             
              border-bottom: 1px dashed #666;
            }
            
            .section-title {
              font-size: 13px;
              font-weight: bold;
              text-transform: uppercase;              
              color: #000000;
              text-decoration: underline;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;               
              font-size: 13px;
            }
            
            .info-label {             
              color: #000000;
              min-width: 35%;
            }
            
            .info-value {
              color: #000000;
              text-align: right;
              flex: 1;
              word-wrap: break-word;
            }
            
            /* Admission Details */
            .admission-section {              
              border-bottom: 1px dashed #666;
            }
            
            .date-time {
              font-size: 13px;
              color: #000000;
            }
            
            .amount-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 0.5mm;
              font-size: 13px;
            }
            
            .amount-label {
              font-weight: bold;
              color: #000000;
            }
            
            .amount-dots {
              flex: 1;
              border-bottom: 1px dotted #666;
              margin: 0 3mm;
              height: 1px;
            }
            
            .amount-value {
              font-weight: bold;
              color: #000000;
              font-size: 12px;
            }
            
            .total-amount {
              font-size: 12px;
              font-weight: bold;
              background: #f0f0f0;
              padding: 2mm;
              margin-top: 2mm;
              border-radius: 2px;
              text-align: center;
              border: 1px solid #000;
            }
            
            .footer {
              margin-top: 1mm;
              padding-top: 1mm;
              border-top: 1px solid #000;
              text-align: center;
            }
            
            .terms {
              font-size: 12px;
              color: #000;
              margin-bottom: 0.5mm;
              line-height: 1.3;
            }
            
            .signature-area {
              margin-top: 1mm;
              text-align: center;
            }
            
            .signature-line {
              border-top: 1px solid #000000;
              width: 40mm;
              margin: 3mm auto 1mm;
            }
            
            .signature-text {
              font-size: 12px;
              color: #000000;
              font-style: italic;
            }
          
            .currency {
              font-size: 10px;
              margin-right: 1px;
            }
            
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- Header -->
            <div class="header">
              <div class="clinic-name">${companyInfo.data.address || 'Medical Center'}</div>
              <div class="clinic-subtitle">NICU Department</div>
              <div class="contact-info">☎ ${companyInfo.data.contactNo || 'Contact Number'}</div>
            </div>

            <!-- NICU Badge -->
            <div class="nicu-badge">NICU SLIP</div>

            <!-- Patient Information -->
            <div class="patient-section">
              <div class="section-title">Patient Information</div>
              <div class="info-row">
                <span class="info-label">Invoice #:</span>
                <span class="info-value">${invoiceNo}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${invoiceData.data.data.patientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Contact:</span>
                <span class="info-value">${invoiceData.data.data.contact}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${invoiceData.data.data.address}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Refer By:</span>
                <span class="info-value">${invoiceData.data.data.referBy}</span>
              </div>
            </div>

            <!-- Admission Details -->
            <div class="admission-section">
              <div class="section-title">Admission Details</div>
              <div class="info-row">
                <span class="info-label">Admission:</span>
                <span class="info-value date-time">${date}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Bed No:</span>
                <span class="info-value">${invoiceData.data.data.bed}</span>
              </div>
              ${discharge ? `
              <div class="info-row">
                <span class="info-label">Discharge:</span>
                <span class="info-value date-time">${discharge}</span>
              </div>
              ` : ''}
            </div>

            <!-- Financial Details -->
            <div class="financial-section">
              <div class="section-title">Financial Summary</div>
              
              <div class="amount-row">
                <span class="amount-label">Sub Total:</span>
                <span class="amount-dots"></span>
                <span class="amount-value">
                  <span class="currency">Rs:</span>${(invoiceData?.data?.data?.FinalFee ?? 0).toFixed(2)}
                </span>
              </div>

              ${(() => {    
                const discount = invoiceData?.data?.data?.discount ?? 0;
                return discount > 0 ? `
                <div class="amount-row">
                  <span class="amount-label">Discount:</span>
                  <span class="amount-dots"></span>
                  <span class="amount-value">
                    <span class="currency">Rs:</span>${discount.toFixed(2)}
                  </span>
                </div>  
                ` : '';
              })()}

              <div class="amount-row">
                <span class="amount-label">Amount Paid:</span>
                <span class="amount-dots"></span>
                <span class="amount-value">
                  <span class="currency">Rs:</span>${(invoiceData?.data?.data?.paid ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            <! 
            <!-- Footer -->
            <div class="footer">
              <div class="terms">
                ${companyInfo.data.termsConditions || 'Terms and conditions apply'}
              </div>
              
              <div class="signature-area">
                <div class="signature-line"></div>
                <div class="signature-text">
                  ${companyInfo.data.personalHints || 'Authorized Signature'}
                </div>
              </div>
          
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();

  } catch (error) {
    console.error("Error printing invoice:", error);
  }
};