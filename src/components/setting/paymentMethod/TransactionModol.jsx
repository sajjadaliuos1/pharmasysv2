import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, message, Row, Col, Card, Statistic, Alert } from 'antd';
import { transactionPayment } from '../../../api/API';
import { DollarCircleOutlined } from '@ant-design/icons';
import preventWheelChange from '../../common/PreventWheel';

const TransactionModal = ({ visible, title, onCancel, initialValues, onSave, button }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const [amountIn, setAmountIn] = useState(0);
  const [amountOut, setAmountOut] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isNegativeBalance, setIsNegativeBalance] = useState(false);

  useEffect(() => {
    if (visible && initialValues) {
      setPaymentDetails(initialValues);
      form.setFieldsValue({
        paymentMethodId: initialValues.paymentMethodId,
        amountIn: '',
        amountOut: '',
        remaining: initialValues.remaining || 0,
        date: new Date().toISOString().substr(0, 10), // Set current date as default
        description: ""
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
    if (value !== '' && value !== null) {
      form.validateFields(['amountIn', 'amountOut']);
    }
  };

  const handleAmountOutChange = (value) => {
    const newAmountOut = parseFloat(value) || 0;
    setAmountOut(newAmountOut);
    calculateRemaining(amountIn, newAmountOut);
    if (value !== '' && value !== null) {
      form.validateFields(['amountIn', 'amountOut']);
    }
  };

  const calculateRemaining = (inAmount, outAmount) => {
    const existingRemaining = parseFloat(paymentDetails?.remaining || 0);
    const newRemaining = existingRemaining + inAmount - outAmount;
    setIsNegativeBalance(newRemaining < 0);
    setRemaining(newRemaining);
    if (inAmount > 0 || outAmount > 0) {
      form.setFieldsValue({ remaining: newRemaining.toFixed(2) });
    }
  };

  const handleSubmit = async (values) => {
    try {
      setBtnLoading(true);
      await form.validateFields();
      if ((!values.amountIn || values.amountIn === '') && 
          (!values.amountOut || values.amountOut === '')) {
        message.error('Please enter either Amount In or Amount Out');
        setBtnLoading(false);
        return;
      }
      
 
      const finalRemaining = parseFloat(values.remaining);
      if (finalRemaining < 0) {
        Modal.confirm({
          title: 'Warning: Negative Balance',
          content: 'This transaction will result in a negative balance. Do you want to proceed?',
          okText: 'Yes, proceed',
          cancelText: 'Cancel',
          onOk: () => submitTransaction(values),
          onCancel: () => setBtnLoading(false)
        });
      } else {
        submitTransaction(values);
      }
    } catch (err) {
      console.error("Error processing transaction:", err);
      message.error(err.message || "Something went wrong while processing transaction.");
      setBtnLoading(false);
    }
  };
  
  const submitTransaction = async (values) => {
    try {
      const payload = {
        ...values,
        id: null, // New transaction
        paymentMethodId: values.paymentMethodId ? Number(values.paymentMethodId) : 0,
        amountIn: parseFloat(values.amountIn) || 0,
        amountOut: parseFloat(values.amountOut) || 0,
        remaining: parseFloat(values.remaining)
      };

      const response = await transactionPayment(payload);

      if (!response || !response.data) throw new Error("Invalid response from server");

      if (response.data.status === "Success") {
        form.resetFields();
        if (typeof onSave === 'function') onSave(values);
      } else {
        message.error(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error processing transaction:", err);
      message.error(err.message || "Something went wrong while processing transaction.");
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
      // style={{ zIndex: -3000 }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit"
          type="primary"
          onClick={() => handleSubmit(form.getFieldsValue())}
          loading={btnLoading}
          disabled={btnLoading}
        >
          {button}
        </Button>
      ]}
    >
      {paymentDetails && (
        <Card 
          style={{ marginBottom: 16 }} 
          title=""
          bordered={false}
          size="small"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Statistic 
                title="Name" 
                value={paymentDetails.name || "N/A"} 
                valueStyle={{ fontSize: '20px' }}
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Current Balance" 
                value={paymentDetails.remaining} 
                prefix={<DollarCircleOutlined />}
                valueStyle={{ color: parseFloat(paymentDetails.remaining) >= 0 ? '#3f8600' : '#cf1322', fontSize: '22px' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Form
        form={form}
        layout="vertical"
      >
        {/* Hidden fields */}
        <Form.Item name="paymentMethodId" noStyle />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="amountIn"
              label="Amount In"
             
               onWheel={preventWheelChange}
              rules={[
                { 
                  validator: (_, value) => {
                    const amountOut = form.getFieldValue('amountOut');
                    if ((value === '' || value === null || value === undefined) && 
                        (amountOut === '' || amountOut === null || amountOut === undefined)) {
                      return Promise.reject('Please enter either Amount In or Amount Out');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input 
                type='number' 
                placeholder="Enter Amount In" 
                onChange={(e) => handleAmountInChange(e.target.value)} 
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="amountOut"
              label="Amount Out"
              onWheel={preventWheelChange}
              rules={[
                { 
                  validator: (_, value) => {
                    const amountIn = form.getFieldValue('amountIn');
                    if ((value === '' || value === null || value === undefined) && 
                        (amountIn === '' || amountIn === null || amountIn === undefined)) {
                      return Promise.reject('Please enter either Amount In or Amount Out');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input 
                type='number' 
                placeholder="Enter Amount Out" 
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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="remaining"
              label="New Remaining Balance"
              rules={[
                { required: true, message: 'Please enter Remaining Amount' }
              ]}
            >
              <Input 
                type='number' 
                placeholder="Calculated Remaining Amount" 
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
              name="date" 
              label="Transaction Date"  
              rules={[
                { required: true, message: 'Please enter Date' }
              ]}
            >
              <Input type='date' placeholder="Enter Date" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          name="description" 
          label="Transaction Description"  
        >
          <Input.TextArea 
            placeholder="Enter Transaction Description"
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransactionModal;