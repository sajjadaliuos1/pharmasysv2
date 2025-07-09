import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, message, Row, Col } from 'antd';
import { createTest } from '../../../api/API';
import preventWheelChange from '../../common/PreventWheel';


const LaboratoryModal = ({ visible, title, onCancel, initialValues, onSave, button }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
const [processingTime, setProcessingTime] = useState('');

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
      } catch (error) {
        setBtnLoading(false);
        return;
      }

      const payload = {
        ...values,
        testId: values.testId ? Number(values.testId) : 0,
      };

      const response = await createTest(payload);

      if (!response || !response.data) throw new Error("Invalid response from server");

      if (response.data.status === "Success") {
        form.resetFields();
        if (typeof onSave === 'function') {
          onSave(values);
        }
      } else {
        message.error(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error saving category:", err);
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
        <Form.Item name="testId" noStyle />

        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Form.Item
              name="testName"
              label="Test Name"
              rules={[
                { required: true, message: 'Please enter Test name', whitespace: true },
                { max: 100, message: 'Test name cannot exceed 100 characters' }
              ]}
            >
              <Input placeholder="Enter test name" maxLength={100} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="testAmount"
              label="Test Amount"
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <Input
                type="number"
                placeholder="0"
                onWheel={preventWheelChange}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
        <Form.Item
  name="processingTime"
  label="Processing Time (HH:mm)"
  rules={[
    { required: true, message: 'Please enter processing time' },
    {
      validator: (_, value) => {
        if (!value || /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
          return Promise.resolve();
        }
        return Promise.reject('Invalid format. Use HH:mm');
      },
    },
  ]}
>
  <Input
    placeholder="01:30"
    value={processingTime}
    maxLength={5}
    onChange={(e) => {
      let val = e.target.value.replace(/\D/g, ''); // remove non-digits
      if (val.length >= 3) {
        val = val.slice(0, 4); // max 4 digits
        val = val.replace(/(\d{2})(\d{1,2})/, '$1:$2');
      }
      setProcessingTime(val);
      form.setFieldsValue({ processingTime: val });
    }}
  />
</Form.Item>



          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea
                placeholder="Enter description"
                maxLength={200}
                rows={3}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default LaboratoryModal;
