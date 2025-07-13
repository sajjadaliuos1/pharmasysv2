import React, { useEffect, useState } from 'react';
import { DatePicker, Modal, Form, Button, Input, message, Row, Col, Select, Divider, Card, InputNumber } from 'antd';
import { createNicuRecord,getPayment } from '../../../api/API';
import dayjs from 'dayjs';
import ReusableDropdown from '../../common/ReusableDropdown';
const { Option } = Select;

const NicuDischargeModal = ({ visible, title, onCancel, initialValues, onSave, button, IsModalVisible }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);  
  const [isUpdate, setIsUpdate] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);
  const [paymentMethodRemainingAmount, setPaymentMethodRemainingAmount] = useState('');
  const [paymentMethodMap, setPaymentMethodMap] = useState(new Map());

  useEffect(() => {
    fetchPaymentMethod();
    if (visible) {
      const hasInitial = !!initialValues?.nicuId;
      setIsUpdate(hasInitial);

      if (hasInitial) {
        let formValues = { ...initialValues };

        if (formValues.admissionDatetime) {
          formValues.admissionDatetime = dayjs(formValues.admissionDatetime);
        }

        if (formValues.dischargeDatetime) {
          formValues.dischargeDatetime = dayjs(formValues.dischargeDatetime);
        }else {
          // If no discharge date in initial values, set to current time
          formValues.dischargeDatetime = dayjs();
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
          description: '',
          dischargeDatetime: dayjs(), // Set to current date/time
          totalAmount: '',
          paidAmount: '',
          discount: 0, // Default discount to 0
          paymentMethodId: '',
          remainingAmount: 0, // Default remaining to 0
        };
        form.setFieldsValue(defaultValues);
      }
    }
  }, [visible, initialValues, form]);

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

  // Function to calculate amounts automatically
  const calculateAmounts = (totalAmount, discount, paidAmount) => {
    const total = totalAmount || 0;
    const discountValue = discount || 0;
    const netAmount = total - discountValue;
    
    // If paid amount is not manually set, use net amount
    const paid = paidAmount !== undefined ? paidAmount : netAmount;
    const remaining = netAmount - paid;
    
    return {
      paidAmount: paid,
      remainingAmount: remaining < 0 ? 0 : remaining
    };
  };

  // Handle total amount change
  const handleTotalAmountChange = (value) => {
    const discount = form.getFieldValue('discount') || 0;
    const calculations = calculateAmounts(value, discount);
    
    form.setFieldsValue({
      paidAmount: calculations.paidAmount,
      remainingAmount: calculations.remainingAmount
    });
  };

  // Handle discount change
  const handleDiscountChange = (value) => {
    const totalAmount = form.getFieldValue('totalAmount') || 0;
    const calculations = calculateAmounts(totalAmount, value);
    
    form.setFieldsValue({
      paidAmount: calculations.paidAmount,
      remainingAmount: calculations.remainingAmount
    });
  };

  // Handle paid amount change (manual override)
  const handlePaidAmountChange = (value) => {
    const totalAmount = form.getFieldValue('totalAmount') || 0;
    const discount = form.getFieldValue('discount') || 0;
    const netAmount = totalAmount - discount;
    const remaining = netAmount - (value || 0);
    
    form.setFieldsValue({
      remainingAmount: remaining < 0 ? 0 : remaining
    });
  };

  const handleSubmit = async (values) => {
    try {
      setBtnLoading(true);
      await form.validateFields();

      const selectedDateTime = values.admissionDatetime;
      const formattedDateTime = selectedDateTime.format('YYYY-MM-DDTHH:mm:ss');

      let formattedDischargeDateTime = null;
      if (values.dischargeDatetime) {
        formattedDischargeDateTime = values.dischargeDatetime.format('YYYY-MM-DDTHH:mm:ss');
      }

      const payload = {
        ...values,
        nicuId: values.nicuId || null,
        admissionDatetime: formattedDateTime,
        dischargeDatetime: formattedDischargeDateTime,
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
      width="100%"
      style={{ maxWidth: 1200 }}
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
      <div style={{ padding: '2px 2px' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            dischargeDatetime: dayjs(),
            discount: 0,
            remainingAmount: 0
          }}
        >

          <Form.Item name="nicuId" noStyle />
          
          <Card
            title="PATIENT INFORMATION"
            style={{ 
              marginBottom: '5px',
              borderRadius: '6px',
              border: '1px solid #d9d9d9'
            }}
            headStyle={{
              backgroundColor: '#f5f5f5',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center',
              padding: '4px 8px', 
            }}
            bodyStyle={{ padding: '4px 8px' }} 
          >
            <Row gutter={16}>
              <Col xs={2} md={8}>
                <Form.Item
                  name="patientName"
                  label="Patient Name"
                >
                  <Input 
                    disabled={isUpdate}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="contact"
                  label="Contact Number"
                >
                  <Input                     
                    disabled={isUpdate}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="address"
                  label="Address"
                >
                  <Input.TextArea 
                    rows={1}
                    disabled={isUpdate}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Row gutter={16}>
            <Col xs={24} lg={8}>
              <Card
                title="ADMISSION DETAILS"
                style={{ 
                  marginBottom: '20px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  height: '100%'
                }}
                headStyle={{
                  backgroundColor: '#f0f9ff',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center',
                  padding: '12px 16px'
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <Form.Item
                  name="referBy"
                  label="Referring Doctor"
                  rules={[
                    { required: true, message: 'Please enter doctor name', whitespace: true },
                    { max: 100, message: 'Doctor name cannot exceed 100 characters' }
                  ]}
                >
                  <Input 
                    placeholder="Enter referring doctor name" 
                    maxLength={100} 
                    disabled={isUpdate}
                  />
                </Form.Item>
                
                <Form.Item 
                  name="bed" 
                  label="Bed Number"
                  rules={[
                    { required: true, message: 'Please enter bed number' }
                  ]}
                >
                  <Input 
                    placeholder="Enter bed number" 
                    maxLength={20} 
                    disabled={isUpdate}
                  />
                </Form.Item>
                
                <Form.Item 
                  name="admissionDatetime" 
                  label="Admission Date & Time"
                  rules={[
                    { required: true, message: 'Please select admission date and time' }
                  ]}
                >
                  <DatePicker 
                    showTime={{ 
                      use12Hours: true,       
                      format: 'h:mm A',       
                    }}
                    format="YYYY-MM-DD h:mm A" 
                    style={{ width: '100%' }}
                    placeholder="Select admission date and time"
                    disabled={isUpdate}
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card
                title="DISCHARGE DETAILS"
                style={{ 
                  marginBottom: '20px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  height: '100%'
                }}
                headStyle={{
                  backgroundColor: '#f6ffed',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center',
                  padding: '12px 16px'
                }}
                bodyStyle={{ padding: '20px' }}
              >
                 <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item 
                      name="dischargeDatetime" 
                      label="Discharge Date & Time"
                      rules={[
                        { required: true, message: 'Please select discharge date and time' }
                      ]}
                    >
                      <DatePicker 
                        showTime={{ 
                          use12Hours: true,       
                          format: 'h:mm A',       
                        }}
                        format="YYYY-MM-DD h:mm A" 
                        style={{ width: '100%' }}
                        placeholder="Select discharge date and time"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="totalAmount"
                      label="Total Amount"
                      rules={[
                        { required: true, message: 'Please enter total amount' }
                      ]}
                    >
                      <InputNumber 
                        placeholder="Enter total amount" 
                        style={{ width: '100%' }}
                        min={0}
                        prefix="Rs:"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        onChange={handleTotalAmountChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Second Row: Description (spans 2 rows) & Discount */}
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item 
                      name="description" 
                      label="Medical Description"
                      style={{ marginBottom: '24px' }}
                    >
                      <Input.TextArea 
                        placeholder="Enter medical description/notes"
                        maxLength={500} 
                        rows={5}                        
                        style={{ resize: 'none' }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="discount"
                      label="Discount Amount"
                    >
                      <InputNumber 
                        placeholder="Enter discount amount" 
                        style={{ width: '100%' }}
                        min={0}
                        prefix="Rs:"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        onChange={handleDiscountChange}
                      />
                    </Form.Item>
                    
                    {/* Third Row: Paid Amount (in same column) */}
                    <Form.Item
                      name="paidAmount"
                      label="Paid Amount"
                      rules={[
                        { required: true, message: 'Please enter paid amount' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const totalAmount = getFieldValue('totalAmount') || 0;
                            const discount = getFieldValue('discount') || 0;
                            const netAmount = totalAmount - discount;
                            if (!value || value <= netAmount) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Paid amount cannot exceed net amount (total - discount)'));
                          },
                        }),
                      ]}
                    >
                      <InputNumber 
                        placeholder="Enter paid amount" 
                        style={{ width: '100%' }}
                        min={0}
                        prefix="Rs:"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        onChange={handlePaidAmountChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Fourth Row: Payment Method & Remaining Amount */}
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="paymentMethodId"
                      label={`Payment Method`}
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
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="remainingAmount"
                      label="Remaining Amount"
                    >
                      <InputNumber 
                        placeholder="Remaining amount" 
                        style={{ width: '100%' }}
                        min={0}
                        prefix="Rs:"
                        disabled
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>          
        </Form>
      </div>
    </Modal>
  );
};

export default NicuDischargeModal;