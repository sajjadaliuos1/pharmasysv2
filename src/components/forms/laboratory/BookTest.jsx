import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Table,
  Space,
  InputNumber,
  Spin
} from 'antd';
import { addTestRecord, getTests, getTestNo,getPayment } from '../../../api/API';
import { EditOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import { Toaster } from '../../common/Toaster';
import { useCompanyInfo } from '../../common/CompanyInfoContext';
import { TestSlip } from '../../utils/TestSlip';
import ReusableDropdown from '../../common/ReusableDropdown';  
import dayjs from 'dayjs';

const { Option } = Select;

 const  BookTest = () =>{
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [testList, setTestList] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [cart, setCart] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('');
   
  const [loadingSave, setLoadingSave] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [doctorName, setdoctorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);
  const [paymentMethodMap, setPaymentMethodMap] = useState(new Map());
  const [newTestNo, setNewTestNo] = useState();
  const [processingTime, setProcessingTime] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
const [netTotal, setNetTotal] = useState(0);
const [remainingAmount, setRemainingAmount] = useState(0);

  useEffect(() => {
  const fetchTests = async () => {
    setLoadingTests(true);
    try {
      const response = await getTests();
      if (response?.data?.data) {
        setTestList(response.data.data);
      } else {
        Toaster.warning('No test data found.');
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      Toaster.error('Failed to load tests.');
    } finally {
      setLoadingTests(false);
    }

    setPatientName('');
    setMobile('');
    setAddress('');
    setdoctorName('');
  };

  fetchTests();
  fetchTestNo();
  fetchPaymentMethod();
}, []);
useEffect(() => {
  const total = cart.reduce((sum, item) => sum + parseFloat(item.testAmount || 0), 0);
  setTotalAmount(total);

  const net = total - (parseFloat(discount) || 0);
  setNetTotal(net);

  const remaining = net - (parseFloat(paidAmount) || 0);
  setRemainingAmount(remaining);

  // Optionally update form fields too
  form1.setFieldsValue({
    totalAmount: total,
    netAmount: net,
    remaining: remaining,
  });
}, [cart, discount, paidAmount]);

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
    
      if (paymentList.length > 0 && !form1.getFieldValue("PaymentMethodId")) {
      const firstPaymentMethod = paymentList[0];
      const firstId = firstPaymentMethod.paymentMethodId;
       
      form1.setFieldsValue({ paymentMethodId: firstId });
      
    }
    
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
// Fetch Test number
const fetchTestNo = async () => {
  try {
     setLoadingTests(true);
    const invoiceNo = await getTestNumber();
    if (invoiceNo) {
      setNewTestNo(invoiceNo);     
    } else {
      Toaster.warning("Error in getting Test No.");
    }
  } catch (err) {
    Toaster.error("Failed to load Test No. Please try again.");
  } finally {
     setLoadingTests(false);
  }
}; 
  const getTestNumber = async () => {
    try {
      const response = await getTestNo();
      if (response.data && response.data > 0) {
        return response.data;
      } else {
        Toaster.warning("something went wrong in getting invoice number");
        return null;
      }
    } catch (error) {
      console.error("Error getting invoice number:", error);
      Toaster.error("error in getting invoice number");
      return null;
    }
  };
  const handleTestChange = (testId) => {
    setSelectedTestId(testId);
    const selected = testList.find(test => test.testId === testId);
    if (selected) {
       const trimmedTime = selected.processingTime?.split(':').slice(0, 2).join(':') || '';
      form.setFieldsValue({
        testId,
        testName: selected.testName,
        testAmount: selected.testAmount,
        processingTime: trimmedTime,
        paidAmount: paidAmount || '',
        discount: discount || '',
        description: selected.description || ''
      });
    } else {
      form.resetFields(['testName', 'testAmount', 'processingTime']);
    }
  };

const handleAddOrUpdate = () => {
  form.validateFields(['testId', 'testAmount', 'processingTime', 'description']).then(values => {
    const newItem = {
      testId: values.testId,
      testName: testList.find(t => t.testId === values.testId)?.testName || '',
      testAmount: values.testAmount,
      processingTime: values.processingTime,
      description: values.description,
      key: values.testId
    };

    const existingIndex = cart.findIndex(item => item.testId === values.testId);

    if (editingIndex !== null) {
      const updated = [...cart];
      updated[editingIndex] = newItem;
      setCart(updated);

      const totalAmount = updated.reduce((sum, item) => sum + parseFloat(item.testAmount || 0), 0);

      form1.setFieldsValue({
        totalAmount: totalAmount,
        netAmount: totalAmount - (parseFloat(discount) || 0),
        remaining: totalAmount - (parseFloat(discount) || 0) - (parseFloat(paidAmount) || 0)
      });

      setEditingIndex(null);
    } else if (existingIndex !== -1) {
      Toaster.error('This test is already in the cart.');
      return;
    } else {
      const newCart = [...cart, newItem];
      setCart(newCart);

      const totalAmount = newCart.reduce((sum, item) => sum + parseFloat(item.testAmount || 0), 0);

      form1.setFieldsValue({
        totalAmount: totalAmount,
        netAmount: totalAmount - (parseFloat(discount) || 0),
        remaining: totalAmount - (parseFloat(discount) || 0) - (parseFloat(paidAmount) || 0)
      });
    }

    form.resetFields(['testId', 'testAmount', 'processingTime', 'description']);
    setSelectedTestId(null);
  }).catch(() => {
    Toaster.warning('Please fill required test fields correctly.');
  });
};




  const handleEdit = (record, index) => {
    setEditingIndex(index);
    setSelectedTestId(record.testId);
    form.setFieldsValue(record);
  };

const handleDelete = (index) => {
  const updated = [...cart];
  updated.splice(index, 1);
  setCart(updated);

  // Always reset form if the editing item is deleted
  if (editingIndex === index) {
    form.resetFields(['testId', 'testName', 'testAmount', 'processingTime']);
    setEditingIndex(null);
  }

  // Always update totals after deletion
  const totalAmount = updated.reduce((sum, item) => sum + parseFloat(item.testAmount || 0), 0);

  form1.setFieldsValue({
    totalAmount: totalAmount,
    netAmount: totalAmount - (parseFloat(discount) || 0),
    remaining: totalAmount - (parseFloat(discount) || 0) - (parseFloat(paidAmount) || 0)
  });
};


   
  const columns = [
  {
    title: 'Test Name',
    dataIndex: 'testName',
    key: 'testName',
    render: (text, record) => {
      if (!text && record.testId) {
        const test = testList.find(t => t.testId === record.testId);
        return test ? test.testName : 'Unknown Test';
      }
      return text;
    }
  },
  {
    title: 'Amount (Rs.)',
    dataIndex: 'testAmount',
    key: 'testAmount'
  },
  {
    title: 'Processing Time',
    dataIndex: 'processingTime',
    key: 'processingTime'
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record, index) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => handleEdit(record, index)} />
        <Button icon={<DeleteOutlined />} onClick={() => handleDelete(index)} danger />
      </Space>
    ),
  },
];
const timeStringToMs = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
};


const handleSubmit = async () => {
  try {
     
    if (!patientName) {
      Toaster.error('Please fill in all patient information fields.');
      return;
    }


    if (!cart || cart.length === 0) {
      Toaster.error('Please add at least one test to the cart.');
      return;
    }

    const payableAmount = totalAmount - discount;

    if (paidAmount > payableAmount) {
      Toaster.error('Paid amount cannot be greater than total amount minus discount.');
      return;
    }

    if (remainingAmount > 0) {
      Toaster.error('Remaining amount must be zero before submitting.');
      return;
    }




  const maxProcessingMs = Math.max(
    ...cart.map(item => timeStringToMs(item.processingTime || "00:00:00"))
  );

  const completionDate = new Date(new Date().getTime() + maxProcessingMs);


  const maxCompletionTime = completionDate.toTimeString().split(' ')[0];

    const payload = {
      customerName: patientName,
      contactNo: mobile,
      address: address,
      doctorName: doctorName,
      totalTest: cart.length,
      totalAmount: totalAmount,      
      discount: parseFloat(discount) || 0,
      netAmount: netTotal,
      paidAmount: paidAmount,
       maxCompletionTime: maxCompletionTime,
      remainingAmount: remainingAmount,
      date: new Date().toISOString().slice(0, 10),
      paymentMethodId: 4,
      createdBy: 1,
      TestDetail: cart.map(item => ({
        testId: item.testId,       
        amount: item.testAmount,
        registerTime : new Date().toISOString(),
        completionTime : new Date(new Date().getTime() + (parseInt(item.processingTime) || 0) * 60 * 60 * 1000).toISOString(),
        processingTime: item.processingTime,       
      })),
      createdDate: new Date().toISOString(),
    };

    console.log("Sending payload to API:", payload);

    setLoadingSave(true);

 const response = await addTestRecord(payload);
      if(response.data.status === "Success"){
      fetchTestNo();
    Toaster.success(response.data.message);
      } else {
        Toaster.warning(response.data.message);
      }
      
    // Reset UI
    form1.resetFields();
    setCart([]);
    setDiscount(0);
    setPaidAmount(0);
    setLoadingSave(false);
  } catch (error) {
    console.error(error);
    setLoadingSave(false);

    if (error.errorFields) {
      Toaster.error('Please complete the required fields.');
    } else {
      Toaster.error('An error occurred while submitting the form.');
    }
  }
};

 
const { companyInfo, fetchCompanyInfo } = useCompanyInfo();

 const handlePrint = async () => {
     let company = companyInfo;
      
     
     const newInv = parseInt(newTestNo, 10);
    const invoiceId = newInv - 1;     
     if (!company) {
        company = await fetchCompanyInfo(); 
       if (!company) {
         alert("Company info is not available");
         return;
       }
     }
 
      await TestSlip(invoiceId, company);
   };

  return (
    <Row gutter={24} style={{ margin: 24 }}>
      {/* Left Column */}
      <Col span={16}>
        <Card title={
    <Row justify="space-between" align="middle">
      <Col><h3>Book Laboratory Test</h3></Col>
      <Col>
        <Input
          value={newTestNo}
          disabled
          size="small"
          style={{ width: 130 }}
          prefix="Test No: "
        />
      </Col>
    </Row>
  }

        >
          <Form form={form} layout="vertical">

  
                <Form.Item
                  name="description"   
                  hidden            
                >
                  <Input  />
                </Form.Item>
               

            <Row gutter={[16, 0]}>
              <Col span={6}>
                <Form.Item label="Patient Name">
              <Input
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </Form.Item>
              </Col>
             <Col span={5}>
            <Form.Item label="Mobile Number">
              <Input
                placeholder="03xxxxxxxxx"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </Form.Item>
          </Col>
             <Col span={7}>
            <Form.Item label="Address">
              <Input
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Item>
          </Col>
     <Col span={6}>
            <Form.Item label="Refer by(Dr.)">
              <Input
                placeholder="Doctor Name"
                value={doctorName}
                onChange={(e) => setdoctorName(e.target.value)}
              />
            </Form.Item>
          </Col>
              <Col span={11}>
                <Form.Item
                  name="testId"
                  label="Select Test"
                  rules={[{ required: true, message: 'Select a test' }]}
                >
                  <Select
                    showSearch
                    placeholder="Search test"
                    optionFilterProp="label"
                    value={selectedTestId}
                    onChange={handleTestChange}
                    loading={loadingTests}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    optionLabelProp="label"
                    notFoundContent={loadingTests ? <Spin size="small" /> : 'No tests found'}
                  >
                    {testList.map(test => (
                      <Option
                        key={test.testId}
                        value={test.testId}
                        label={test.testName}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong>{test.testName} - {test.testAmount} </strong>
                          <small style={{ color: '#888' }}>
                            {test.processingTime} - {test.description}
                          </small>
                         
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  name="testAmount"
                  label="Test Amount"
                  rules={[{ required: true, message: 'Enter amount' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="Amount" />
                </Form.Item>
              </Col>

              <Col span={4}>
             <Form.Item
             name="processingTime"
             label="Test Time"
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
<Col span={4}>
  <Form.Item label=" " colon={false} style={{ marginBottom: 0 }}>
    <Button 
      type="default" 
      onClick={handleAddOrUpdate}
      block
    >
      {editingIndex !== null ? 'Update' : 'Add to Cart'}
    </Button>
  </Form.Item>
</Col>


            </Row>
          </Form>

          <Table
            dataSource={cart}
            columns={columns}
            rowKey="testId"
            pagination={false}
            locale={{ emptyText: 'No tests added yet' }}
            style={{ marginTop: 20 }}
          />
        </Card>
      </Col>

      {/* Right Column: Payment Info */}
      <Col span={8}>
  <Card
    title="Payment Information"
    style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    bodyStyle={{ padding: 20 }}
  >
    <Form form={form1} layout="vertical">
  <Row gutter={[16, 16]}>
    <Col span={24}>

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col span={6}><label>Total Amount</label></Col>
        <Col span={18}>
          <Form.Item name="totalAmount" noStyle>
            <Input value={totalAmount.toFixed(2)} disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col span={6}><label>Discount</label></Col>
        <Col span={18}>
          <Form.Item name="discount" noStyle>
            <InputNumber
              min={0}
              value={discount}
              onChange={value => setDiscount(value || 0)}
              placeholder="0.0"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col span={6}><label>Net Amount</label></Col>
        <Col span={18}>
          <Form.Item name="netAmount" noStyle>
            <Input value={netTotal.toFixed(2)} disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col span={6}><label>Paid Amount</label></Col>
        <Col span={18}>
          <Form.Item name="paidAmount" noStyle>
            <InputNumber
              min={0}
              value={paidAmount}
              onChange={value => setPaidAmount(value || 0)}
              style={{ width: '100%' }}
              placeholder="0.0"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col span={6}><label>Remaining</label></Col>
        <Col span={18}>
          <Form.Item name="remaining" noStyle>
            <Input
              value={remainingAmount.toFixed(2)}
              style={{ color: remainingAmount > 0 ? 'red' : 'green' }}
              disabled
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col span={6}><label>Payment Method</label></Col>
        <Col span={18}>
          <Form.Item name="paymentMethodId" noStyle>
            <ReusableDropdown
              data={paymentMethod}
              valueField="paymentMethodId"
              labelField="name"
              placeholder="Select Payment Method"
              loading={loadingPaymentMethod}
              style={{ width: '100%' }}
              defaultOption={false}
              value={form1.getFieldValue("paymentMethodId")}
            />
          </Form.Item>
        </Col>
      </Row>

    </Col>
  </Row>

  <Row gutter={8} style={{ marginTop: 16 }}>
    <Col>
      <Button icon={<PrinterOutlined />} onClick={handlePrint} />
    </Col>
    <Col flex="auto">
      <Button
        key="submit"
        type="primary"
        style={{ width: '100%' }}
        onClick={handleSubmit}
        loading={loadingSave}
        disabled={loadingSave}
      >
        {loadingSave ? <Spin /> : 'Add Record'}
      </Button>
    </Col>
  </Row>
</Form>

  </Card>
</Col>

    </Row>
  );
}
export default BookTest;