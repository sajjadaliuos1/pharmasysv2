import { getSalePrint } from "../../api/API";

export const SaleInvoice = async (invoiceNo, companyInfo) => {
  try {
   
    const invoiceData = await getSalePrint(invoiceNo);

    console.log(companyInfo);
 
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
  padding: 1mm 0;
  margin: 2mm 0;
  font-weight: bold;
  font-size: 12px;  
  color: #000000;
}

.items-header span {
  white-space: nowrap;            
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 2px;                 
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
            }
            
            .item-details-row {
              font-size: 14px;
              white-space: nowrap;
              overflow: hidden;
              display: flex;
              justify-content: space-between;
              color: #000000;
            }
            
            .item-qty {
              width: 12%;
              text-align: center;
              color: #000000;
            }
            
            .item-rate {
              width: 15%;
              text-align: right;
              color: #000000;
            }
            
            .item-disc {
              width: 12%;
              text-align: center;
              color: #000000;
            }
            
            .item-after-disc {
              width: 15%;
              text-align: right;
              color: #000000;
            }
            
            .item-total {
              width: 18%;
              text-align: right;
              font-weight: bold;
              color: #000000;
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
              margin-top: 4mm;
              border-top: 1px dashed #000000;
               text-align: center;
              font-size: 14px;
              color: #000000;
            }
            
            .signature-line {
              
              border-top: 1px solid #000000;
              text-align: center;
              font-size: 14px;
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
            <div class="center shop-name">${companyInfo.data.shopName}</div>
            <div class="center shop-address">${companyInfo.data.phoneNo} - ${companyInfo.data.contactNo}</div>
            <div class="center shop-address">${companyInfo.data.address}</div>
          </div>
          
        <div class="invoice-info">
  <div class="row-top">
    <span><span class="bold">Invoice #:</span> ${invoiceNo}</span>
    <span class="right"><span class="bold"></span> ${invoiceData.data.data.sale.date}</span>
  </div>
  <div>
    <span class="bold">Customer:</span> ${invoiceData.data.data.sale.customerName}
  </div>
</div>
<div class="sale-invoice-bar">SALE INVOICE</div>
          
          <div class="items-header">
            <div style="display: flex; justify-content: space-between;">
              <span style="width: 15%;">Qty</span>             
              <span style="width: 25%; text-align: right;">Unit Price</span>
              <span style="width: 20%; text-align: center;">Disc%</span>
              <span style="width: 25%; text-align: right;">Net Price</span>
              <span style="width: 18%; text-align: right;">Total</span>
            </div>
          </div>
          
          ${invoiceData.data.data.details.map((item, index) => `
            <div class="item-container">
              <div class="item-name-row">${item.productName}</div>
              <div class="item-details-row">
                <span class="item-qty">${item.netQuantity}</span>
                <span class="item-rate">${item.unitSaleRate}</span>
                <span class="item-disc">${item.discountPercent > 0 ? item.discountPercent + '%' : '-'}</span>
                <span class="item-after-disc">${item.afterDiscountAmount}</span>
                <span class="item-total">${item.netAmount}</span>
              </div>
            </div>
          `).join("")}
          
       <div class="totals">
  <div class="total-row">
    <span class="total-label">Total Amount:</span>
    <span class="dot-fill"></span>
    
    <span class="total-value">
  ${(invoiceData.data.data.sale.totalAmount - invoiceData.data.data.sale.returnItemAmount).toFixed(2)}
</span>

  </div>

  ${invoiceData.data.data.sale.discountAmount > 0 ? `
  <div class="total-row">
    <span class="total-label">Discount:</span>
    <span class="dot-fill"></span>
    <span class="total-value">${invoiceData.data.data.sale.discountAmount.toFixed(2)}</span>
  </div>
  <div class="total-row">
    <span class="total-label">Net Amount:</span>
    <span class="dot-fill"></span>
     <span class="total-value">
    
     ${(invoiceData.data.data.sale.finalAmount - invoiceData.data.data.sale.returnItemAmount).toFixed(2)}
    </span>
  </div>
  ` : ''}

  <div class="total-row">
    <span class="total-label">Paid Amount:</span>
    <span class="dot-fill"></span>
    <span class="total-value">
  
     ${(invoiceData.data.data.sale.paidAmount - invoiceData.data.data.sale.returnItemAmount).toFixed(2)}
    </span>
  </div>

  <div class="total-row">
    <span class="total-label">Remaining:</span>
    <span class="dot-fill"></span>
    <span class="total-value">${invoiceData.data.data.sale.remaining.toFixed(2)}</span>
  </div>
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