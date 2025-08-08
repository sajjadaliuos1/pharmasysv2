import React from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const SellerHome = () => {
  const metrics = [
    {
      title: 'Total Sales',
      value: 'PKR 150,000',
      icon: <DollarOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
    },
    {
      title: 'Orders',
      value: '128',
      icon: <ShoppingCartOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
    },
    {
      title: 'Products',
      value: '54',
      icon: <ShoppingOutlined style={{ fontSize: 48, color: '#faad14' }} />,
    },
  ];

  return (
    <Layout style={{ minHeight: '80vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px' }}>
        <Title level={3} style={{ margin: 0 }}>Seller Dashboard</Title>
      </Header>

      <Content style={{ padding: '16px' }}>
        <Row gutter={16} style={{ height: 'calc(60vh - 90px)' }}>
          {metrics.map((item, index) => (
            <Col span={8} key={index}>
              <Card
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
                bodyStyle={{ padding: 32 }}
              >
                <div>{item.icon}</div>
                <Title level={4} style={{ marginTop: 16 }}>{item.title}</Title>
                <Title level={2}>{item.value}</Title>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default SellerHome;
