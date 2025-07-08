// ThermalReceipt.js
import React, { forwardRef } from 'react';

const ThermalReceipt = forwardRef(({ saleSummary, saleDetails }, ref) => {
  return (
    <div ref={ref} style={{ width: '280px', fontSize: '12px', fontFamily: 'monospace', padding: '10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <strong>My Store Name</strong><br />
        <span>Address Line 1</span><br />
        <span>Phone: 123456789</span><br />
        <hr />
      </div>

      <div>
        <div>Invoice #: {saleSummary.invoiceNo}</div>
        <div>Date: {saleSummary.date}</div>
        <div>Customer: {saleSummary.customerName}</div>
      </div>

      <hr />

      {saleDetails.map((item, idx) => (
        <div key={idx} style={{ marginBottom: '4px' }}>
          <div>{item.productName}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.netQuantity} x {item.saleItemAmount.toFixed(2)}</span>
            <span>{item.netAmount.toFixed(2)}</span>
          </div>
        </div>
      ))}

      <hr />
      <div style={{ textAlign: 'right' }}>
        <div>Total: {saleSummary.totalAmount.toFixed(2)}</div>
        <div>Discount: {saleSummary.discountAmount.toFixed(2)}</div>
        <div>Final: {saleSummary.finalAmount.toFixed(2)}</div>
        <div>Paid: {saleSummary.paidAmount.toFixed(2)}</div>
        <div>Change: {saleSummary.returnItemAmount.toFixed(2)}</div>
        <div>Due: {saleSummary.remaining.toFixed(2)}</div>
      </div>
      <hr />
      <div style={{ textAlign: 'center' }}>Thank you for your purchase!</div>
    </div>
  );
});

export default ThermalReceipt;
