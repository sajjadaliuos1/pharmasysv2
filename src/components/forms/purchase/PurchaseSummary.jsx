import React from 'react';
import { Card, Row, Col, Statistic, Divider, Typography } from 'antd';
import dayjs from 'dayjs'; // Import dayjs for date formatting

const { Text } = Typography;

/**
 * Renders a summary card for purchase details, including total value and item count.
 *
 * @param {object} props - The component props.
 * @param {number} props.totalCartValue - The total monetary value of items in the cart.
 * @param {number} props.totalItems - The total number of items in the cart.
 */
const PurchaseSummary = ({ totalCartValue, totalItems }) => {
  return (
    <Col span={24}> {/* Changed span to 24 to make it a full-width card within its parent Col */}
      <Card
        title="Purchase Summary"
        style={{
          marginBottom: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Statistic
              title="Total Purchase Value"
              value={totalCartValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Statistic
              title="Total Items"
              value={totalItems}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text type="secondary">Last Updated</Text>
            <div>{dayjs().format('DD-MM-YYYY HH:mm:ss')}</div>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

export default PurchaseSummary;