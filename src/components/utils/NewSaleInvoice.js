import { getSalePrint } from "../../api/API";

export const NewSaleInvoice = async (invoiceNo, companyInfo) => {
  try {
   
    const invoiceData = await getSalePrint(invoiceNo);

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
 

const createdDateTime = new Date(invoiceData.data.data.sale.createdDateTime);
    const day = String(createdDateTime.getDate()).padStart(2, '0');
    const month = String(createdDateTime.getMonth() + 1).padStart(2, '0');
    const year = createdDateTime.getFullYear();

    let hours = createdDateTime.getHours();
    const minutes = String(createdDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(createdDateTime.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // convert 0 to 12 for AM
    hours = String(hours).padStart(2, '0');

    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;


    let printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>INVOICE ${invoiceNo}</title>
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
              
               font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;              
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
  letter-spacing: 1.5px;
}

           .items-header {
  border-top: 1px dashed #000000;
  border-bottom: 1px dashed #000000;
  padding: 1mm 0;
  margin: 2mm 0;
  font-weight: bold;
  font-size: 12px;  
  color: #000000;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-header span {
  white-space: nowrap;            
  overflow: hidden;
 text-overflow: ellipsis;              
  display: inline-block;          
  color: #000000;
}

            .item-container {
              font-size: 13px;               
              color: #000000;
              display: flex;
              justify-content: space-between;
              align-items: center;               
            }
            
            .item-serial {
              width: 5%;
              text-align: left;
              color: #000000;
              font-weight: bold;
            }
            
            .item-name {
              width: 50%;
              text-align: left;
              color: #000000;
              font-weight: bold;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              padding-left: 2px;
            }
            
            .item-unit-price {
              width: 17%;
              text-align: center; 
              color: #000000;
            }
            
            .item-qty {
              width: 8%;
              text-align: center;
              color: #000000;
            }
            
            .item-total {
              width: 20%;
              text-align: right;
              font-weight: bold;
              color: #000000;
            }
            
            /* Separator line between items and totals */
            .separator-line {
              border-top: 1px dashed #000000;
              margin: 1mm 0;
            }
            
    .totals {
    
    font-size: 14px;
    font-family: Arial, sans-serif;
  }

  .total-row1 {
    display: flex;
    margin-bottom: 2px;
    
  }
      .total-row {
    display: flex;    
  }

  .total-empty-left {
    width: 20%;
    background-color: #ffffff;
    
  }

  .total-label {
    width: 50%;
    background-color: #f0f0f0;
    border: 1px solid #000000;
    font-weight: bold;
    text-align: right;
    
  }

  .total-empty-middle {
    width: 2%;
    background-color: #ffffff;
  }

  .total-value {
    width: 28%;
    text-align: right;
    font-weight: bold;
    background-color: white;
    border: 1px solid #000000;
  }
             
            
            .footer {
              margin-top: 2mm;
              border-top: 1px dashed #000000;
               text-align: center;
              font-size: 13px;
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
            
            .spacer {
              height: 2mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="center shop-name">${companyInfo.data.shopName || 'Shop Name'}</div>
            <div class="center shop-address">${companyInfo.data.phoneNo || ''} - ${companyInfo.data.contactNo || ''}</div>
            <div class="center shop-address">${companyInfo.data.shopDetail || ''}</div>
          </div>          
        <div class="invoice-info">
  <div class="row-top">
    <span><span class="bold">INV#:</span> ${invoiceNo}</span>
      <span class="right"><span class="bold"></span> ${formattedDate}</span>
  </div>   
</div>
           <div class="items-header">
            <span style="width: 5%;">#</span>
            <span style="width: 50%; text-align: left;">Description</span>
            <span style="width: 17%; text-align: center;">Price</span>
            <span style="width: 8%; text-align: center; font-size:12px">Qty</span>
            <span style="width: 20%; text-align: right;">Total</span>
          </div>
          
          ${invoiceData.data.data.details.map((item, index) => {
            const itemTotal = item.unitSaleRate * item.netQuantity;
            
            return `
            <div class="item-container">
              <span class="item-serial">${index + 1}</span>
              <span class="item-name" title="${item.productName}">${item.productName}</span>
              <span class="item-unit-price">${item.unitSaleRate}</span>
              <span class="item-qty">${item.netQuantity}</span>
              <span class="item-total">${itemTotal.toFixed(2)}</span>
            </div>
          `}).join("")}
          
          <!-- Separator line between items and totals -->
          <div class="separator-line"></div>
          
       <div class="totals">
  <div class="total-row1">
    <span class="total-empty-left"></span>
    <span class="total-label">Total Quantity:</span>
    <span class="total-empty-middle"></span>
    <span class="total-value">
      ${invoiceData.data.data.details.reduce((sum, item) => sum + (item.netQuantity || 0), 0).toFixed(2)}
    </span>
  </div>

  <div class="total-row">
    <span class="total-empty-left"></span>
    <span class="total-label">Sub Total:</span>
    <span class="total-empty-middle"></span>
    <span class="total-value">
      ${invoiceData.data.data.details.reduce((sum, item) => sum + (item.unitSaleRate * item.netQuantity), 0).toFixed(2)}
    </span>
  </div>

  ${(() => {
    const totalAmount = invoiceData.data.data.details.reduce((sum, item) => sum + (item.unitSaleRate * item.netQuantity), 0);
    const netAmount = (invoiceData.data.data.sale.finalAmount || 0) - (invoiceData.data.data.sale.returnItemAmount || 0);
    const calculatedDiscount = totalAmount - netAmount;
    
    return calculatedDiscount > 0 ? `
    <div class="total-row">
      <span class="total-empty-left"></span>
      <span class="total-label">Discount:</span>
      <span class="total-empty-middle"></span>
      <span class="total-value">${calculatedDiscount.toFixed(2)}</span>
    </div>
    <div class="total-row">
    <span class="total-empty-left"></span>
    <span class="total-label">Grand Total:</span>
    <span class="total-empty-middle"></span>
    <span class="total-value">
      ${((invoiceData.data.data.sale.finalAmount || 0) - (invoiceData.data.data.sale.returnItemAmount || 0)).toFixed(2)}
    </span>
  </div>

    ` : '';
  })()}

  
  <div class="total-row">
    <span class="total-empty-left"></span>
    <span class="total-label">Paid Amount:</span>
    <span class="total-empty-middle"></span>
    <span class="total-value">
      ${((invoiceData.data.data.sale.paidAmount || 0) - (invoiceData.data.data.sale.returnItemAmount || 0)).toFixed(2)}
    </span>
  </div>

${(invoiceData.data.data.sale.remaining || 0) !== 0 ? `
  <div class="total-row">
    <span class="total-empty-left"></span>
    <span class="total-label">Remaining:</span>
    <span class="total-empty-middle"></span>
    <span class="total-value">${invoiceData.data.data.sale.remaining.toFixed(2)}</span>
  </div>
` : ''}

          
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