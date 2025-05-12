import React, { useEffect,useState } from 'react';
import { Modal, Form, Button, Input, message } from 'antd';
import { createCategory } from '../../../api/API';


const CategoryModal = ({ visible, title, onCancel, initialValues, onSave,button, setIsModalVisible }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);

  // Reset form when modal opens/closes or initialValues change
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
      // Validate form before proceeding
      await form.validateFields();
      
      // Prepare payload with proper type conversion
      const payload = {
        ...values,
        typeId: values.typeId ? Number(values.typeId) : 0,  
      };

      // Call API
      const response = await createCategory(payload);
      
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
        <Form.Item name="typeId" hidden />
        <Form.Item
          name="typeName"
          label="Category Name"
          rules={[
            { required: true, message: 'Please enter category name' },
            { max: 100, message: 'Category name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter category name" maxLength={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryModal;