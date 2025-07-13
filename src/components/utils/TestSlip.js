import { getTestPrint } from "../../api/API";

export const TestSlip = async (invoiceNo, companyInfo) => {
  try {
   
    const invoiceData = await getTestPrint(invoiceNo);

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
 const date = new Date(invoiceData.data.data.date).toLocaleDateString("en-GB"); // e.g. 09/07/2025

    let printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Test No ${invoiceNo}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 2mm;
              }
                .sale-invoice-bar {
      background-color: black !important;
      color: white !important;
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
            
            .center {
              text-align: center;
            }
            
            .left {
              text-align: left;
            }
            
            .right {
              text-align: right;
            }
            
            .bold {
              font-weight: bold;
            }
            
            .header {
              margin-bottom: 3mm;
              border-bottom: 1px dashed #000000;
              padding-bottom: 2mm;
            }
            
            .shop-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 1mm;
              color: #000000;
            }
            
            .shop-address {
              font-size: 14px;
              color: #000000;
              
            }
            
           .invoice-info {
  margin: 2mm 0;
  font-size: 14px;
  color: #000000;
}

.invoice-info .row-top {
  display: flex;
  justify-content: space-between;
  // margin-bottom: 1mm;
}
 
.invoice-info .bold {
  font-weight: bold;
  color: #000000;
}

            .sale-invoice-bar {
  background-color: black;
  color: white;
  text-align: center;
  padding: 4px 0;
  font-size: 16px;
  font-weight: bold;
  // margin: 4mm 0;
  letter-spacing: 1.5px;
}

           .items-header {
  border-top: 1px dashed #000000;
  border-bottom: 1px dashed #000000;  
  font-weight: bold;
  font-size: 12px;  
  color: #000000;
}

.items-header span {
  white-space: nowrap;            
  overflow: hidden;
  text-overflow: ellipsis;             
  display: inline-block;          
  color: #000000;
}

            .item-container {
              // margin: 2mm 0;
              font-size: 13px;
              border-bottom: 1px dotted #000000;
              // padding-bottom: 1mm;
              color: #000000;
            }
            
            .item-name-row {
              font-weight: bold;
              // margin-bottom: 1mm;
              word-wrap: break-word;
              overflow-wrap: break-word;
              color: #000000;
              display: flex;
              justify-content: space-between;
            }
            
            .item-details-row {
              font-size: 14px;
              white-space: nowrap;
              overflow: hidden;
              display: flex;
              justify-content: space-between;
              color: #000000;
            }
            
            .item-serial {
              width: 10%;
              text-align: left;
              color: #000000;
            }
            
            .item-unit-price {
              width: 25%;
              text-align: right;
              color: #000000;
            }
            
            .item-qty {
              width: 15%;
              text-align: center;
              color: #000000;
            }
            
            .item-total {
              width: 25%;
              text-align: right;
              font-weight: bold;
              color: #000000;
            }
            
            .item-discount {
              font-size: 12px;
              color: #666;
              text-align: left;
              margin-top: 1mm;
            }
            
    .totals {
    margin-top: 10px;
    font-size: 14px;
    font-family: monospace; /* Equal spacing for all characters */
  }

  .total-row {
    display: flex;
    white-space: nowrap;
  }

  .total-label {
    padding-right: 5px;
  }

  .dot-fill {
    flex-grow: 1;
    text-align: left;
    overflow: hidden;
  }

  .dot-fill::before {
    content: "........................................................................................................";
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
  }

  .total-value {
    padding-left: 5px;
    font-weight: bold;
  }
             
            
             .footer {
              margin-top: 2mm;
              border-top: 1px dashed #000000;
               text-align: center;
              font-size: 14px;
              color: #000000;
            }
            
            .signature-line {
              border-top: 1px solid #000000;
              text-align: center;
              font-size: 12px;
              padding-top: 1mm;
              color: #000000;
            }
            
            
            * {
              box-sizing: border-box;
              color: #000000;
            }
            
            /* Ensure proper spacing for thermal printer */
            .spacer {
              height: 2mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="center shop-name">${companyInfo.data.address || 'Shop Name'}</div>
            <div class="center shop-address"> Laboratory  -   ${companyInfo.data.contactNo || ''}</div>            
          </div>
          
        <div class="invoice-info">
  <div class="row-top">
    <span><span class="bold">Invoice #:</span> ${invoiceNo}</span>
    <span class="right"><span class="bold"></span> ${date}</span>
  </div>

  <div class="row-top">
    <span><span class="bold">Name:</span>  ${invoiceData.data.data.customerName}</span>
    <span class="right"> ${invoiceData.data.data.maxCompletionTime}</span>
  </div>
   
 <div class="row-top">
    <span> ${invoiceData.data.data.contactNo}</span>
    <span class="right"> ${invoiceData.data.data.address }</span>
  </div>
   <div class="row-top">
    <span> Refer By: ${invoiceData.data.data.doctorName}</span>   
  </div>
</div>
<div class="sale-invoice-bar">TEST SLIP</div>
          
          <div class="items-header">
            <div >
              <span style="width: 10%;">#</span>             
              <span style="width: 65%;">Test</span>
              <span >Amount</span>               
            </div>
          </div>
          
          ${invoiceData.data.data.testDetail.map((item, index) => { 
            
            return `
            <div class="item-container">
              <div class="item-name-row">
                <span class="item-serial">${index + 1}.</span>
                <span style="flex-grow: 1; text-align: left; padding-left: 2px;">${item.testName }</span>                               
                <span class="item-unit-price">${item.amount}</span>                
              </div>
            </div>
          `}).join("")}
          
       <div class="totals">
   
  <div class="total-row">
    <span class="total-label">Sub Total:</span>
    <span class="dot-fill"></span>
    <span class="total-value">
    ${invoiceData.data.data.totalAmount.toFixed(2)}
    </span>
  </div>

  ${(() => {    
    const discount = invoiceData.data.data.discount || 0;
   return discount > 0 ? `
  <div class="total-row">
    <span class="total-label">Discount:</span>
    <span class="dot-fill"></span>
    <span class="total-value">${discount.toFixed(2)}</span>
  </div>  
` : '';
   
  })()}

  

  <div class="total-row">
    <span class="total-label">Paid Amount:</span>
    <span class="dot-fill"></span>
    <span class="total-value">
      ${(invoiceData.data.data.paidAmount || 0).toFixed(2)}
    </span>
  </div>


 
 
          
          <div class="footer">
              ${companyInfo.data.termsConditions}           
          </div>
          
          <div class="signature-line">
            ${companyInfo.data.personalHints}
          </div>
          
          <div class="spacer"></div>
          
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