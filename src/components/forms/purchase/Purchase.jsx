// Purchase.jsx
import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Modal,
  message,
  Divider,
  Form
} from 'antd';

import PurchaseItem from './PurchaseItem';


const { Content } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

const Purchase = () => {
  // State
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalCartValue, setTotalCartValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [purchaseForm] = Form.useForm(); // Form instance for overall purchase

  
  useEffect(() => {
    setLoading(true);
         setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

 
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.finalPurchaseRate * item.quantity);
    }, 0);
    setTotalCartValue(total);
  }, [cartItems]);

 


  const handleSavePurchase = () => {
    if (cartItems.length === 0) {
      message.warning('Please add at least one item to complete the purchase');
      return;
    }

    // Get overall purchase details from the form
    purchaseForm.validateFields().then(values => {
      const purchaseData = {
        supplier: selectedSupplier,
        items: cartItems,
        totalAmount: totalCartValue,
        discount: values.overallDiscount || 0,
        finalAmount: totalCartValue * (1 - (values.overallDiscount || 0) / 100),
        paymentDetails: {
          paymentMethod: values.paymentMethod,
          paidAmount: values.paidAmount || 0,
        },
        purchaseDate: values.purchaseDate,
        notes: values.notes
      };

      message.loading('Saving purchase...');
      console.log("Purchase data being saved:", purchaseData);

      // Simulate API call
      setTimeout(() => {
        message.success('Purchase saved successfully');
        setCartItems([]);
        setSelectedSupplier(null);
        purchaseForm.resetFields();
      }, 1000);
    }).catch(info => {
      message.error('Please complete all required fields');
    });
  };

  // Helper function to calculate final rates with discount
  

  return (
    <Layout className="site-layout">
      <Content style={{ margin: '24px 16px', padding: 24, minHeight: '80vh' }}>
        <Title level={2}>Purchase Management</Title>
        <Divider />

         
          <div style={{ marginBottom: '20px' }}>
            <PurchaseItem
              products={products}
              editMode={editMode}
              initialValues={currentItem}
              totalCartValue={totalCartValue}
              totalItems={cartItems.length}
              suppliers={suppliers}
              setSelectedSupplier={setSelectedSupplier}
            />
          </div>

          {/* Main content area with table and summary side by side */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Left side - Purchase List (ag-grid table) 
            <div style={{ flex: '3' }}>
              <PurchaseList
                cartItems={cartItems}
                loading={loading}
                error={null}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
              />
            </div>*/}
            
            {/* Right side - Purchase Summary 
            <div style={{ flex: '1' }}>
              <PurchaseSummary 
                totalCartValue={totalCartValue}
                totalItems={cartItems.length}
                supplier={selectedSupplier}
                form={purchaseForm}
              />
            </div> */}
          </div>
          
          {/* Action buttons 
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="large"
                onClick={handleSavePurchase}
                disabled={cartItems.length === 0}
              >
                Save Purchase
              </Button>
              <Button
                type="default"
                icon={<PrinterOutlined />}
                size="large"
                disabled={cartItems.length === 0}
              >
                Print Receipt
              </Button>
            </Space>
          </div>*/}
       
      </Content>
    </Layout>
  );
};

export default Purchase;