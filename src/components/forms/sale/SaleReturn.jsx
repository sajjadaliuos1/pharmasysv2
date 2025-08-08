import { useState, useEffect  } from 'react';
 
import {
  Card,  Table,  Form,  Input,  Button,   InputNumber,  Row,  Col,  
} from 'antd';

import ReusableDropdown from '../../common/ReusableDropdown';  
import {  getSalebyInvoice,getPayment, returnSale } from '../../../api/API';  
import { Toaster } from '../../common/Toaster';
 


const SaleReturn = () => {
  
  const [form1] = Form.useForm();
  const [formSearch] = Form.useForm();
 
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState([]);
  const [paymentMethodMap, setPaymentMethodMap] = useState(new Map());
  const [paymentMethodRemainingAmount, setPaymentMethodRemainingAmount] = useState('');
  const [cartItems, setCartItems] = useState([]);  
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [totalReturnAmount, setTotalReturnAmount] = useState(0);
  const [isPaidReturnTouched, setIsPaidReturnTouched] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);   

  useEffect(() => {    
    fetchPaymentMethod();
  }, []);
  
  useEffect(() => {
  recalculateAmounts(form1, totalReturnAmount, setFinalAmount);
  }, [totalReturnAmount,paymentMethod]);

  const handleSearch = async () => {
    try {
      setTotalReturnAmount(0);
      setFinalAmount(0);
      form1.setFieldsValue({
      remainingAmount: 0,
      })
      const formData = await formSearch.validateFields();
      const invoiceNo = parseInt(formData.search, 10);

      if (isNaN(invoiceNo)) {
          Toaster.error('Invalid invoice number');
          return;
       }
    setLoadingSearch(true);
    const result = await getSalebyInvoice(invoiceNo);    

    if (!result.data || result.data.status !== "Success") {
       setLoadingSearch(false);
      Toaster.error("No record found for this invoice number.");
      return;
    }
    console.log("Search Record:", result.data);

    const saleData = result.data.data;
 
    const totalAmount = parseFloat(saleData.totalAmount ?? 0);
    const returnItemAmount = parseFloat(saleData.returnItemAmount ?? 0);

    const netTotalAMount = totalAmount - returnItemAmount;


    
    const totalPaid = parseFloat(saleData.paidAmount ?? 0);
    const returnToCusAmount = Math.abs(parseFloat(saleData.returnToCustomerAmount ?? 0));

    const netTotalPaid = totalPaid - returnToCusAmount;

    form1.setFieldsValue({
      invoiceNo: saleData.invoiceNo,
      customerId: saleData.customerId,
      discountAmount: saleData.discountAmount?.toFixed(2) || '0.00',
      CustomerName: saleData.customerName,
      // totalAmount: saleData.totalAmount?.toFixed(2),
       totalAmount: totalAmount.toFixed(2),
       alreadyReturned : returnItemAmount.toFixed(2),
      supplierDiscount: saleData.discountAmount?.toFixed(2),
      netAmount: saleData.finalAmount?.toFixed(2),
      totalAmountWithOld: (saleData.finalAmount).toFixed(2),
      paidAmount: netTotalPaid.toFixed(2),
      remainingAmountOld : saleData.remaining?.toFixed(2),
      remainingAmount: saleData.remaining?.toFixed(2),
      paymentMethodId: saleData.paymentMethodId ?? undefined
    });
  
    if (saleData.paymentMethodId && paymentMethodMap.has(saleData.paymentMethodId)) {
      const selectedMethod = paymentMethodMap.get(saleData.paymentMethodId);
      setPaymentMethodRemainingAmount(selectedMethod.remaining || '');
    } else {
      setPaymentMethodRemainingAmount('');
    }
    const saleDetails = Array.isArray(saleData.saleDetails) ? saleData.saleDetails : [];
    const mappedTableData = saleDetails.filter(item => item.netQuantity !== 0).map((item, index) => ({
      key: index,
      saleDetailId: item.saleDetailId,
      productId: item.productId,
      purchaseInventoryId: item.purchaseInventoryId,
      profit: item.profit,
      profitPerUnit: item.profit / item.netQuantity, 
      productName: item.productName,      
      unitSaleRate: item.unitSaleRate,
      discountPercent: item.discountPercent,
      finalRate: item.afterDiscountAmount,
      saleQuantity: item.netQuantity,
      isStrip: item.isStrip,
      afterFinalDiscountAmount: item.afterFinalDiscountAmount,
      finalAmount: item.netAmount,
      quantity: item.netQuantity,                 
      saleRate: item.unitSaleRate,                
      totalAmount: item.afterDiscountAmount,
      returnQty: 0,  
      returnProfit: 0 
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
 
 

  const fetchPaymentMethod = async () => {
      try {
        setLoadingPaymentMethod(true);
        const response = await getPayment();
         if (response.data && response.data.data) {
           const paymentList = response.data.data;
        setPaymentMethod(paymentList);
  
        // use for dropdown to get record in fast....
          const map = new Map();
          paymentList.forEach(s => map.set(s.paymentMethodId, s));
          setPaymentMethodMap(map);
      
        if (paymentList.length > 0 && !form1.getFieldValue("paymentMethodId")) {
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

   
 
const columns = [
  //{ title: 'sale id', dataIndex: 'saleDetailId' },
  { title: 'Product', dataIndex: 'productName' },
// {
//   title: 'Is Strip',
//   dataIndex: 'isStrip',
//   render: (value) => value ? 'Yes' : 'No'
// },

  { title: 'Sale Rate', dataIndex: 'unitSaleRate' },
  { title: 'Discount %', dataIndex: 'discountPercent' },
  { title: 'Net Rate', dataIndex: 'finalRate' },
  { title: 'final Rate', dataIndex: 'afterFinalDiscountAmount' },
  { title: 'Qty', dataIndex: 'saleQuantity' },
  {
    title: 'Amount',
    dataIndex: 'finalAmount',
    render: (value) => `Rs. ${parseFloat(value || 0).toFixed(2)}`
  },
  {
    title: 'Profit/Unit',
    dataIndex: 'profitPerUnit',
    render: (value) => `Rs. ${parseFloat(value || 0).toFixed(2)}`
  },
  {
    title: 'Return Qty',
    dataIndex: 'returnQty',
    render: (value, record, index) => (
      <input
        type="number"
        min="0"
        step="1"
        max={record.saleQuantity}
        value={record.returnQty || ''}
        onChange={(e) => handleReturnQtyChange(e.target.value, index, record.saleQuantity)}
        style={{ width: '100%', textAlign: 'right' }}
      />
    )
  },
  {
    title: 'Return Amount',
    dataIndex: 'returnAmount',
    render: (_, record) => {
      const qty = parseInt(record.returnQty || 0);
      const rate = parseFloat(record.afterFinalDiscountAmount || 0);
      const amount = qty * rate;
      return `Rs. ${amount.toFixed(2)}`;
    }
  },
  {
    title: 'Return Profit',
    dataIndex: 'returnProfit',
    render: (value) => `Rs. ${parseFloat(value || 0).toFixed(2)}`
  }
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
  
  const profitPerUnit = parseFloat(updatedItems[index].profitPerUnit || 0);
  updatedItems[index].returnProfit = intVal * profitPerUnit;
  
  setCartItems(updatedItems);

  const totalReturnAmount = updatedItems.reduce((sum, item) => {
    const qty = parseInt(item.returnQty || 0);
    const rate = parseFloat(item.afterFinalDiscountAmount || 0);
    return sum + qty * rate;
  }, 0);

 

  setTotalReturnAmount(totalReturnAmount);
   
 
  recalculateAmounts(form1, totalReturnAmount, setFinalAmount);
};

 

const recalculateAmounts = (form, totalReturnAmount, setFinalAmount) => {
  const { netAmount, paidAmount, remainingAmountOld, paidOrReturn } = form.getFieldsValue();

  const total = parseFloat(netAmount || 0);
  const paid = parseFloat(paidAmount || 0);
  const returned = parseFloat(totalReturnAmount || 0);
  const paidReturn = parseFloat(paidOrReturn || 0);

const oldReturnAMount = parseFloat(remainingAmountOld || 0);
  const finalAmount = oldReturnAMount - returned;
  const remaining = finalAmount - paidReturn;
  const shouldShowPaymentMethod = paidReturn !== 0;

  setShowPaymentMethod(paidReturn !== 0);



  setFinalAmount(finalAmount);

  const fieldsToSet = {
    finalAmount: finalAmount.toFixed(2),
    remainingAmount: remaining.toFixed(2)
  };

  // Auto-fill only once if not touched
  if (!isPaidReturnTouched) {
    fieldsToSet.paidOrReturn = finalAmount.toFixed(2);
  }

  form.setFieldsValue(fieldsToSet);
  if (shouldShowPaymentMethod && paymentMethod.length > 0 && !form.getFieldValue("paymentMethodId")) {
    const firstPaymentMethod = paymentMethod[0];
    form.setFieldsValue({ paymentMethodId: firstPaymentMethod.paymentMethodId });
    setPaymentMethodRemainingAmount(firstPaymentMethod?.remaining || '');
  }
};


 
 
const handleSubmit = async () => {
  try {    
    const formData = await form1.validateFields();       
    const customerId = formData.customerId;
    if (!customerId) {
      Toaster.error('Please select a customer');
      return;
    }

    const paidAmount = parseFloat(formData.paidAmount || 0);    
    if (!cartItems || cartItems.length === 0) {
      Toaster.error('Please add at least one item to the cart');
      return;
    }

    const returnItems = cartItems.filter(item => 
      parseInt(item.returnQty || 0) > 0
    );

    if (returnItems.length === 0) {
      Toaster.warning('Please specify return quantity for at least one item');
      return;
    }


  const remainingAmount11 = parseFloat(paymentMethodRemainingAmount) || 0;
  const paidOrReturn = parseFloat(formData.paidOrReturn || 0);

  if (totalReturnAmount > remainingAmount11 && paidOrReturn < 0 ) {
    Toaster.warning('Insufficient balance in selected payment method');
  return;
  }



    // Validate return items
    const invalidItems = returnItems.filter(item => {
      return !item.purchaseInventoryId || 
             !item.saleDetailId || 
             !item.returnQty || 
             isNaN(parseInt(item.returnQty)) || 
             parseInt(item.returnQty) <= 0 ||
             parseInt(item.returnQty) > parseInt(item.saleQuantity);
    });

    if (invalidItems.length > 0) {
      Toaster.error('Some return items have invalid data. Please check return quantities.');
      return;
    }
 
    
    if (showPaymentMethod && !formData.paymentMethodId) {
      Toaster.error('Please select a payment method');
      return;
    }
     const customerName = formData.CustomerName || '';
        

     const remainingAmount = parseFloat(formData.remainingAmount || 0);
      const isWalkingCustomer = customerName.includes('Walking');

     if (isWalkingCustomer) {
      if (Math.abs(remainingAmount) > 0.01) {  
        Toaster.warning('Walking customers must have 0 remaining amount. Please ensure paid amount equals final amount.');
        return;
      }
      
     
      if (Math.abs(paidOrReturn - finalAmount) > 0.01) {
        Toaster.warning('Walking customers must pay the full amount. Paid amount must equal final amount.');
        return;
      }
    }
 
    if (showPaymentMethod && !formData.paymentMethodId) {
      Toaster.warning('Please select a payment method');
      return;
    }

    setLoadingSave(true); 
  
    const returnDetails = returnItems
    .filter(item => parseInt(item.returnQty) > 0)
    .map(item => ({
      saleDetailId: item.saleDetailId,
      purchaseInventoryId: item.purchaseInventoryId,
      productId: item.productId,
      returnQuantity: parseInt(item.returnQty),
      returnAmount: parseInt(item.returnQty) * parseFloat(item.afterFinalDiscountAmount),
      returnProfit: parseFloat(item.returnProfit),
      unitSaleRate: parseFloat(item.unitSaleRate),
      afterFinalDiscountAmount: parseFloat(item.afterFinalDiscountAmount),
      isStrip: item.isStrip || false,
    }));

    const payload = {
      ...formData,
      customerId,
      invoiceNo: parseInt(formData.invoiceNo, 10),
      returnItem: returnItems.length,
      returnItemAmount: totalReturnAmount,
      paidOrReturn : parseFloat(formData.paidOrReturn || 0),
      totalAmount: parseFloat(formData.totalAmount),
      DiscountAmount: parseFloat(formData.supplierDiscount || 0),      
      netPayableAmount: isNaN(parseFloat(formData.totalAmountWithOld)) ? 0 : parseFloat(formData.totalAmountWithOld),
      paidAmount,
      returnToCustomer:parseFloat(formData.paidOrReturn || 0),
      remaining: parseFloat(formData.remainingAmount || 0),
      paymentMethodId: formData.paymentMethodId || 0,
      date:  new Date().toISOString().split('T')[0],
      returnDetails: returnDetails,
    };

    console.log('Return Payload:', payload); 

 
    await returnSale(payload); 

    Toaster.success('Sale return processed successfully.');
    form1.resetFields();            
    setCartItems([]);               
    setShowPaymentMethod(false);   
    setTotalReturnAmount(0);
    
    formSearch.resetFields();
       
    fetchPaymentMethod();
 
    setLoadingSave(false);
  } catch (error) {
    setLoadingSave(false);
    console.error('Submission error:', error);
    if (error.errorFields) {
      Toaster.warning('Please fill all required fields correctly');
    } else {
      Toaster.error('An error occurred while processing the return');
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
  Return Sale
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
    totalAmount: '0.00',
    supplierDiscount: '0.00',
    netAmount: '0.00',
    paidAmount: '0.00',
    remainingAmount: '0.00',
  }}
>
  <Form.Item name="invoiceNo" hidden>
    <Input />
  </Form.Item>
    <Form.Item name="customerId" hidden>
    <Input />
  </Form.Item>

  <Row gutter={[10, 0]}>
    <Col span={24}>
      <Form.Item
        name="CustomerName"
        label="Customer Name"
        rules={[{ required: true, message: 'Customer Name required' }]}
      style={{ marginBottom: 0 }}>
        <Input disabled placeholder="Customer Name" />
      </Form.Item>
    </Col>

    <Col span={24}>
      <Form.Item name="totalAmount" label="Total Amount" style={{ marginBottom: 0 }}>
        <Input disabled />
      </Form.Item>
    </Col>

     <Col span={24}>
      <Form.Item name="discountAmount" label="Discount Amount" style={{ marginBottom: 0 }}>
        <Input disabled />
      </Form.Item>
    </Col>

 <Col span={24}>
      <Form.Item name="netAmount" label="Net Amount" style={{ marginBottom: 0 }}>
        <Input disabled />
      </Form.Item>
    </Col> 

<Col span={24}>
      <Form.Item name="alreadyReturned" label="Already Return" style={{ marginBottom: 0 }}>
        <Input disabled />
      </Form.Item>
    </Col>

    <Col span={24}>
      <Form.Item name="paidAmount" label="Paid Amount" style={{ marginBottom: 0 }}>
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          step={1}
          precision={2}
          disabled
        />
      </Form.Item>
    </Col>
    <Col span={24}>
      <Form.Item name="remainingAmountOld" label="Old Remaining Amount" style={{ marginBottom: 0 }}>
        <Input disabled />
      </Form.Item>
    </Col>
    <Col span={24}>
      <Form.Item label="Return Amount" style={{ marginBottom: 0 }}>
        <Input disabled value={totalReturnAmount.toFixed(2)} />
      </Form.Item>
    </Col>

     
    <Col span={24}>
      <Form.Item label="Final Amount" name="finalAmount" style={{ marginBottom: 0 }}>
        <Input disabled value={finalAmount.toFixed(2)} />
      </Form.Item>
    </Col>

    <Col span={24}>
      <Form.Item name="paidOrReturn" label="Paid / Return" style={{ marginBottom: 0 }}>
        <InputNumber
          style={{ width: '100%' }}
          step={1}
          precision={2}
          onChange={() => {
            setIsPaidReturnTouched(true);
            recalculateAmounts(form1, totalReturnAmount, setFinalAmount);
          }}
          onKeyPress={(e) => {
            const key = e.key;
            const currentValue = e.currentTarget.value;

            if (!/[\d.-]/.test(key)) {
              e.preventDefault();
            }

            if (key === '.' && currentValue.includes('.')) {
              e.preventDefault();
            }

            if (key === '-' && (currentValue.includes('-') || e.target.selectionStart !== 0)) {
              e.preventDefault();
            }
          }}
        />
      </Form.Item>
    </Col>

    <Col span={24}>
      <Form.Item name="remainingAmount" label="Remaining Amount">
        <Input disabled />
      </Form.Item>
    </Col>

    {showPaymentMethod && (
      <Col span={24}>
        <Form.Item
          name="paymentMethodId"
          label={`Payment Method : ${paymentMethodRemainingAmount}`}
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
              const selectedMethod = paymentMethodMap.get(paymentMethodId);
              setPaymentMethodRemainingAmount(selectedMethod?.remaining || '');
            }}
          />
        </Form.Item>
      </Col>
    )}

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

export default SaleReturn;