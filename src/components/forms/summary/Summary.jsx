import React, { useState } from 'react';
import { getSaleProfit, getExpenseAmount , getLabAmount, getNicuAmount , getSupplierArrear, getCustomerArrear, getPaymentMethodAmount} from '../../../api/API'; 
import { 
  Card, 
  DatePicker, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Space,
  Divider,
  Spin,
  message
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ExperimentOutlined,
  HeartOutlined,
  UserOutlined,
  CreditCardOutlined,
  TeamOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const Summary = () => {
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState({});
  const [data, setData] = useState({
    sales: null,
    expense: null,
    laboratory: null,
    nicu: null,
    supplierArrears: null,
    customerArrears: null,
    paymentMethods: null
  });

  const handleDateChange = (dates) => {
    setDateRange(dates);
    // Reset all data when date range changes
    setData({
      sales: null,
      expense: null,
      laboratory: null,
      nicu: null,
      supplierArrears: null,
      customerArrears: null,
      paymentMethods: null
    });
  };

  const fetchData = async (type, apiFunction, requiresDate = true) => {
     if (!apiFunction) {
      message.error(`API function for ${type} is not implemented yet`);
      return;
    }

    if (requiresDate && (!dateRange || dateRange.length !== 2)) {
      message.warning('Please select a date range first');
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      let result;
      if (requiresDate) {
        result = await apiFunction(
          dateRange[0].format('YYYY-MM-DD'),
          dateRange[1].format('YYYY-MM-DD')
        );
      } else {
        result = await apiFunction();
      }
      
      setData(prev => ({ ...prev, [type]: result.data || result }));
      message.success(`${type} data loaded successfully`);
    } catch (error) {
      message.error(`Failed to load ${type} data`);
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    height: '100%'
  };

  const buttonStyle = {
    borderRadius: 8,
    fontWeight: 500
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        
        <Card style={{ ...cardStyle, marginBottom: '24px' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={4} style={{ margin: 0, color: '#595959' }}>
                  Business Summary Dashboard
              </Title>
            </Col>
            <Col>
              <RangePicker
                size="large"
                onChange={handleDateChange}
                placeholder={['From Date', 'To Date']}
                style={{ borderRadius: 8 }}
              />
            </Col>
          </Row>
        </Card>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sales & Profit Card */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={cardStyle}
            hoverable
            actions={[
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading.sales}
                onClick={() => {fetchData('sales', getSaleProfit); console.log('Fetching sales data', data.sales ) }}
                style={buttonStyle}
              >
                Load Sales Data
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<DollarOutlined style={{ fontSize: 32, color: '#52c41a' }} />}
              title="Sales & Profit"
            //   //description="Revenue and profit analysis"
            />
            <Divider />
            {data.sales ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Total Sales"
                    value={data.sales.amount}
                    prefix=""
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Profit"
                    value={data.sales.profit}
                    prefix=""
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            ) : (
              <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
                Click button to load data
              </div>
            )}
          </Card>
        </Col>

        {/* Expense Card */}
        <Col xs={24} sm={12} lg={5}>
          <Card
            style={cardStyle}
            hoverable
            actions={[
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading.expense}
                onClick={() => fetchData('expense', getExpenseAmount)}
                style={buttonStyle}
              >
                Load Expense Data
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<ShoppingCartOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />}
              title="Expenses"
            //   //description="Total expenses overview"
            />
            <Divider />
            {data.expense ? (
              <Statistic
                title="Total Expenses"
                value={data.expense}
                prefix=""
                valueStyle={{ color: '#ff4d4f' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
                Click button to load data
              </div>
            )}
          </Card>
        </Col>

        {/* Laboratory Card */}
        <Col xs={24} sm={12} lg={5}>
          <Card
            style={cardStyle}
            hoverable
            actions={[
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading.laboratory}
                onClick={() => fetchData('laboratory', getLabAmount)}
                style={buttonStyle}
              >
                Load Lab Data
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<ExperimentOutlined style={{ fontSize: 32, color: '#722ed1' }} />}
              title="Laboratory"
              //description="Lab tests and revenue"
            />
            <Divider />
            {data.laboratory ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Revenue"
                    value={data.laboratory}
                    prefix=""
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            ) : (
              <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
                Click button to load data
              </div>
            )}
          </Card>
        </Col>

        {/* NICU Card */}
        <Col xs={24} sm={12} lg={5}>
          <Card
            style={cardStyle}
            hoverable
            actions={[
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading.nicu}
                onClick={() => fetchData('nicu', getNicuAmount)}
                style={buttonStyle}
              >
                Load NICU Data
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<HeartOutlined style={{ fontSize: 32, color: '#eb2f96' }} />}
              title="NICU"
              //description="Neonatal intensive care unit"
            />
            <Divider />
            {data.nicu ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Revenue"
                    value={data.nicu}
                    prefix=""
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            ) : (
              <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
                Click button to load data
              </div>
            )}
          </Card>
        </Col>
</Row>
   <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {/* Supplier Arrears Card */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={cardStyle}
            hoverable
            actions={[
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading.supplierArrears}
                onClick={() => fetchData('supplierArrears', getSupplierArrear, false)}
                style={buttonStyle}
              >
                Load Supplier Arrears
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<TeamOutlined style={{ fontSize: 32, color: '#fa8c16' }} />}
              title="Supplier Arrears"
              //description="Outstanding supplier payments"
            />
            <Divider />
            {data.supplierArrears ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic                            
                    title="Total Arrears"
                    prefix=""
                    value={data.supplierArrears}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
              </Row>
            ) : (
              <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
                Click button to load data
              </div>
            )}
          </Card>
        </Col>

        {/* Customer Arrears Card */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={cardStyle}
            hoverable
            actions={[
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading.customerArrears}
                onClick={() => fetchData('customerArrears', getCustomerArrear, false)}
                style={buttonStyle}
              >
                Load Customer Arrears
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<UserOutlined style={{ fontSize: 32, color: '#13c2c2' }} />}
              title="Customer Arrears"
              //description="Outstanding customer payments"
            />
            <Divider />
            {data.customerArrears ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Total Arrears"
                    value={data.customerArrears}
                    prefix=""
                    valueStyle={{ color: '#13c2c2' }}
                  />
                </Col>
              </Row>
            ) : (
              <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
                Click button to load data
              </div>
            )}
          </Card>
        </Col>

        {/* Payment Methods Card */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={cardStyle}
            hoverable
            actions={[
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading.paymentMethods}
                onClick={() => fetchData('paymentMethods', getPaymentMethodAmount, false)}
                style={buttonStyle}
              >
                Load Payment Data
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<CreditCardOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
              title="Payment Methods"
              //description="Payment breakdown by method"
            />
            <Divider />
            {data.paymentMethods ? (
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="Cash"
                    value={data.paymentMethods}
                    prefix=""
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            ) : (
              <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
                Click button to load data
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Summary;