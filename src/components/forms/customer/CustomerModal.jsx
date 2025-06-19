import React, { useEffect,useState } from 'react';
import { Modal, Form, Button, Input, message, Row, Col, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { createCustomer } from '../../../api/API';


const CustomerModal = ({ visible, title, onCancel, initialValues, onSave,button, setIsModalVisible }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  
  useEffect(() => {
    if (visible) {
      // Check if CustomerId exists and is not 0 to determine if it's an update
      const hasInitial = !!(initialValues?.customerId && initialValues.customerId !== 0);
      setIsUpdate(hasInitial);
      
      if (initialValues) {
      
        const formattedValues = {
          ...initialValues,
          date: initialValues.date ? dayjs(initialValues.date) : dayjs() // Default to current date if no date in initialValues
        };
        form.setFieldsValue(formattedValues);
      } else {
        form.resetFields();
        // Set current date as default
        form.setFieldsValue({
          date: dayjs()
        });
      }
    }
  }, [visible, initialValues, form]);
  
  const handleSubmit = async (values) => {
    try {
      setBtnLoading(true);
      try{
             await form.validateFields();
      }
      catch (error) {
        setBtnLoading(false);
        return;
      }
      
      const payload = {
        ...values,
        customerId: values.customerId ? Number(values.customerId) : 0,
        date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'), // Use current date if no date selected
      };

      console.log("Payload Customer:as ", payload); 
      // Call API
      const response = await createCustomer(payload);
      
      // Safety check for API response
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      // Check response status
      if (response.data.status === "Success") {      
        // Reset form and notify parent component
        form.resetFields();
        
        // Call parent's onSave callback to trigger grid refresh
        if (typeof onSave === 'function') {
          onSave(values);
        }
      } else {
        // Show error message from API
        message.error(response.data.message || "Operation failed");
      }
    } catch (err) {
      // Handle API errors
      console.error("Error saving category:", err);
      message.error(err.message || "Something went wrong while saving.");
    }finally {
      setBtnLoading(false);
    }
  };
  
  return (
    <Modal
      open={visible}
      title={title}
      onCancel={onCancel}
      width={800}
      zIndex={3000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={() => handleSubmit(form.getFieldsValue())}
          disabled={btnLoading}
          loading={btnLoading}
        >
         {button}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs() // Set current date as form's initial value
        }}
      >
        <Form.Item name="customerId" noStyle />
        
        <Row gutter={[16, 0]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="customerName"
              label="Customer Name"
              rules={[
                { required: true, message: 'Please enter Customer name' , whitespace: true },
                { max: 100, message: 'Customer name cannot exceed 100 characters' }
              ]}
            >
              <Input placeholder="Enter Customer name" maxLength={100} />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="contact"
              label="Contact"
            >
              <Input placeholder="Enter Contact" maxLength={100} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="address"
              label="Address"
            >
              <Input placeholder="Enter address" maxLength={100} />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            
              <Form.Item
                name="amount"
                label="Amount"
              >
                <Input type='number' placeholder="Enter Amount" maxLength={100}
                disabled={isUpdate} />
              </Form.Item>
          
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="paid"
              label="Paid"
            >
              <Input type='number' placeholder="Enter paid Amount" maxLength={100} 
              disabled={isUpdate} />
            </Form.Item>
          </Col>
          
         <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="remaining"
              label="Remaining"
            >
              <Input type='number' placeholder="Enter Remaining" maxLength={100} 
              disabled={isUpdate} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16,0]}>
           
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="date"
              label="Date"
            >
              <DatePicker 
                placeholder="Select Date" 
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
            
          </Col>
        </Row>

      </Form>
    </Modal>
  );
};

export default CustomerModal;