
import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, message } from 'antd';
import { createExpense, getPayment,getExpenseCategory } from '../../../api/API';
import ReusableDropdown from '../../common/ReusableDropdown';
import { Toaster } from '../../common/Toaster';


const ExpenseModal = ({ visible, title, onCancel, initialValues, onSave, button, setIsModalVisible }) => {
    const [form] = Form.useForm();
    const [btnLoading, setBtnLoading] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState([]);
    const [paymentMethodMap, setPaymentMethodMap] = useState(new Map());
    const [paymentMethodRemainingAmount, setPaymentMethodRemainingAmount] = useState('');
    const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);

    const fetchPaymentMethod = async () => {
        try {
            setLoadingPaymentMethod(true);
            const response = await getPayment();
            if (response.data && response.data.data) {
                const paymentList = response.data.data;
                setPaymentMethod(paymentList);


                const map = new Map();
                paymentList.forEach(s => map.set(s.paymentMethodId, s));
                setPaymentMethodMap(map);

                if (paymentList.length > 0) {
                    const firstItem = paymentList[0];
                    form.setFieldsValue({ paymentMethodId: firstItem.paymentMethodId });
                    setPaymentMethodRemainingAmount(firstItem.remaining || '');
                }
            } else {
                message.warn("No payment Method found or unexpected response format.");
            }
        } catch (err) {
            console.error("Error fetching suppliers:", err);
            message.error("Failed to load suppliers. Please try again.");
        } finally {
            setLoadingPaymentMethod(false);
        }
    };

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await getExpenseCategory(); // your API call here
            if (response.data?.data) {
                setCategories(response.data.data);
            } else {
                message.warn("No categories found or unexpected response format.");
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            message.error("Failed to load categories. Please try again.");
        } finally {
            setLoadingCategories(false);
        }
    };

    // Reset form when modal opens/closes or initialValues change
    useEffect(() => {
        fetchPaymentMethod();
        fetchCategories();
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

            const amount = parseFloat(values.amount);
            if(paymentMethodRemainingAmount < amount) {
                Toaster.error("Insufficient balance in selected payment method.");
            return;
            }
            

            // Prepare payload with proper type conversion
            const payload = {
                ...values,               
                amount: values.amount ? parseFloat(values.amount) : 0,
                paymentMethodId: values.paymentMethodId ? Number(values.paymentMethodId) : 0,
                date: new Date().toISOString().split('T')[0],
                description: values.description || '',
                expenseCategoryId: values.typeId ? Number(values.typeId) : 0,                
            };

            console.log("Submitting payload:", payload);
           

            // Call API
            const response = await createExpense(payload);

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
            fetchPaymentMethod(); // Refresh payment methods after save
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
                <Form.Item name="typeId" noStyle />
                <Form.Item
                    name="typeId"
                    label="Category"
                    style={{ width: '100%' }}
                    rules={[{ required: true, message: 'Please select a category' }]}
                >
                    <ReusableDropdown
                        data={categories}
                        valueField="typeId"
                        labelField="typeName"
                        placeholder="Select Category"
                        loading={loadingCategories}
                        style={{ width: '100%' }}
                        defaultOption={false}
                        onChange={(categoryId) => {
                            form.setFieldsValue({ categoryId });
                            // Handle anything else on category select
                        }}
                    />
                </Form.Item>
                <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true, message: 'Please enter amount' } 
                       ]}
                >
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        min={0}
                        step="0.01"
                        style={{ width: '100%' }}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value && !/^\d*\.?\d*$/.test(value)) {
                                message.error("Amount must be a valid number");
                                return;
                            }
                            form.setFieldsValue({ amount: value });
                        }}
                        onWheel={(e) => {e.target.blur()}}
                    />
                </Form.Item>

                         

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ max: 500, message: 'Description cannot exceed 500 characters' }]}
                >
                    <Input.TextArea
                        placeholder="Enter description"
                        maxLength={500}
                        rows={4}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
                                <Form.Item
                    name="paymentMethodId"
                    label={`Payment Method - ${paymentMethodRemainingAmount}`}
                    style={{ width: '100%' }}
                    rules={[{ required: true, message: 'Please select a payment method' }]}
                > 
                    <ReusableDropdown
                        data={paymentMethod}
                        valueField="paymentMethodId"
                        labelField="name"
                        placeholder="Select Payment Method"
                        loading={loadingPaymentMethod}
                        style={{ width: 'calc(100%)' }}
                        defaultOption={false}
                        value={form.getFieldValue("paymentMethodId")}
                        onChange={(paymentMethodId) => {
                            form.setFieldsValue({ paymentMethodId });
                            const selectedMethod = paymentMethodMap.get(paymentMethodId);
                            setPaymentMethodRemainingAmount(selectedMethod?.remaining || '');
                        }}
                    />
                </Form.Item>


            </Form>
        </Modal>
    );
};

export default ExpenseModal;