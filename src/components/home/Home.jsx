import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Progress, 
  Typography, 
  Space,
  Tag,
  Divider,
  List,
  Avatar
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarCircleOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ExperimentOutlined,
  ShopOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const { Title, Text } = Typography;

const Home = () => {
  // Sample data - replace with your actual data
  const [salesData] = useState([
    { month: 'Jan', sales: 45000, profit: 12000, expenses: 33000 },
    { month: 'Feb', sales: 52000, profit: 15000, expenses: 37000 },
    { month: 'Mar', sales: 48000, profit: 13500, expenses: 34500 },
    { month: 'Apr', sales: 61000, profit: 18000, expenses: 43000 },
    { month: 'May', sales: 58000, profit: 16500, expenses: 41500 },
    { month: 'Jun', sales: 67000, profit: 20000, expenses: 47000 }
  ]);

  const [categoryData] = useState([
    { name: 'Prescription', value: 45, color: '#1890ff' },
    { name: 'OTC Medicine', value: 30, color: '#52c41a' },
    { name: 'Vitamins', value: 15, color: '#faad14' },
    { name: 'Health Products', value: 10, color: '#f5222d' }
  ]);

  const [topProducts] = useState([
    { key: '1', name: 'Paracetamol', sales: 12500, stock: 450, category: 'OTC' },
    { key: '2', name: 'Amoxicillin', sales: 8900, stock: 320, category: 'Prescription' },
    { key: '3', name: 'Vitamin D3', sales: 7800, stock: 280, category: 'Vitamins' },
    { key: '4', name: 'Ibuprofen', sales: 6700, stock: 190, category: 'OTC' },
    { key: '5', name: 'Aspirin', sales: 5400, stock: 380, category: 'OTC' }
  ]);

  const [recentOrders] = useState([
    { key: '1', id: 'ORD-001', customer: 'John Doe', amount: 245.50, status: 'completed' },
    { key: '2', id: 'ORD-002', customer: 'Jane Smith', amount: 89.25, status: 'pending' },
    { key: '3', id: 'ORD-003', customer: 'Mike Johnson', amount: 156.75, status: 'completed' },
    { key: '4', id: 'ORD-004', customer: 'Sarah Wilson', amount: 98.50, status: 'processing' },
    { key: '5', id: 'ORD-005', customer: 'Tom Brown', amount: 312.80, status: 'completed' }
  ]);

  const orderColumns = [
    {
      title: 'Inv no',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Total Items',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Total Amount',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'blue';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  const productColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Amount',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag>{category}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => `$${sales.toLocaleString()}`,
    },
    {
      title: 'Icon',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Progress 
          percent={Math.min((stock / 500) * 100, 100)} 
          showInfo={false} 
          strokeColor={stock > 200 ? '#52c41a' : stock > 100 ? '#faad14' : '#f5222d'}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Pharmacy Dashboard</Title>
        <Text type="secondary">Monitor your pharmacy's performance and analytics</Text>
      </div>

      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
           <Card>
            <Statistic
              title="Total Sales"
              value={67000}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarCircleOutlined />}
            />
            <Text type="secondary">Last six months sales record</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Profit"
              value={20000}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TrophyOutlined />}
             
            />
            <Text type="secondary">Last six months profit record</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Expenses"
              value={47000}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarCircleOutlined />}
              
            />
            <Text type="secondary">Last six months expenses record</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
           <Card>
            <Statistic
              title="Lab Amount"
              value={8500}
              precision={0}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<ExperimentOutlined />}
              
            />
            <Text type="secondary">Last six months L.Amount record</Text>
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Suppliers"
              value={45}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<TeamOutlined />}
              suffix={<ArrowUpOutlined style={{ color: '#3f8600' }} />}
            />
            <Text type="secondary">+2.1% from last month</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
        <Card>
            <Statistic
              title="Total Customers"
              value={1234}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
              suffix={<ArrowUpOutlined style={{ color: '#3f8600' }} />}
            />
            <Text type="secondary">+5.7% from last month</Text>
          </Card>
         
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Active Orders"
              value={89}
              valueStyle={{ color: '#eb2f96' }}
              prefix={<ShoppingCartOutlined />}
              suffix={<ArrowUpOutlined style={{ color: '#3f8600' }} />}
            />
            <Text type="secondary">+18.5% from last month</Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Sales & Profit Chart */}
        <Col xs={24} lg={12}>
          <Card title="Sales & Profit Trends">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#1890ff" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" stroke="#52c41a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Category Distribution */}
        <Col xs={24} lg={12}>
          <Card title="Six Months Expenses Record">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Revenue vs Expenses Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <Card title="Sales & Profit Trends">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="sales" fill="#1890ff" />
                <Bar dataKey="expenses" fill="#f5222d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Tables Section */}
      <Row gutter={[16, 16]}>
        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card title="Payment Methods">
            <Table 
              columns={productColumns} 
              dataSource={topProducts} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} lg={12}>
          <Card title="Recent Orders">
            <Table 
              columns={orderColumns} 
              dataSource={recentOrders} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;