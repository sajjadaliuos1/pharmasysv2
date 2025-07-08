

import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, message } from 'antd';
import { createUser } from '../../../api/API';
import { Toaster } from '../../common/Toaster';


const UserModal = ({ visible, title, onCancel, initialValues, onSave, button, setIsModalVisible }) => {
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
            }
            catch (error) {
                setBtnLoading(false);
                return;
            }

            // Prepare payload with proper type conversion
            const payload = {
                ...values,
            };

            console.log("Submitting payload:", payload);


           
            const response = await createUser(payload);

            if (!response || !response.data) {
                throw new Error("Invalid response from server");
            }


            if (response.data.status === "Success") {
                form.resetFields();

                Toaster.success(response.data.message || 'Successfully Inserted')
                if (typeof onSave === 'function') {
                    onSave(values);
                }
            } else {
                Toaster.error(response.data.message || "Operation failed")
                message.error(response.data.message || "Operation failed");
            }
        } catch (err) {
            console.error("Error saving category:", err);
            message.error(err.message || "Something went wrong while saving.");
            Toaster.error(err.message || "Something went wrong while saving.")
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
                <Form.Item name="employeeId" noStyle />
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter name' }
                    ]}
                >
                    <Input
                        placeholder="Enter name"
                        maxLength={100}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
                <Form.Item
                    name="contactNo"
                    label="ContactNo"
                    rules={[{ message: 'please Enter ContactNo' }]}
                >
                    <Input
                        placeholder="Enter ContactNo"
                        maxLength={100}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ message: 'please Enter Address' }]}
                >
                    <Input
                        placeholder="Enter address"
                        maxLength={100}
                        style={{ width: '100%' }}
                    />
                </Form.Item>


            </Form>
        </Modal>
    );
};

export default UserModal;