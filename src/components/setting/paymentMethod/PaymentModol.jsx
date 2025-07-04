import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, message } from 'antd';
import { createPayment } from '../../../api/API';
import preventWheelChange from '../../common/PreventWheel';

const PaymentModal = ({ visible, title, onCancel, initialValues, onSave, button, IsModalVisible }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const [amountIn, setAmountIn] = useState(0);
  const [amountOut, setAmountOut] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isUpdate, setIsUpdate] = useState(false);


  useEffect(() => {
    if (visible) {
      const hasInitial = !!initialValues?.paymentMethodId;
      setIsUpdate(hasInitial);

    
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      if (hasInitial) {
        // Create a copy of initialValues with formatted date
        let formValues = { ...initialValues };
        
        // Always ensure date is properly set, either from initialValues or current date
        if (initialValues.date) {
          try {
            const dateObj = new Date(initialValues.date);
            if (!isNaN(dateObj.getTime())) {
              formValues.date = dateObj.toISOString().split('T')[0];
            } else {
              formValues.date = formattedDate;
            }
          } catch (e) {
            formValues.date = formattedDate;
          }
        } else {
          formValues.date = formattedDate;
        }
        
        formValues.remaing = initialValues.remaining || initialValues.remaing || 0;
        
        console.log('Setting form values for update:', formValues);
        form.setFieldsValue(formValues);
        setAmountIn(parseFloat(initialValues.amountIn) || 0);
        setAmountOut(parseFloat(initialValues.amountOut) || 0);
        setRemaining(parseFloat(initialValues.remaining || initialValues.remaing) || 0);
      } else {
        const defaultValues = {
          id: null,
          paymentMethodId: null,
          name: "",
          description: "",
          amountIn: "",
          amountOut: 0,
          remaing: 0,
          date: formattedDate, // Set current date by default
          createdBy: 1,
        };
        form.setFieldsValue(defaultValues);
        setAmountIn(0);
        setAmountOut(0);
        setRemaining(0);
      }
    }
  }, [visible, initialValues, form]);

  const handleAmountInChange = (value) => {
    const newAmountIn = parseFloat(value) || 0;
    setAmountIn(newAmountIn);
    calculateRemaining(newAmountIn, amountOut);
  };

  const calculateRemaining = (inAmount, outAmount) => {
    const newRemaining = inAmount - outAmount;
    setRemaining(newRemaining);
    form.setFieldsValue({ remaing: newRemaining.toFixed(2) });
  };

  const handleSubmit = async (values) => {
    try {
      setBtnLoading(true);
      await form.validateFields();

      const payload = {
        ...values,
        id: values.id || null,
        paymentMethodId: values.paymentMethodId ? Number(values.paymentMethodId) : 0,
        amountIn: parseFloat(values.amountIn),
        amountOut: parseFloat(values.amountOut),
        remaining: parseFloat(values.remaing)
      };

      const response = await createPayment(payload);

      if (!response || !response.data) throw new Error("Invalid response from server");

      if (response.data.status === "Success") {
        form.resetFields();
        if (typeof onSave === 'function') onSave(values);
      } else {
        message.error(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error saving Payment:", err);
      message.error(err.message || "Something went wrong while saving.");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={title}
      onCancel={onCancel}
      width={500}
      zIndex={3000}
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
      <Form
        form={form}
        layout="vertical"
      >
        {/* Hidden fields */}
        <Form.Item name="id" noStyle />
        <Form.Item name="paymentMethodId" noStyle />
        <Form.Item name="createdBy" noStyle />

        <Form.Item
          name="name"
          label="Payment Name"
          rules={[
            { required: true, message: 'Please enter payment name', whitespace: true },
            { max: 100, message: 'Payment name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter payment name" maxLength={100} />
        </Form.Item>

        <div style={{display: isUpdate ? 'none' : 'block'}}>       
          <Form.Item
            name="amountIn"
            label="Amount In"
            rules={[
              { required: true, message: 'Please enter Amount In' }
            ]}
          >
            <Input 
              type="number" 
              placeholder="0" 
              onChange={(e) => handleAmountInChange(e.target.value)} 
              disabled={isUpdate}
              onWheel={preventWheelChange}
            />
          </Form.Item>

          <Form.Item
            name="remaing"
            label="Remaining Amount"
            rules={[
              { required: true, message: 'Please enter Remaining Amount' }
            ]}
          >
            <Input 
              type="number" 
              placeholder="0" 
              readOnly
              onWheel={preventWheelChange}
            />
          </Form.Item>
          <Form.Item 
          name="date" 
          label="Date"  
          rules={[
            { required: true, message: 'Please enter Date' }
          ]}
        >
          <Input type="date" placeholder="Enter Date" />
        </Form.Item>
        </div>
        
        <Form.Item 
          name="description" 
          label="Description"  
          
        >
          <Input.TextArea placeholder="Enter Description"
          maxLength={200} 
        rows={4}
        style={{ height: '40px' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentModal;