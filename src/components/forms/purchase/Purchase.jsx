// // Purchase.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Layout,
//   Typography,
//   Modal,
//   message,
//   Divider,
//   Form
// } from 'antd';

// import PurchaseItem from './PurchaseItem';


// const { Content } = Layout;
// const { Title } = Typography;
// const { confirm } = Modal;

// const Purchase = () => {
//   // State
//   const [products, setProducts] = useState([]);
//   const [cartItems, setCartItems] = useState([]);
//   const [totalCartValue, setTotalCartValue] = useState(0);
//   const [editMode, setEditMode] = useState(false);
//   const [currentItem, setCurrentItem] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [suppliers, setSuppliers] = useState([]);
//   const [selectedSupplier, setSelectedSupplier] = useState(null);
//   const [purchaseForm] = Form.useForm(); 

  
//   useEffect(() => {
//     setLoading(true);
//          setTimeout(() => {
//       setLoading(false);
//     }, 500);
//   }, []);

 
//   useEffect(() => {
//     const total = cartItems.reduce((sum, item) => {
//       return sum + (item.finalPurchaseRate * item.quantity);
//     }, 0);
//     setTotalCartValue(total);
//   }, [cartItems]);

 
 
//   return (
//     <Layout className="site-layout">
//       <Content style={{ margin: '24px 16px', padding: 24, minHeight: '80vh' }}>
//         <Title level={2}>Purchase Management</Title>
//         <Divider />

         
//           <div style={{ marginBottom: '20px' }}>
//             <PurchaseItem
//               products={products}
//               editMode={editMode}
//               initialValues={currentItem}
//               totalCartValue={totalCartValue}
//               totalItems={cartItems.length}
//               suppliers={suppliers}
//               setSelectedSupplier={setSelectedSupplier}
//             />
//           </div>

         
     
//       </Content>
//     </Layout>
//   );
// };

// export default Purchase;