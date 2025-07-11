import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, message } from 'antd';
import { createNicuRecord } from '../../../api/API';
import preventWheelChange from '../../common/PreventWheel';

const NicuModal = ({ visible, title, onCancel, initialValues, onSave, button, IsModalVisible }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);  
  const [isUpdate, setIsUpdate] = useState(false);


  useEffect(() => {
    if (visible) {
      const hasInitial = !!initialValues?.nicuId;
      setIsUpdate(hasInitial);

    
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      if (hasInitial) {
         let formValues = { ...initialValues };
        
        //  if (initialValues.date) {
        //   try {
        //     const dateObj = new Date(initialValues.date);
        //     if (!isNaN(dateObj.getTime())) {
        //       formValues.date = dateObj.toISOString().split('T')[0];
        //     } else {
        //       formValues.date = formattedDate;
        //     }
        //   } catch (e) {
        //     formValues.date = formattedDate;
        //   }
        // } else {
        //   formValues.date = formattedDate;
        // }
        
        // formValues.remaing = initialValues.remaining || initialValues.remaing || 0;
        
        console.log('Setting form values for update:', formValues);
        form.setFieldsValue(formValues);
      
      } else {
        const defaultValues = {
          nicuId: null,          
          PatientName :'',
          Contact : '',
          Address :'',
          Bed:'',
          AdmissionDatetime:'',
          Fee: '',
          Description : '',
        };
        form.setFieldsValue(defaultValues);
      
      }
    }
  }, [visible, initialValues, form]);

  

  const handleSubmit = async (values) => {
    try {
      setBtnLoading(true);
      await form.validateFields();

      const payload = {
        ...values,
        id: values.id || null,
      };

      const response = await createNicuRecord(payload);

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
        <Form.Item name="nicuId" noStyle />
      
        <Form.Item
          name="patientName"
          label="Patient Name"
          rules={[
            { required: true, message: 'Please enter payment name', whitespace: true },
            { max: 100, message: 'Payment name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter payment name" maxLength={100} />
        </Form.Item>

           <Form.Item
            name="contact"
            label="Contact"
            rules={[
              { required: true, message: 'Please enter Amount In' }
            ]}
          >
           <Input placeholder="Enter payment name" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[
              { required: true, message: 'Please enter Remaining Amount' }
            ]}
          >
             <Input placeholder="Enter payment name" maxLength={100} />
          </Form.Item>
          <Form.Item 
          name="bed" 
          label="bed"  
          rules={[
            { required: true, message: 'Please enter Date' }
          ]}
        >
           <Input placeholder="Enter payment name" maxLength={100} />
        </Form.Item>
        
          <Form.Item 
          name="fee" 
          label="fee"  
          rules={[
            { required: true, message: 'Please enter Date' }
          ]}
        >
           <Input placeholder="Enter payment name" maxLength={100} />
        </Form.Item>
        
 <Form.Item 
          name="admissionDatetime" 
          label="admission Date"  
          rules={[
            { required: true, message: 'Please enter Date' }
          ]}
        >
           <Input placeholder="Enter payment name" maxLength={100} />
        </Form.Item>

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

export default NicuModal;