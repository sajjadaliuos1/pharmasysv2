


import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, message } from 'antd';
import { createAuthUser, getRole } from '../../../api/API';
import ReusableDropdown from '../../common/ReusableDropdown';
import { Toaster } from '../../common/Toaster';


const AddEmloyeeModal = ({ visible, title, onCancel, initialValues, onSave, button, setIsModalVisible }) => {
    const [form] = Form.useForm();
    const [btnLoading, setBtnLoading] = useState(false);

    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const fetchRoles = async () => {
        try {
            setLoadingRoles(true);
            const response = await getRole();  
            if (response.data?.data) {
                setRoles(response.data.data);
            } else {
                message.warn("No role found or unexpected response format.");
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            message.error("Failed to load categories. Please try again.");
        } finally {
            setLoadingRoles(false);
        }
    };

  useEffect(() => {
    fetchRoles();

    if (visible) {
        if (initialValues) {
            const updatedValues = { ...initialValues };

            if (initialValues.roleId) {               
                updatedValues.typeId = initialValues.roleId;
            } else {
                updatedValues.typeId = undefined;
            }

            form.setFieldsValue(updatedValues);
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
                username: values.username || '',
                password:values.password ,
                roleId: values.typeId ? Number(values.typeId) : 0,
            };

            console.log("Submitting payload:", payload);


            // Call API
            const response = await createAuthUser(payload);

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
                <Form.Item name="userId" noStyle />
            
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
                    name="username"
                    label="User Name"
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
    name="password"
    label="Password"
    rules={[
        { required: true, message: 'Please enter password' },
    ]}
>
    <Input.Password
        placeholder="Enter Password"
        maxLength={100}
        style={{ width: '100%' }}
    />
</Form.Item>

<Form.Item
    name="confirmPassword"
    label="Confirm Password"
    dependencies={['password']} 
    rules={[
        { required: true, message: 'Please confirm your password' },
        ({ getFieldValue }) => ({
            validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
            },
        }),
    ]}
>
    <Input.Password
        placeholder="Confirm Password"
        maxLength={100}
        style={{ width: '100%' }}
    />
</Form.Item>


                <Form.Item
                    name="typeId"
                    label="Roles"
                    style={{ width: '100%' }}
                    rules={[{ required: true, message: 'Please select a role' }]}
                >
                    <ReusableDropdown
                        data={roles}
                        valueField="typeId"
                        labelField="typeName"
                        placeholder="Select Role"
                        loading={loadingRoles}
                        style={{ width: '100%' }}
                        defaultOption={false}
                        onChange={(categoryId) => {
                            form.setFieldsValue({ categoryId });                             
                        }}
                    />
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default AddEmloyeeModal;