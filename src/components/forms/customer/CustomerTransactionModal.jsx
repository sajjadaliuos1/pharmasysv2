import React, { useEffect, useState } from 'react';
import { Modal, Select, Form, Button, Input, message, Row, Col, Card, Statistic, Alert } from 'antd';
import { customerTransactionPayment, getPayment, getOpenInvoice,CloseInvoice } from '../../../api/API';
import { DollarCircleOutlined } from '@ant-design/icons';
import preventWheelChange from '../../common/PreventWheel';
import ReusableDropdown from '../../common/ReusableDropdown';
import { Toaster } from '../../common/Toaster';
import InvoiceCloseConfirmationModal from './InvoiceCloseConfirmationModal'; // Import the new component

const CustomerTransactionModal = ({ visible, title, onCancel, initialValues, onSave, button }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const [paid, setPaid] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isNegativeBalance, setIsNegativeBalance] = useState(false);

  // Close Invoice Modal State
  const [closeInvoiceModalVisible, setCloseInvoiceModalVisible] = useState(false);
  const [selectedInvoiceForClose, setSelectedInvoiceForClose] = useState(null);

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

        // use for dropdown to get record in fast....
        const map = new Map();
        paymentList.forEach(s => map.set(s.paymentMethodId, s));
        setPaymentMethodMap(map);
      } else {
        Toaster.warning("No payment Method found or unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      Toaster.error("Failed to load suppliers. Please try again.");
    } finally {
      setLoadingPaymentMethod(false);
    }
  };

  useEffect(() => {
    if (visible && initialValues) {
      setPaymentDetails(initialValues);
      form.setFieldsValue({
        customerId: initialValues.customerId,
        paid: '',
        discount: '',
        date: new Date().toISOString().substr(0, 10),
      });
      setPaid(0);
      setDiscount(0);
      fetchPaymentMethod();
      fetchInvoicesByCustomer(initialValues?.customerId);
      setRemaining(initialValues.remaining || 0);
      setIsNegativeBalance(false);
    }
  }, [visible, initialValues, form]);

  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [customerRemainingAmount, setCustomerRemainingAmount] = useState('');
  const [InvoiceNo, setNewInvoiceNo] = useState([]);

  const fetchInvoicesByCustomer = async (customerId) => {
    try {
      setLoadingInvoices(true);
      const response = await getOpenInvoice(customerId);

      const invoiceList = response.data?.data?.filter(inv => inv.openInvoiceId > 0)
        .map(inv => ({
          value: inv.openInvoiceId || inv.saleId,
          label: `${inv.invoiceNo} - Rs. ${inv.totalAmount}`,
          text: `${inv.invoiceNo}`,
          amount: `${inv.totalAmount}`,
          totalAmount: `${inv.totalAmount}`, // Store total for close confirmation
        })) || [];

      setInvoiceNumbers(invoiceList);

      if (invoiceList.length > 0) {
        const first = invoiceList[0];
        setSelectedInvoiceId(first.value);
        setNewInvoiceNo(first.text);
        setCustomerRemainingAmount(first.amount);
        form.setFieldsValue({ 
          invoiceId: first.value,
          remaining: first.amount || 0
        });
      } else {
        setSelectedInvoiceId(null);
        setNewInvoiceNo('');
        setCustomerRemainingAmount(0);
        form.setFieldsValue({ 
          invoiceId: null,
          remaining: 0
        });
        Toaster.warning("No invoices found for this customer.");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      Toaster.error("Failed to load invoices.");
      setInvoiceNumbers([]);
      setSelectedInvoiceId(null);
      setNewInvoiceNo('');
      setCustomerRemainingAmount(0);
      form.setFieldsValue({ invoiceId: null });
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleAmountInChange = (value) => {
    const newAmountIn = parseFloat(value) || 0;
    setPaid(newAmountIn);
    calculateRemaining(newAmountIn, discount);
    if (value !== '' && value !== null) {
      form.validateFields(['paid', 'discount']);
    }
  };

  const handleAmountOutChange = (value) => {
    const newAmountOut = parseFloat(value) || 0;
    setDiscount(newAmountOut);
    calculateRemaining(paid, newAmountOut);
    if (value !== '' && value !== null) {
      form.validateFields(['paid', 'discount']);
    }
  };

  const calculateRemaining = (paid, discount) => {
    const existingRemaining = parseFloat(customerRemainingAmount || 0);
    const newRemaining = existingRemaining - paid - discount;
    setIsNegativeBalance(newRemaining < 0);
    setRemaining(newRemaining);
    if (paid > 0 || discount > 0) {
      form.setFieldsValue({ remaining: newRemaining.toFixed(2) });
    }
  };

  // Handle Close Invoice Button Click
  const handleCloseInvoiceClick = () => {
    const invoiceId = form.getFieldValue('invoiceId');
    if (!invoiceId) {
      Toaster.warning("Please select an invoice first.");
      return;
    }

    const selectedInvoice = invoiceNumbers.find(inv => inv.value === invoiceId);
    if (selectedInvoice) {
      setSelectedInvoiceForClose({
        invoiceId: invoiceId,
        invoiceNo: selectedInvoice.text,
        amount: selectedInvoice.amount,
        totalAmount: selectedInvoice.totalAmount
      });
      setCloseInvoiceModalVisible(true);
    }
  };

  // Handle Invoice Close Confirmation
  const handleInvoiceCloseConfirm = async (invoiceData) => {
    try {
      // Add your close invoice API call here
      // Example: await closeInvoiceAPI(invoiceData.invoiceId);
      const response = await CloseInvoice(invoiceData.invoiceId);

      if (response.data.status == "Success") {
      // For now, just show success message
      Toaster.success(`Invoice ${invoiceData.invoiceNo} has been closed successfully.`);
      
      // Refresh the invoice list
      fetchInvoicesByCustomer(paymentDetails?.customerId);
      }else {
        Toaster.error(response.data.message || "Failed to close invoice."); 
      return;
      }
      // Close the modal
      setCloseInvoiceModalVisible(false);
      setSelectedInvoiceForClose(null);
      
    } catch (error) {
      console.error("Error closing invoice:", error);
      Toaster.error("Failed to close invoice. Please try again.");
      throw error; // Re-throw to handle in the modal
    }
  };

  const handleSubmit = async (values) => {
    try {
      setBtnLoading(true);
      await form.validateFields();
      if ((!values.paid || values.paid === '') && 
          (!values.discount || values.discount === '')) {
        message.error('Please enter either Amount In or Amount Out');
        setBtnLoading(false);
        return;
      }

      const finalRemaining = parseFloat(values.remaining);
      if (finalRemaining < 0) {
        Modal.confirm({
          title: 'Warning: Negative Balance',
          content: 'This transaction will result in a negative balance. Do you want to proceed?',
          okText: 'Yes, proceed',
          cancelText: 'Cancel',
          onOk: () => submitTransaction(values),
          onCancel: () => setBtnLoading(false)
        });
      } else {
        submitTransaction(values);
      }
    } catch (err) {
      console.error("Error processing transaction:", err);
      message.error(err.message || "Something went wrong while processing transaction.");
      setBtnLoading(false);
    }
  };

  const submitTransaction = async (values) => {
    try {
      const payload = {
        ...values,
        id: null,
        paymentMethodId: values.paymentMethodId ? Number(values.paymentMethodId) : 0,
        paid: parseFloat(values.paid) || 0,
        discount: parseFloat(values.discount) || 0,
        remaining: parseFloat(values.remaining),
        invoiceNo: parseInt(InvoiceNo),
        customerId: paymentDetails.customerId,
        createdBy: 0
      };

      console.log("Submitting transaction with payload:", payload);
      const response = await customerTransactionPayment(payload);

      if (!response || !response.data) throw new Error("Invalid response from server");

      if (response.data.status === "Success") {
        form.resetFields();
        if (typeof onSave === 'function') onSave(values);
      } else {
        message.error(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error processing transaction:", err);
      message.error(err.message || "Something went wrong while processing transaction.");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={visible}
        title={title}
        onCancel={onCancel}
        width={600}
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
        {paymentDetails && (
          <Card 
            style={{ marginBottom: 16 }} 
            title=""
            bordered={false}
            size="small"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="Name" 
                  value={paymentDetails.customerName || "N/A"} 
                  valueStyle={{ fontSize: '20px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Current Balance" 
                  value={paymentDetails.remaining} 
                  prefix={<DollarCircleOutlined />}
                  valueStyle={{ color: parseFloat(paymentDetails.remaining) >= 0 ? '#3f8600' : '#cf1322', fontSize: '22px' }}
                />
              </Col>
            </Row>
          </Card>
        )}

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item
                name="invoiceId"
                label="Invoice Number"
                rules={[{ required: true, message: 'Please select an invoice number' }]}
              >
                <Select
                  placeholder="Select Invoice"
                  options={invoiceNumbers}
                  loading={loadingInvoices}
                  value={selectedInvoiceId}
                  onChange={(value) => {
                    setSelectedInvoiceId(value);
                    
                    const selectedOption = invoiceNumbers.find(item => item.value === value);
                    if (selectedOption) {
                      setNewInvoiceNo(selectedOption.text);  
                      setCustomerRemainingAmount(selectedOption.amount);
                      form.setFieldsValue({ 
                        invoiceId: value,
                        remaining: selectedOption.amount || 0
                      });
                    } else {
                      setNewInvoiceNo('');
                    }
                  }}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="closedInvoice" label=" ">
                <Button onClick={handleCloseInvoiceClick}>
                  Close Invoice
                </Button>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="paymentMethodId" noStyle />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paid"
                label="Paid Amount"
                onWheel={preventWheelChange}
                rules={[
                  { 
                    validator: (_, value) => {
                      const discount = form.getFieldValue('discount');
                      if ((value === '' || value === null || value === undefined) && 
                          (discount === '' || discount === null || discount === undefined)) {
                        return Promise.reject('Please enter either Paid Amount or Discount');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input 
                  type='number' 
                  placeholder="Enter Amount" 
                  onChange={(e) => handleAmountInChange(e.target.value)} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discount"
                label="Discount Amount"
                onWheel={preventWheelChange}
                rules={[
                  { 
                    validator: (_, value) => {
                      const paid = form.getFieldValue('paid');
                      if ((value === '' || value === null || value === undefined) && 
                          (paid === '' || paid === null || paid === undefined)) {
                        return Promise.reject('Please enter either Paid Amount In or Discount Amount');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input 
                  type='number' 
                  placeholder="Enter discount" 
                  onChange={(e) => handleAmountOutChange(e.target.value)} 
                />
              </Form.Item>
            </Col>
          </Row>

          {isNegativeBalance && (
            <Alert
              message="Warning: Negative Balance"
              description="This transaction will result in a negative balance."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="remaining"
                label="New Remaining Balance"
                rules={[
                  { required: true, message: 'Please enter Remaining Amount' }
                ]}
              >
                <Input 
                  type='number' 
                  placeholder="Calculated Remaining Amount" 
                  disabled 
                  style={{ 
                    backgroundColor: remaining >= 0 ? '#f6ffed' : '#fff1f0', 
                    borderColor: remaining >= 0 ? '#b7eb8f' : '#ffa39e' 
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="date" 
                label="Transaction Date"  
                rules={[
                  { required: true, message: 'Please enter Date' }
                ]}
              >
                <Input type='date' placeholder="Enter Date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="paymentMethodId"
            label={`Payment Method - ${paymentMethodRemainingAmount}`}
            style={{ width: '100%' }}
          >
            <ReusableDropdown
              data={paymentMethod}
              valueField="paymentMethodId" 
              labelField="name"      
              placeholder="Select Payment Method"
              loading={loadingPaymentMethod}
              style={{ width: '100%' }}
              defaultOption={false} 
              onChange={(paymentMethodId) => {
                form.setFieldsValue({ paymentMethodId });  

                const selectedMethod = paymentMethodMap.get(paymentMethodId);
                if (selectedMethod) {
                  setPaymentMethodRemainingAmount(selectedMethod.remaining || '');
                } else {
                  setPaymentMethodRemainingAmount('');
                }
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Invoice Close Confirmation Modal */}
      <InvoiceCloseConfirmationModal
        visible={closeInvoiceModalVisible}
        onCancel={() => {
          setCloseInvoiceModalVisible(false);
          setSelectedInvoiceForClose(null);
        }}
        invoiceData={selectedInvoiceForClose}
        onConfirm={handleInvoiceCloseConfirm}
      />
    </>
  );
};

export default CustomerTransactionModal;