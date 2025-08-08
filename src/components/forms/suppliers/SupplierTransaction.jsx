import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, message, Row, Col, Card, Statistic, Alert } from 'antd';
import { SupplierPayment, getPayment } from '../../../api/API';
import { DollarCircleOutlined } from '@ant-design/icons';
import preventWheelChange from '../../common/PreventWheel';
import ReusableDropdown from '../../common/ReusableDropdown';
import { Toaster } from '../../common/Toaster';

const SupplierTransaction = ({ visible, title, onCancel, initialValues, onSave, button }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const [amountIn, setAmountIn] = useState(0);
  const [amountOut, setAmountOut] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isNegativeBalance, setIsNegativeBalance] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState([]);
  const [paymentMethodMap, setPaymentMethodMap] = useState(new Map());
  
  const [paymentMethodRemainingAmount, setPaymentMethodRemainingAmount] = useState('');
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);

  useEffect(() => {
    if (visible) fetchPaymentMethods();
  }, [visible]);

  const fetchPaymentMethods = async () => {
  try {
    setLoadingPaymentMethod(true);
    const response = await getPayment();
    const data = response?.data?.data || [];
    setPaymentMethod(data);
    
    // Auto-select first payment method if data exists and form field is empty
    if (data.length > 0 && !form.getFieldValue("PaymentMethodId")) {
      const firstPaymentMethod = data[0];
      const firstId = firstPaymentMethod.paymentMethodId;
      
      // Set the form field value
      form.setFieldsValue({ PaymentMethodId: firstId });
      
      // Update remaining amount if you have the payment method map
      // const selected = paymentMethodMap.get(firstId);
      setPaymentMethodRemainingAmount(firstPaymentMethod?.remaining || '');
    }
    
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    // Handle error appropriately
  } finally {
    setLoadingPaymentMethod(false);
  }
};

  useEffect(() => {
    if (visible && initialValues) {
      setPaymentDetails(initialValues);
      form.setFieldsValue({
        PaymentMethodId: initialValues.paymentMethodId || null,
        paid: '',
        Discount: '',
        Remaining: initialValues.remaining || 0,
        Date: new Date().toISOString().substr(0, 10),
        Description: ''
      });
      setAmountIn(0);
      setAmountOut(0);
      setRemaining(initialValues.remaining || 0);
      setIsNegativeBalance(false);
    }
  }, [visible, initialValues, form]);

  const handleAmountInChange = (value) => {
    const newAmountIn = parseFloat(value) || 0;
    setAmountIn(newAmountIn);
    calculateRemaining(newAmountIn, amountOut);
  };

  const handleAmountOutChange = (value) => {
    const newAmountOut = parseFloat(value) || 0;
    setAmountOut(newAmountOut);
    calculateRemaining(amountIn, newAmountOut);
  };

  const calculateRemaining = (inAmount, outAmount) => {
    const existingRemaining = parseFloat(paymentDetails?.remaining || 0);
    const newRemaining = existingRemaining - inAmount - outAmount;
    setIsNegativeBalance(newRemaining < 0);
    setRemaining(newRemaining);
    form.setFieldsValue({ Remaining: newRemaining.toFixed(2) });
  };

  const handleSubmit = async () => {
    try {
      setBtnLoading(true);
      const values = await form.validateFields();
            
      const paidAmount = parseFloat(values.paid) || 0;
      const discountAmount = parseFloat(values.Discount) || 0;
      
      if (paidAmount === 0 && discountAmount === 0) {
        message.error('Please enter either Paid amount or Discount amount');
        setBtnLoading(false);
        return;
      }

 if (paymentMethodRemainingAmount < paidAmount) {
        Toaster.error('Paid amount exceeds the available balance in the selected payment method');
        
        setBtnLoading(false);
        return;
      }

      const finalRemaining = parseFloat(values.Remaining);
      if (finalRemaining < 0) {
      Toaster.error('Paid amount exceeds the supplier available balance');
        
        setBtnLoading(false);
        return;
      } else {
        submitTransaction(values);
      }
    } catch (err) {
      console.error("Error validating transaction:", err);
      message.error("Please fill all required fields");
      setBtnLoading(false);
    }
  };

  const submitTransaction = async (values) => {
    console.log("Submitting transaction with values:", values);
    
    const payload = {
      SupplierId: paymentDetails?.supplierId || 0,
      paid: parseFloat(values.paid) || 0,
      Discount: parseFloat(values.Discount) || 0,
      Remaining: parseFloat(values.Remaining) || 0,
      Date: values.Date,
      Description: values.Description || '',
      PaymentMethodId: Number(values.PaymentMethodId),
      createdBy: 1 // Or dynamic if needed
    };

    console.log("Final payload:", payload);

    try {
      const response = await SupplierPayment(payload);
      console.log("API Response:", response);
      
      if (response.data?.status === "Success" || response.status === 200) {
        message.success("Transaction saved successfully!");
        form.resetFields();
        setAmountIn(0);
        setAmountOut(0);
        setRemaining(0);
        setIsNegativeBalance(false);
        if (typeof onSave === 'function') onSave(payload);
        onCancel(); // Close modal after successful save
      } else {
        message.error(response.data?.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error submitting transaction:", err);
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method
      });
      
      if (err.response?.status === 405) {
        message.error("Method not allowed. Please check the API endpoint and method.");
      } else if (err.response?.status === 404) {
        message.error("API endpoint not found. Please check the URL.");
      } else {
        message.error(err.response?.data?.message || err.message || "Something went wrong");
      }
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={title}
      onCancel={onCancel}
      width={600}
      zIndex={3000}
      footer={[
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={btnLoading}
        >
          {button}
        </Button>
      ]}
    >
      {paymentDetails && (
        <Card style={{ marginBottom: 16 }} bordered={false} size="small">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Supplier Name"
                value={paymentDetails.name || "N/A"}
                valueStyle={{ fontSize: '20px' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Current Balance"
                value={paymentDetails.remaining}
                prefix={<DollarCircleOutlined />}
                valueStyle={{
                  color: parseFloat(paymentDetails.remaining) >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: '22px'
                }}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Form form={form} layout="vertical">
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="paid"
              label="Amount Paid"
              rules={[{
                validator: (_, value) => {
                  const discount = form.getFieldValue('Discount');
                  const paidAmount = parseFloat(value) || 0;
                  const discountAmount = parseFloat(discount) || 0;
                  
                  if (paidAmount === 0 && discountAmount === 0) {
                    return Promise.reject('Please enter either Amount Paid or Discount Given');
                  }
                  if (paidAmount < 0) {
                    return Promise.reject('Amount paid cannot be negative');
                  }
                  return Promise.resolve();
                }
              }]}
            >
              <Input
                type='number'
                placeholder="Enter Paid Amount"
                onWheel={preventWheelChange}
                onChange={(e) => handleAmountInChange(e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="Discount"
              label="Discount"
              rules={[{
                validator: (_, value) => {
                  const paid = form.getFieldValue('paid');
                  const paidAmount = parseFloat(paid) || 0;
                  const discountAmount = parseFloat(value) || 0;
                  
                  if (paidAmount === 0 && discountAmount === 0) {
                    return Promise.reject('Please enter either Amount Paid or Discount Given');
                  }
                  if (discountAmount < 0) {
                    return Promise.reject('Discount cannot be negative');
                  }
                  return Promise.resolve();
                }
              }]}
            >
              <Input
                type='number'
                placeholder="Enter Discount"
                onWheel={preventWheelChange}
                onChange={(e) => handleAmountOutChange(e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        {isNegativeBalance && (
          <Alert
            message="Warning: Negative Balance"
            description="This transaction will result in a negative balance."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={[16, 0]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="Remaining"
              label="Remaining Balance"
              rules={[{ required: true, message: 'Remaining amount is required' }]}
            >
              <Input
                type='number'
                disabled
                style={{
                  backgroundColor: remaining >= 0 ? '#f6ffed' : '#fff1f0',
                  borderColor: remaining >= 0 ? '#b7eb8f' : '#ffa39e'
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="Date"
              label="Transaction Date"
              rules={[{ required: true, message: 'Please select transaction date' }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="PaymentMethodId"
              label={`Payment Method - ${paymentMethodRemainingAmount}`}
              rules={[{ required: true, message: 'Please select Payment Method' }]}
            >
              <ReusableDropdown
                data={paymentMethod}
                valueField="paymentMethodId"
                labelField="name"
                placeholder="Select Payment Method"
                loading={loadingPaymentMethod}
                style={{ width: '100%' }}
                defaultOption={false}
                 value={form.getFieldValue("paymentMethodId")}
                onChange={(id) => {
                  form.setFieldsValue({ PaymentMethodId: id });
                  const selected = paymentMethod.find((item) => item.paymentMethodId === id);
                  setPaymentMethodRemainingAmount(selected?.remaining || '');
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item name="Description" label="Description">
              <Input.TextArea rows={1} placeholder="Description" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default SupplierTransaction;