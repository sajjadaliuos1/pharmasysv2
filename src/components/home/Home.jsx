import React, { useState, useEffect } from 'react';
 
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
import { getDashbordData } from '../../api/API';

const { Title, Text } = Typography;

const Home = () => {
  // State variables with proper initialization
  const [salesData, setSalesData] = useState([]);
  const [topPaymentMethod, setTopPaymentMethod] = useState([]);
  const [sixMonthExpenseRecord, setSixMonthExpenseRecord] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  // Initialize with 0 instead of arrays
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  
  // Initialize with 0 instead of arrays
  const [activeOrders, setActiveOrders] = useState(0);
  const [totalSupplier, setTotalSuppliers] = useState(0);
  const [totalCustomer, setTotalCustomers] = useState(0);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to format date from "2025 06" to "2025 June"
  const formatMonthYear = (monthYear) => {
    if (!monthYear) return 'N/A';
    
    const [year, month] = monthYear.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthIndex = parseInt(month) - 1;
    const monthName = monthNames[monthIndex] || month;
    
    return `${monthName} ${year}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashbordData();
        const data = response.data;

        console.log('API Response:', data); // Debug log

        // 1. Sales + Profit
        const sales = data.salesProfits?.map(item => ({
          month: formatMonthYear(item.month),
          sales: item.totalSales || 0,
          profit: item.totalProfit || 0
        })) || [];
        setSalesData(sales);

        const totalSalesAmount = sales.reduce((acc, curr) => acc + curr.sales, 0);
        const totalProfitAmount = sales.reduce((acc, curr) => acc + curr.profit, 0);
        
        setTotalSales(totalSalesAmount);
        setTotalProfit(totalProfitAmount);

        // 2. Top Payment Methods - Fixed data mapping
        const payments = data.paymentMethods?.map((item, index) => ({
          key: index + 1,
          name: item.name || 'N/A',
          amountIn: item.amountIn || 0,
          amountOut: item.amountOut || 0,
          remaining: (item.amountIn || 0) - (item.amountOut || 0),
          stock: item.stock || Math.floor(Math.random() * 500) // Random stock for progress bar
        })) || [];
        setTopPaymentMethod(payments);

        // 3. Six Month Expense Record
        const expenses = data.expenses?.map(item => ({
          name: formatMonthYear(item.month),
          value: item.totalExpenses || 0,
          color: getRandomColor()
        })) || [];
        setSixMonthExpenseRecord(expenses);

        const totalExpensesAmount = expenses.reduce((sum, item) => sum + item.value, 0);
        setTotalExpense(totalExpensesAmount);

        // 4. Recent Orders - Fixed data mapping
        const orders = data.recentSales?.map((item, index) => ({
          key: index + 1,
          id: item.invoiceNo || `INV-${index + 1}`,
          customer: item.customerName || item.customer || 'N/A',
          totalAmount: item.TotalAmount || item.totalAmount || 0,
          paidAmount: item.paidAmount || item.PaidAmount || 0,
          remainingAmount: (item.TotalAmount || item.totalAmount || 0) - (item.paidAmount || item.PaidAmount || 0),
          status: item.status || 'completed'
        })) || [];
        setRecentOrders(orders);

        console.log('Processed Orders:', orders); // Debug log

        // Summary data with fallbacks
        setActiveOrders(data.summary?.activeOrders || 0);
        setTotalSuppliers(data.summary?.totalSuppliers || 0);
        setTotalCustomers(data.summary?.totalCustomers || 0);
        
        setError(null);
      } catch (error) {
        console.error('Dashboard data fetch failed:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRandomColor = () => {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#13c2c2', '#722ed1'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Fixed order table columns
  const orderColumns = [
  {
    title: 'Invoice No',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Total Amount',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    render: (totalAmount) => `${(totalAmount || 0).toLocaleString()}`,
  },
  {
    title: 'Paid Amount',
    dataIndex: 'paidAmount',
    key: 'paidAmount',
    render: (paidAmount) => `${(paidAmount || 0).toLocaleString()}`,
  },
  {
    title: 'Remaining Amount',
    dataIndex: 'remainingAmount',
    key: 'remainingAmount',
    render: (remainingAmount) => {
      const amount = Number(remainingAmount) || 0;
      const color = amount < 0 ? 'green' : amount >= 0 ? 'red' : 'black';

      return (
        <span style={{ color }}>
          {amount.toLocaleString()}
        </span>
      );
    },
  },
];


  // Fixed payment method table columns
  const paymentColumns = [
    {
      title: 'Payment Method',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Amount In',
      dataIndex: 'amountIn',
      key: 'amountIn',
      render: (amountIn) => `${(amountIn || 0).toLocaleString()}`,
    },
    {
      title: 'Amount Out',
      dataIndex: 'amountOut',
      key: 'amountOut',
      render: (amountOut) => `${(amountOut || 0).toLocaleString()}`,
    },
    {
      title: 'Remaining Balance',
      dataIndex: 'remaining',
      key: 'remaining',
       render: (remaining) => `${(remaining || 0).toLocaleString()}`,
     
    },
   
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text>Loading dashboard data...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Pharmacy Dashboard</Title>
        <Text type="secondary">Monitor your pharmacy's performance and analytics</Text>
      </div>

      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Card>
            <Statistic
              title="Total Sales"
              value={totalSales}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarCircleOutlined />}
            />
            <Text type="secondary">Last six months sales record</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Card>
            <Statistic
              title="Total Profit"
              value={totalProfit}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TrophyOutlined />}
            />
            <Text type="secondary">Last six months profit record</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Card>
            <Statistic
              title="Total Expenses"
              value={totalExpense}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarCircleOutlined />}
            />
            <Text type="secondary">Last six months expenses record</Text>
          </Card>
        </Col>
        {/* <Col xs={24} sm={12} md={8} lg={6}>
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
        </Col> */}
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Suppliers"
              value={totalSupplier}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<TeamOutlined />}
            />
            <Text type="secondary">Total Suppliers record</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Customers"
              value={totalCustomer}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
            />
            <Text type="secondary">Total Customers record</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Active Orders"
              value={activeOrders}
              valueStyle={{ color: '#eb2f96' }}
              prefix={<ShoppingCartOutlined />}
            />
            <Text type="secondary">Total Active orders record</Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Sales & Profit Line Chart */}
        <Col xs={24} lg={12}>
          <Card title="Sales & Profit Trends">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#1890ff" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" stroke="#52c41a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Expense Distribution Pie Chart */}
        <Col xs={24} lg={12}>
          <Card title="Six Months Expenses Record">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sixMonthExpenseRecord}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sixMonthExpenseRecord.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Sales & Profit Bar Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <Card title="Sales & Profit Bar Chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="sales" fill="#1890ff" />
                <Bar dataKey="profit" fill="#f5222d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Tables Section */}
      <Row gutter={[16, 16]}>
        {/* Payment Methods Table */}
        <Col xs={24} lg={12}>
          <Card title="Payment Methods">
            <Table 
              columns={paymentColumns} 
              dataSource={topPaymentMethod} 
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>

        {/* Recent Orders Table */}
        <Col xs={24} lg={12}>
          <Card title="Recent Orders">
            <Table 
              columns={orderColumns} 
              dataSource={recentOrders} 
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;