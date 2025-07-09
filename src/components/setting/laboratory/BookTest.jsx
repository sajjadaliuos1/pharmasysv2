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
import { getTests } from '../../../api/API';
import { EditOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import { Toaster } from '../../common/Toaster';

const { Option } = Select;

export default function BookTest() {
  const [form] = Form.useForm();
  const [testList, setTestList] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [cart, setCart] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);
  
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
    };

    fetchTests();
  }, []);

  const handleTestChange = (testId) => {
    setSelectedTestId(testId);
    const selected = testList.find(test => test.testId === testId);
    if (selected) {
      form.setFieldsValue({
        testId,
        testName: selected.testName,
        testAmount: selected.testAmount,
        processingTime: selected.processingTime,
        paidAmount: paidAmount || '',
        discount: discount || ''
      });
    } else {
      form.resetFields(['testName', 'testAmount', 'processingTime']);
    }
  };

  const handleAddOrUpdate = () => {
    form.validateFields().then(values => {
      const newItem = {
        ...values,
        key: values.testId
      };

      const existingIndex = cart.findIndex(item => item.testId === values.testId);

      if (editingIndex !== null) {
        const updated = [...cart];
        updated[editingIndex] = newItem;
        setCart(updated);
        setEditingIndex(null);
      } else if (existingIndex !== -1) {
        Toaster.error('This test is already in the cart.');
        return;
      } else {
        setCart([...cart, newItem]);
      }

      form.resetFields(['testId', 'testName', 'testAmount', 'processingTime']);
      setSelectedTestId(null);
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
    if (editingIndex === index) {
      form.resetFields(['testId', 'testName', 'testAmount', 'processingTime']);
      setEditingIndex(null);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + parseFloat(item.testAmount || 0), 0);
  const netTotal = totalAmount - parseFloat(discount || 0);
  const remainingAmount = netTotal - parseFloat(paidAmount || 0);

  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'testName',
      key: 'testName',
      render: (text, record) => {
        // Fallback to find test name from testList if not in record
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Row gutter={24} style={{ margin: 24 }}>
      {/* Left Column */}
      <Col span={16}>
        <Card
          title="Book Laboratory Test"
          style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          bodyStyle={{ padding: 20 }}
        >
          <Form form={form} layout="vertical">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item
                  name="patientName"
                  label="Patient Name"
                  rules={[{ required: true, message: 'Enter patient name' }]}
                >
                  <Input placeholder="Enter patient name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="mobile"
                  label="Mobile Number"
                  rules={[
                    { required: true, message: 'Enter mobile number' },
                    { pattern: /^[0-9]{10,15}$/, message: 'Invalid phone number' },
                  ]}
                >
                  <Input placeholder="03xxxxxxxxx" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: 'Enter address' }]}
                >
                  <Input placeholder="Enter address" />
                </Form.Item>
              </Col>

              <Col span={12}>
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
                          <strong>{test.testName}</strong>
                          <small style={{ color: '#888' }}>
                            Rs:{test.testAmount} | {test.processingTime}
                          </small>
                          <div style={{ fontSize: 12, color: '#999' }}>{test.description}</div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="testAmount"
                  label="Test Amount"
                  rules={[{ required: true, message: 'Enter amount' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="Amount" />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="processingTime"
                  label="Processing Time"
                  rules={[{ required: true, message: 'Enter time' }]}
                >
                  <Input placeholder="e.g. 1 hour" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                  <Button 
                    type="primary" 
                    onClick={handleAddOrUpdate}
                    style={{ 
                      marginTop: 8,
                      minWidth: 120
                    }}
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
          <Form layout="vertical">
            <Form.Item label="Total Amount">
              <Input value={totalAmount.toFixed(2)} disabled />
            </Form.Item>

            <Form.Item label="Discount">
              <InputNumber
                min={0}
                value={discount}
                onChange={value => setDiscount(value || 0)}
                style={{ width: '100%' }}
                placeholder="0.0"
                defaultValue={0}
              />
            </Form.Item>

            <Form.Item label="Paid Amount">
              <InputNumber
                min={0}
                value={paidAmount}
                onChange={value => setPaidAmount(value || 0)}
                style={{ width: '100%' }}
                placeholder="0.0"
                defaultValue={0}
              />
            </Form.Item>

            <Form.Item label="Remaining Amount">
              <Input
                value={remainingAmount.toFixed(2)}
                style={{ color: remainingAmount > 0 ? 'red' : 'green' }}
                disabled
              />
            </Form.Item>

            <Row gutter={8}>
              <Col>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                />
              </Col>
              <Col flex="auto">
                <Button 
                  key="submit"
                  type="primary"
                  style={{ width: '100%' }}
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