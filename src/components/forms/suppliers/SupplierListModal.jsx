
import React, { useEffect,useState } from 'react';
import { Modal, Form, Button, Input, message } from 'antd';
import { createSupplier } from '../../../api/API';


const SupplierListModal = ({ visible, title, onCancel, initialValues, onSave,button, setIsModalVisible }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
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
        supplierId: values.supplierId ? Number(values.supplierId) : 0, 
        // date: values.date ? new Date(values.date).toISOString() : null, 
      };

      console.log("Payload supplier:as ", payload); 
      // Call API
      const response = await createSupplier(payload);
      
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
      width={500}
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
        initialValues={initialValues}
      >
        <Form.Item name="supplierId" noStyle />
        <Form.Item
          name="name"
          label="Supplier Name"
          rules={[
            { required: true, message: 'Please enter supplier name' , whitespace: true },
            { max: 100, message: 'supplier name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter supplier name" maxLength={100} />
        </Form.Item>

                <Form.Item
          name="contact"
          label="Contact"
        >
          <Input placeholder="Enter Contact" maxLength={100} />
        </Form.Item>

                <Form.Item
          name="address"
          label="Address"
        >
          <Input placeholder="Enter address" maxLength={100} />
        </Form.Item>
        
        <Form.Item
        name = "amount"
        label="Amount"
        >
          <Input type='number' placeholder="Enter Amount" maxLength={100} />
        </Form.Item>
{/*
        <Form.Item
            name="discount"
            label="Discount"
            rules={[
              { required: true, message: 'Please enter Discount' , whitespace: true },
              { type: 'number', message: 'Discount must be a number' },
              { max: 100, message: 'Discount cannot exceed 100 characters' }
            ]}
            >
            <Input placeholder="Enter Discount" maxLength={100} />
        </Form.Item>
        */}
        <Form.Item
            name="paid"
            label="Paid"
            >
            <Input type='number' placeholder="Enter paid Amount" maxLength={100} />
        </Form.Item>

        <Form.Item
            name="remaining"
            label="Remaining"
            >
            <Input type='number' placeholder="Enter Remaining" maxLength={100} />
        </Form.Item>    

        <Form.Item
            name="description"
            label="Description"
            >
            <Input placeholder="Enter Description" maxLength={100} />
        </Form.Item>

        <Form.Item
                name="date"
                label="Date"
                >
                <Input type='date' placeholder="Enter Date" maxLength={100} />
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default SupplierListModal;