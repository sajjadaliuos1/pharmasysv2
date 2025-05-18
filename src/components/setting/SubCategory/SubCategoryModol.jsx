import React, { useEffect,useState } from 'react';
import { Modal, Form, Button, Input, message } from 'antd';
import { createSubCategory } from '../../../api/API';


const SubCategoryModal = ({ visible, title, onCancel, initialValues, onSave,button, setIsModalVisible }) => {
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
      
try {
      await form.validateFields();
    } catch (validationError) {
      setBtnLoading(false);
      return;
    }

      await form.validateFields();
      
      const payload = {
        ...values,
        typeId: values.typeId ? Number(values.typeId) : 0,  
      };

      const response = await createSubCategory(payload);
      
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      if (response.data.status === "Success") {      
        form.resetFields();
        
        if (typeof onSave === 'function') {
          onSave(values);
        }
      } else {
        message.error(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error saving Subcategory:", err);
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
        initialValues={initialValues}
      >
        <Form.Item name="typeId" noStyle />
        <Form.Item
          name="typeName"
          label="SubCategory Name"
          rules={[
            { required: true, message: 'Please enter Subcategory name', whitespace: true },
            { max: 100, message: 'SubCategory name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter Subcategory name" maxLength={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubCategoryModal;