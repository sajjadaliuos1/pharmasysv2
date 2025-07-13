import React, { useEffect, useState } from 'react';
import { DatePicker, Modal, Form, Button, Input, message, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { createNicuRecord } from '../../../api/API';

const NicuModal = ({ visible, title, onCancel, initialValues, onSave, button }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);  
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (visible) {
      const hasInitial = !!initialValues?.nicuId;
      setIsUpdate(hasInitial);

      if (hasInitial) {
        const formValues = { ...initialValues };
        if (formValues.admissionDatetime) {
          formValues.admissionDatetime = dayjs(formValues.admissionDatetime);
        }
        form.setFieldsValue(formValues);
      } else {
        const defaultValues = {
          nicuId: null,
          referBy: '',
          patientName: '',
          contact: '',
          address: '',
          bed: '',
          admissionDatetime: dayjs(),
          fee: '',
          description: '',
        };
        form.setFieldsValue(defaultValues);
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      setBtnLoading(true);
      await form.validateFields();

      const formattedDateTime = values.admissionDatetime.format('YYYY-MM-DDTHH:mm:ss');
      const payload = {
        ...values,
        nicuId: values.nicuId || null,
        admissionDatetime: formattedDateTime,
      };

      const response = await createNicuRecord(payload);

      if (!response?.data) throw new Error("Invalid response from server");

      if (response.data.status === "Success") {
        form.resetFields();
        if (typeof onSave === 'function') onSave(values);
      } else {
        message.error(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error saving NICU record:", err);
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
      width={600}
      zIndex={3000}
      footer={[
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => handleSubmit(form.getFieldsValue())}
          loading={btnLoading}
          disabled={btnLoading}
        >
          {button}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ admissionDatetime: dayjs() }}
      >
        <Form.Item name="nicuId" noStyle />

        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item
              name="referBy"
              label="Doctor Name"
              rules={[
                { required: true, message: 'Please enter doctor name', whitespace: true },
                { max: 100 },
              ]}
            >
              <Input placeholder="Enter doctor name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="patientName"
              label="Patient Name"
              rules={[
                { required: true, message: 'Please enter patient name', whitespace: true },
                { max: 100 },
              ]}
            >
              <Input placeholder="Enter patient name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="contact"
              label="Contact"
              rules={[{ required: true, message: 'Please enter contact' }]}
            >
              <Input placeholder="Enter contact" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <Input placeholder="Enter address" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="bed"
              label="Bed No"
              rules={[{ required: true, message: 'Please enter bed no' }]}
            >
              <Input placeholder="Enter bed number" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="fee"
              label="Fee"
              rules={[{ required: true, message: 'Please enter fee' }]}
            >
              <Input placeholder="Enter total fee" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="admissionDatetime"
          label="Admission Date & Time"
          rules={[{ required: true, message: 'Please select date and time' }]}
        >
          <DatePicker
            showTime={{ use12Hours: true, format: 'h:mm A' }}
            format="YYYY-MM-DD h:mm A"
            style={{ width: '100%' }}
            placeholder="Select date and time"
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            placeholder="Enter description"
            maxLength={200}
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NicuModal;
