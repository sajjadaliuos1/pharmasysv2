
import React, { useState } from 'react';
import { Modal, Button, Typography, Alert, Spin } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Toaster } from '../../common/Toaster';

const { Text, Title } = Typography;

const InvoiceCloseConfirmationModal = ({ 
  visible, 
  onCancel, 
  invoiceData, 
  onConfirm 
}) => {
  const [loading, setLoading] = useState(false);

  const canCloseInvoice = invoiceData && parseFloat(invoiceData.amount) === 0;

  const handleConfirm = async () => {
    if (!canCloseInvoice) {
      Toaster.error("Cannot close invoice with non-zero amount");
      return;
    }

    try {
      setLoading(true);
      await onConfirm(invoiceData);
    } catch (error) {
      console.error("Error closing invoice:", error);
      Toaster.error("Failed to close invoice");
    } finally {
      setLoading(false);
    }
  };

  const getModalContent = () => {
    if (!invoiceData) {
      return (
        <Alert
          message="No Invoice Selected"
          description="Please select an invoice to close."
          type="warning"
          showIcon
        />
      );
    }

    if (canCloseInvoice) {
      return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          </div>
          <Alert
            message="Invoice can be closed"
            description={`Invoice ${invoiceData.invoiceNo} has zero remaining amount and can be safely closed.`}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <div style={{ padding: '16px 0' }}>
            <Text strong>Invoice Details:</Text>
            <div style={{ marginTop: 8 }}>
              <Text>Invoice No: <Text strong>{invoiceData.invoiceNo}</Text></Text><br />
              <Text>Total Amount: <Text strong>Rs. {invoiceData.totalAmount}</Text></Text><br />
              <Text>Remaining Amount: <Text strong style={{ color: '#52c41a' }}>Rs. {invoiceData.amount}</Text></Text>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
          </div>
          <Alert
            message="Cannot close invoice"
            description={`Invoice ${invoiceData.invoiceNo} has a remaining amount of Rs. ${invoiceData.amount}. Only invoices with zero remaining amount can be closed.`}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <div style={{ padding: '16px 0' }}>
            <Text strong>Invoice Details:</Text>
            <div style={{ marginTop: 8 }}>
              <Text>Invoice No: <Text strong>{invoiceData.invoiceNo}</Text></Text><br />
              <Text>Total Amount: <Text strong>Rs. {invoiceData.totalAmount}</Text></Text><br />
              <Text>Remaining Amount: <Text strong style={{ color: '#ff4d4f' }}>Rs. {invoiceData.amount}</Text></Text>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Modal
      open={visible}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined />
          <span>Close Invoice Confirmation</span>
        </div>
      }
      onCancel={onCancel}
      width={500}
      zIndex={3001}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger={!canCloseInvoice}
          onClick={canCloseInvoice ? handleConfirm : onCancel}
          loading={loading}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spin size="small" style={{ marginRight: 8 }} />
              Processing...
            </>
          ) : canCloseInvoice ? (
            'Yes, Close Invoice'
          ) : (
            'Understood'
          )}
        </Button>
      ]}
    >
      {getModalContent()}
    </Modal>
  );
};

export default InvoiceCloseConfirmationModal;