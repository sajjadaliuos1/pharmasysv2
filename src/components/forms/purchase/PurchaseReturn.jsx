import { useState, useEffect  } from 'react';
 
import {
  Card,  Table,  Form,  Input,  Button,   InputNumber,  Row,  Col,  
} from 'antd';
import ReusableDropdown from '../../common/ReusableDropdown';  
import useUserId from '../../../hooks/useUserId';
import {  getPurchaseReturnItems,getPayment, returnPurchase } from '../../../api/API';  
import { Toaster } from '../../common/Toaster';



const PurchaseReturn = () => {
  const userId = useUserId();
  const [form1] = Form.useForm();
  const [formSearch] = Form.useForm();
 
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [cartItems, setCartItems] = useState([]);  
 
  const [totalReturnAmount, setTotalReturnAmount] = useState(0);

  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [paymentMethodMap, setPaymentMethodMap] = useState(new Map());
  const [paymentMethodRemainingAmount, setPaymentMethodRemainingAmount] = useState('');
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  

  useEffect(() => {   
     fetchPaymentMethod();
  recalculateAmounts(form1, totalReturnAmount);
  }, [totalReturnAmount]);


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
       setPaymentMethodRemainingAmount(firstPaymentMethod?.remaining || '');
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
  const handleSearch = async () => {
    try {
      setTotalReturnAmount(0);     
      const formData = await formSearch.validateFields();
      const invoiceNo = parseInt(formData.search, 10);

      if (isNaN(invoiceNo)) {
          Toaster.error('Invalid invoice number');
          return;
       }
    setLoadingSearch(true);
    const result = await getPurchaseReturnItems(invoiceNo);    

    if (!result.data || result.data.status !== "Success") {
       setLoadingSearch(false);
      form1.resetFields();
      setCartItems([]);
      Toaster.error("No record found for this invoice number.");
      return;
    }
    console.log("Search Record:", result.data);

    const saleData = result.data.data;
   
    form1.setFieldsValue({
      invoiceNo: saleData.invoiceNo,
      supplierId: saleData.supplierId,
      supplierName: saleData.supplierName,
      supplierRemaining: saleData.remaining,
      remainingAmount: saleData.remaining
    });
  
  
    const purchaseDetails = Array.isArray(saleData.purchaseDetails) ? saleData.purchaseDetails : [];
    const mappedTableData = purchaseDetails.filter(item => item.remainingQuantity !== 0).map((item, index) => ({
      key: index,      
      productId: item.productId,
      purchaseInventoryId: item.purchaseInventoryId,     
      productName: item.productName,      
      finalPurchaseRate: item.finalPurchaseRate,      
      remainingQuantity: item.remainingQuantity,        
      finalAmount: item.netAmount,
      quantity: item.remainingQuantity,                 
      saleRate: item.finalPurchaseRate,                     
      returnQty: 0,        
    }));

    setCartItems(mappedTableData); 
    Toaster.success("Record loaded successfully");
    setLoadingSearch(false);
  } catch (error) {
     setLoadingSearch(false);
    console.error("Error submitting form:", error);
    Toaster.warning("Please fill all required fields.");
  }
};
const columns = [
 
  { title: 'Product', dataIndex: 'productName' },

  { title: 'Final Rate', dataIndex: 'finalPurchaseRate' },
  { title: 'Qty', dataIndex: 'remainingQuantity' },
  {
    title: 'Return Qty',
    dataIndex: 'returnQty',
    render: (value, record, index) => (
      <input
        type="number"
        min="0"
        step="1"
        max={record.remainingQuantity}
        value={record.returnQty || ''}
        onChange={(e) => handleReturnQtyChange(e.target.value, index, record.remainingQuantity)}
        style={{ width: '100%', textAlign: 'right' }}
      />
    )
  },

  {
    title: 'Return Amount',
    dataIndex: 'returnAmount',
    render: (_, record) => {
      const qty = parseInt(record.returnQty || 0);
      const rate = parseFloat(record.finalPurchaseRate || 0);
      const amount = qty * rate;
      return `Rs. ${amount.toFixed(2)}`;
    }
  },
  
];

const handleReturnQtyChange = (value, index, maxQty) => {
  const updatedItems = [...cartItems];
  let intVal = parseInt(value || 0);

  if (isNaN(intVal) || intVal < 0) {
    intVal = 0;
  }

  if (intVal > maxQty) {
    intVal = maxQty;
    Toaster.warning('Return quantity cannot be greater than sale quantity');
  }

  updatedItems[index].returnQty = intVal;
   
  setCartItems(updatedItems);

  // Calculate totals
  const totalReturnAmount = updatedItems.reduce((sum, item) => {
    const qty = parseInt(item.returnQty || 0);
    const rate = parseFloat(item.finalPurchaseRate || 0);
    return sum + qty * rate;
  }, 0);

  setTotalReturnAmount(totalReturnAmount);
   
  recalculateAmounts(form1, totalReturnAmount);
};


const recalculateAmounts = (form, totalReturnAmount) => {
  const { supplierRemaining } = form.getFieldsValue();

  const supplierOld = parseFloat(supplierRemaining || 0);
  const remaining = supplierOld - totalReturnAmount;

  const fieldsToSet = {
    remainingAmount: remaining.toFixed(2)
  };

  form.setFieldsValue(fieldsToSet);
  if (remaining < 0 )
     setShowPaymentMethod(true);
    else
       setShowPaymentMethod(false);
};

const handleSubmit = async () => {
  try {
    const formData = await form1.validateFields();
    const supplierId = formData.supplierId;
    if (!supplierId) {
      Toaster.error("Please select a Supplier");
      return;
    }

    const returnItems = cartItems.filter(
      (item) => parseInt(item.returnQty || 0) > 0
    );

    if (returnItems.length === 0) {
      Toaster.warning("Please specify return quantity for at least one item");
      return;
    }

    const invalidItems = returnItems.filter((item) => {
      return (
        !item.purchaseInventoryId ||
        !item.returnQty ||
        isNaN(parseInt(item.returnQty)) ||
        parseInt(item.returnQty) <= 0 ||
        parseInt(item.returnQty) > parseInt(item.remainingQuantity)
      );
    });

    if (invalidItems.length > 0) {
      Toaster.error("Some return items have invalid data. Please check return quantities.");
      return;
    }

    const returnDetails = returnItems.map((item) => ({
      purchaseInventoryId: item.purchaseInventoryId,
      productId: item.productId,
      returnQuantity: parseInt(item.returnQty),
      returnAmount: parseInt(item.returnQty) * parseFloat(item.finalPurchaseRate),
      finalPurchaseRate: parseFloat(item.finalPurchaseRate),      
    }));

    const payload = {
      ...formData,
      supplierId,
      invoiceNo: parseInt(formData.invoiceNo, 10),
      returnItem: returnItems.length,
      supplierOldAmount : parseFloat(formData.supplierRemaining || 0),
      returnItemAmount: totalReturnAmount,
      remaining: parseFloat(formData.remainingAmount || 0),
      paymentMethodId: showPaymentMethod ? formData.paymentMethodId : 0,
      createdBy: userId,
      returnDetails,
    };

    await returnPurchase(payload);  

    Toaster.success("Supplier return processed successfully.");
    form1.resetFields();
    formSearch.resetFields();
    showPaymentMethod(false);
    fetchPaymentMethod(); 
    setCartItems([]);
    setTotalReturnAmount(0);
  } catch (error) {
    
    setLoadingSave(false);
    console.error("Submission error:", error);
    if (error.errorFields) {
      Toaster.warning("Please fill all required fields correctly");
    } else {
      Toaster.error("An error occurred while processing the return");
    }
  }
};

 

  return (
   <Row gutter={[8, 0]} style={{ marginLeft: 0, marginRight: 0 }}>
      <Col span={18}>
        <Card
  title={
    <div style={{ display: 'flex', fontSize:'30px', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
  
  <span style={{ fontWeight: 500 }}>
  Return Purchase
  </span>
  
</div>

  }
  style={{
    marginBottom: '0px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
  }}
  bodyStyle={{ padding: '5px 15px 0 15px' }} 
  >
 


<Form
form={formSearch}
 onFinish={handleSearch}
 layout="vertical"
            name="search_form">
                <Row gutter={[16, 0]} style={{ marginBottom: '16px' }}>
  <Col span={18}>
    <Form.Item
      name="search"
      label="Search Record by Invoice No"
      rules={[{ required: true, message: 'Please enter invoice number' }]}
    >
      <Input type="number" placeholder="Enter Invoice Number" />
    </Form.Item>
  </Col>
  <Col span={6} style={{ display: 'flex', alignItems: 'center' }}>
    <Button 
      type="primary" 
      htmlType="button" 
      style={{ width: '100%' }} 
      onClick={handleSearch}  
      loading={loadingSearch}
      disabled={loadingSearch}
    >
      Search Record
    </Button>
  </Col>
</Row>
            </Form>
 
           <Row gutter={[16, 16]}>
          <Col span={24}>    
<Table
  dataSource={cartItems}
  rowKey={(record, index) => index}
  pagination={false}
  footer={() => {
    
    return (
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '8px',
        borderTop: '1px solid #e0e0e0',
        fontSize: '15px',
      }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',          
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          <span>Return Amount:</span>
          <span>Rs. {totalReturnAmount.toFixed(2)}</span>
        </div>
       
        
      </div>
    );
  }}
  bordered
  columns={columns} 
  scroll={{ x: 'max-content' }}
  locale={{
    emptyText: (
      <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', 
      justifyContent: 'center' }}>
      No items in cart
      </div>
    ),
  }}
>
</Table>
</Col>
 
</Row>
        </Card>
       
      
      </Col>
      <Col span={6}>
<Card
  title={
    <div style={{ display: 'flex', fontSize:'20px', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
  
  <span style={{ fontWeight: 500 }}>
   Payment Information
  </span>    
</div>
}
  style={{
    marginBottom: '0px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
    //  body: { padding: '5px' }
  }}
   bodyStyle={{ padding: '5px' }} //@deprecated — khoda lapasa na apply kege zaka me haga comment karay dy
  >

<Form
  form={form1}
  layout="vertical"
  initialValues={{

  }}
>
  <Form.Item name="invoiceNo" hidden>
    <Input />
  </Form.Item>
    <Form.Item name="supplierId" hidden>
    <Input />
  </Form.Item>

  <Row gutter={[10, 0]}>
    <Col span={24}>
      <Form.Item
        name="supplierName"
        label="Supplier Name"
        rules={[{ required: true, message: 'Supplier Name required' }]}
      style={{ marginBottom: 0 }}>
        <Input disabled placeholder="Supplier Name" />
      </Form.Item>
    </Col>

    

    <Col span={24}>
      <Form.Item
        name="supplierRemaining"
        label="Supplier Old Amount"
      style={{ marginBottom: 0 }}>
        <Input disabled placeholder="Supplier Old Amount" />
      </Form.Item>
    </Col>

    <Col span={24}>
      <Form.Item label="Return Amount" style={{ marginBottom: 0 }}>
        <Input disabled value={totalReturnAmount.toFixed(2)} />
      </Form.Item>
    </Col>

  <Col span={24}>
  <Form.Item name="remainingAmount" label="Remaining Amount" style={{ marginBottom: 0 }}>
    <Input disabled />
  </Form.Item>
</Col>
 
  {showPaymentMethod && (
                <Col span={24}>
                <Row gutter={6} > <Col span={24} >
                <Form.Item
                  name="paymentMethodId"
                  label={`Payment Method: ${paymentMethodRemainingAmount}`}
                   style={{ width: '100%' }}
                    >
                     <ReusableDropdown
                      data={paymentMethod}
                      valueField="paymentMethodId" 
                      labelField="name"      
                      placeholder="Select Payment Method"
                      loading={loadingPaymentMethod}
                      style={{ width: '100%' }}
                      defaultOption={false} 
                       value={form1.getFieldValue("paymentMethodId")}
                     onChange={(paymentMethodId) => {
                        form1.setFieldsValue({ paymentMethodId });  
 
                         const selected = paymentMethod.find((item) => item.paymentMethodId === paymentMethodId);  
                      if (selected) {
 
                      setPaymentMethodRemainingAmount(selected.remaining || '');
                        } else {
                       setPaymentMethodRemainingAmount('');
                          }
                       }}
                    />
                    
                   </Form.Item>
                </Col>
              </Row>
              </Col>
              
              )}
 <Col span={24}>
  <label>If the remaining amount becomes negative, 
  the supplier will definitely return that amount to you, 
  and it will be automatically added to your payment method</label>
 </Col>

    <Col span={24}>
      <Button
        key="submit"
        type="primary"
        onClick={handleSubmit}
        style={{ width: '100%' }}
        loading={loadingSave}
        disabled={loadingSave}
      >
        Process Return
      </Button>
    </Col>
  </Row>
</Form>
    </Card>
      </Col>    
    </Row>
  );
};

export default PurchaseReturn;