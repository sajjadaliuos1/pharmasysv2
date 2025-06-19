import React, { useState, useEffect,useMemo, useRef  } from 'react';
 
import {
  Card,  Table,  Form,  Input,  Button,  DatePicker,  InputNumber,  Row,  Col,  Space,  message,
   Select, Checkbox, Avatar, Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CloseOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import ReusableDropdown from '../../common/ReusableDropdown';  
import { purchaseOrder, getBoxProduct,getNewInvoice,getPayment, getCustomer, getStripProduct } from '../../../api/API';  
import { Toaster } from '../../common/Toaster';
import { heIL } from '@mui/material/locale';


const Sale = () => {
  const [form] = Form.useForm();
   const [form1] = Form.useForm();
 
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);
  const [loadingproduct, setLoadingproduct] = useState(false);
  const [product, setProducts] = useState([]);
  const [productMap, setProductMap] = useState(new Map());
  
  const [selectedPurchaseInventoryId, setSelectedPurchaseInventoryId] = useState(null);
 
  const [remainingQuantity, setRemainingQuantity] = useState(0);
  const [BatchNo, setBatchNo] = useState('');   
  const [minSaleRate,setMinSaleRate] = useState('')
   const [finalPurchaseRate,setFinalPurchaseRate] = useState('')

  
  const [customers, setCustomers] = useState([]);
   const [paymentMethod, setPaymentMethod] = useState([]);
  const [customerMap, setCustomerMap] = useState(new Map());
  const [paymentMethodMap, setPaymentMethodMap] = useState(new Map());

    const [paymentMethodRemainingAmount, setPaymentMethodRemainingAmount] = useState('');
  const [InvoiceNo, setNewInvoiceNo] = useState([]);
  

   const [cartItems, setCartItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); 
const [customerRemainingAmount, setCustomerRemainingAmount] = useState('');
  
 
const [remainingAmount, setRemainingAmount] = useState(0);
const [showPaymentMethod, setShowPaymentMethod] = useState(false);

const [saleDate, setSaleDate] = useState(dayjs());
  useEffect(() => {
    fetchBoxProduct();
    fetchStripProduct();
     fetchCustomer();
    fetchInvoiceNo();
    fetchPaymentMethod();
  }, []);
 
  
const totalItemAmount = useMemo(() => {
  return cartItems.reduce((sum, item) => sum +  parseFloat(item.totalAmount || 0), 0).toFixed(2);
}, [cartItems]);

 
 const fetchInvoiceNo = async () => {
    try {
      setLoadingCustomer(true);
      const response = await getNewInvoice();
      if (response.data > 0 ) {
          const InvoiceNo = response.data;
               setNewInvoiceNo(InvoiceNo);
      } else {
        Toaster.warning("Error in getting Purchase No.");
      }
    } catch (err) {
      
      Toaster.error("Failed to load Purchase No. Please try again.");
    } finally {
      setLoadingCustomer(false);
    }
  };

  //Best for one time loading
 const stripProductCache = useRef(null);
const boxProductCache = useRef(null);  
  const fetchBoxProduct = async () => {
    if (boxProductCache.current) {
    setProducts(boxProductCache.current);
    const map = new Map();
    boxProductCache.current.forEach(s => map.set(s.purchaseInventoryId, s));
    setProductMap(map);
    return;
  }
    try {
      setLoadingproduct(true);
      const response = await getBoxProduct();
      if (response.data && response.data.data) {
        const productList = response.data.data;
        setProducts(productList);
         boxProductCache.current = productList;    

         const map = new Map();
        productList.forEach(s => map.set(s.purchaseInventoryId, s));
         setProductMap(map);
        
      } else {
        Toaster.warning("No product found or unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      Toaster.error("Failed to load product. Please try again.");
    } finally {
      setLoadingproduct(false);
    }
  };

   const fetchStripProduct = async () => {
     if (stripProductCache.current) {
    setProducts(stripProductCache.current);
    const map = new Map();
    stripProductCache.current.forEach(s => map.set(s.purchaseInventoryId, s));
    setProductMap(map);
    return;
  }

    try {
      setLoadingproduct(true);
      const response = await getStripProduct();
      if (response.data && response.data.data) {
const productList = response.data.data;
setProducts(productList);
stripProductCache.current = productList; 
      
          const map = new Map();
        productList.forEach(s => map.set(s.purchaseInventoryId, s));
         setProductMap(map);
        
      } else {
        Toaster.warning("No product found or unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      Toaster.error("Failed to load product. Please try again.");
    } finally {
      setLoadingproduct(false);
    }
  };

  const fetchCustomer = async () => {
    try {
      setLoadingCustomer(true);
      const response = await getCustomer();
       if (response.data && response.data.data) {
        const customerList = response.data.data.map(c => ({
        ...c,
        label: `${c.customerName} (Rs. ${c.remaining})`
      }));
      setCustomers(customerList);

      // use for dropdown to get record in fast....
        const map = new Map();
        customerList.forEach(s => map.set(s.customerId, s));
        setCustomerMap(map);
    
      } else {
        Toaster.warning("No suppliers found or unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      Toaster.error("Failed to load suppliers. Please try again.");
    } finally {
      setLoadingCustomer(false);
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
  {
    title: 'Actions',
    render: (_, __, index) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => handleEdit(index)} />
        <Button icon={<DeleteOutlined />} onClick={() => handleDelete(index)} danger />
      </Space>
    ),
  },
//   { title: 'Purchase Inventory Id', dataIndex: 'purchaseInventoryId' },
//   { title: 'Product Id', dataIndex: 'productId' },
  { title: 'Product', dataIndex: 'productName' },
  { title: 'Batch No', dataIndex: 'batchNo' },
    { title: 'Purchase rate', dataIndex: 'finalPurchaseRate' },
  { title: 'Sale Rate', dataIndex: 'saleRate' },
  { title: 'Sale Discount', dataIndex: 'saleDiscount' },
  { title: 'Final Sale Rate', dataIndex: 'finalRate' },
  { title: 'Quantity', dataIndex: 'quantity' },
    { title: 'Subtotal', dataIndex: 'totalAmount' },
    //// New column added for additional discount
    { 
    title: 'Additional Discount', 
    dataIndex: 'additionalDiscount',
    render: (value) => `Rs. ${parseFloat(value || 0).toFixed(2)}`
  },
  { 
    title: 'Single Item Discount', 
    dataIndex: 'singleItemDiscount',
    render: (value) => `Rs. ${parseFloat(value || 0).toFixed(2)}`
  },
  { 
    title: 'Final Amount', 
    dataIndex: 'finalAmount',
    render: (value) => `Rs. ${parseFloat(value || 0).toFixed(2)}`
  },
   { 
  title: 'isStrip', 
  dataIndex: 'isStrip',
  render: (value) => value ? 'Yes' : 'No'
}
];


const calculateAdditionalDiscountByRate = (cartItems, totalDiscount) => {
  if (!totalDiscount || totalDiscount <= 0) {
    return cartItems.map(item => ({
      ...item,
      additionalDiscount: 0,
      singleItemDiscount: 0,
      finalAmount: parseFloat(item.totalAmount || 0)
    }));
  }

  // Calculate total weighted amount (rate * quantity for each item)
  const totalWeightedAmount = cartItems.reduce((sum, item) => {
    const rate = parseFloat(item.saleRate || 0);
    const quantity = parseFloat(item.quantity || 0);
    return sum + (rate * quantity);
  }, 0);

  // Distribute discount based on rate proportion
  let remainingDiscount = totalDiscount;
  const updatedItems = cartItems.map((item, index) => {
    const rate = parseFloat(item.saleRate || 0);
    const quantity = parseFloat(item.quantity || 0);
    const weightedAmount = rate * quantity;
    let itemDiscount;
    
    // For the last item, assign remaining discount to avoid rounding issues
    if (index === cartItems.length - 1) {
      itemDiscount = remainingDiscount;
    } else {
      // Calculate proportional discount based on rate
      const discountRatio = weightedAmount / totalWeightedAmount;
      itemDiscount = totalDiscount * discountRatio;
      remainingDiscount -= itemDiscount;
    }
    
    // Calculate single item discount (additional discount / quantity)
    const singleItemDiscount = quantity > 0 ? itemDiscount / quantity : 0;
    
    const itemTotal = parseFloat(item.totalAmount || 0);
    const finalAmount = Math.max(0, itemTotal - itemDiscount);
    
    return {
      ...item,
      additionalDiscount: itemDiscount,
      singleItemDiscount: singleItemDiscount,
      finalAmount: finalAmount
    };
  });

  return updatedItems;
};

const handleValuesChange = (changedValues, allValues) => {
  const saleRate = parseFloat(allValues.saleRate || 0);
  const discount = parseFloat(allValues.saleDiscount || 0);
  const quantity = parseFloat(allValues.quantity || 0);
 const minRate = parseFloat(minSaleRate || 0);

if (!saleRate || !quantity || isNaN(minRate)) {
    form.setFieldsValue({
      finalRate: '',
      totalAmount: '',
    });
    return;
  }

  const finalRate = saleRate - (saleRate * discount / 100);
if (finalRate < minSaleRate) {
    Toaster.error(`Final rate cannot be less than minimum sale rate (Rs. ${minSaleRate})`);    
    form.setFieldsValue({
      totalAmount: (minSaleRate * quantity).toFixed(2)
    });
    return;
  }
  const totalAmount = finalRate * quantity;

  form.setFieldsValue({
    finalRate: finalRate.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  });
};

  const handleAddOrUpdate = () => {
  form.validateFields().then(values => {
    const enteredQuantity = parseFloat(values.quantity || 0);
    const saleRate = parseFloat(values.saleRate || 0);
    const saleDiscount = parseFloat(values.saleDiscount || 0);
    
    // Da darek hum ratly she ao dalta hum calculated kawalay sho
    const finalRate = saleRate - (saleRate * saleDiscount / 100);
    const totalAmount = finalRate * enteredQuantity;

    if (enteredQuantity > remainingQuantity) {
      Toaster.error(`Entered quantity (${enteredQuantity}) exceeds remaining quantity (${remainingQuantity}).`);
      return;
    }

    if (finalRate < parseFloat(minSaleRate)) {
      Toaster.error(`Final Rate must not be less than Min Sale Rate (Rs. ${minSaleRate})`);
      return;
    }

    const selectedProduct = productMap.get(values.purchaseInventoryId);
    let updatedCart;

    if (editingIndex !== null) {
     // on Edit
      updatedCart = [...cartItems];
      updatedCart[editingIndex] = {
        ...values,
        productId: selectedProduct?.productId ?? '',
        productName: selectedProduct?.productName ?? '',
        finalPurchaseRate: finalPurchaseRate,
        batchNo: BatchNo,
        purchaseInventoryId: values.purchaseInventoryId,
        remainingQuantity,
        finalRate: finalRate.toFixed(2),  
        totalAmount: totalAmount.toFixed(2),
        isStrip: isChecked
      };
    } else {
      // On Add
      const existingIndex = cartItems.findIndex(
        item => item.purchaseInventoryId === values.purchaseInventoryId &&
        item.isStrip === isChecked
      );

      if (existingIndex !== -1) {
        updatedCart = [...cartItems];
        const existingItem = updatedCart[existingIndex];
        const updatedQuantity = parseFloat(existingItem.quantity || 0) + enteredQuantity;
        const updatedTotal = finalRate * updatedQuantity;
        
        updatedCart[existingIndex] = {
          ...existingItem,
          quantity: updatedQuantity,          
          saleRate,
          saleDiscount,
          finalRate: finalRate.toFixed(2),
          totalAmount: updatedTotal.toFixed(2),
          batchNo: BatchNo,
          remainingQuantity,
          isStrip: isChecked
        };
      } else {
        const newItem = {
          ...values,
          productId: selectedProduct?.productId ?? '',
          productName: selectedProduct?.productName ?? '',
           finalPurchaseRate: finalPurchaseRate,
          batchNo: BatchNo,
          purchaseInventoryId: values.purchaseInventoryId,
          remainingQuantity,
          finalRate: finalRate.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          isStrip: isChecked
        };
        updatedCart = [...cartItems, newItem];
      }
    }

      const cartWithDiscount = reapplyAdditionalDiscount(updatedCart);
    setCartItems(cartWithDiscount);

     setTimeout(() => {
      const newTotal = updatedCart.reduce((sum, item) => {
        return sum + parseFloat(item.totalAmount || 0);
      }, 0);
      
      form1.setFieldsValue({
        totalAmount: newTotal.toFixed(2)
      });

     
      handleForm1Change({}, {
        ...form1.getFieldsValue(),
        totalAmount: newTotal.toFixed(2)
      });
    }, 0);

    form.resetFields();
    setSelectedPurchaseInventoryId(null);
    setRemainingQuantity(0);
    setBatchNo('');
    setEditingIndex(null);
    setMinSaleRate('');
  });
};

  

const handleEdit = async(index) => {
  const item = cartItems[index];
  
  const isStrip = !!item.isStrip;

  setIsChecked(isStrip);
  setLoadingproduct(true);
  try {
    if (isStrip) {
      await fetchStripProduct();
    } else {
      await fetchBoxProduct();
    }
  } finally {
    setLoadingproduct(false);
  }

  form.setFieldsValue({
    ...item,
    purchaseInventoryId: item.purchaseInventoryId,
    saleRate: item.saleRate,
    saleDiscount: item.saleDiscount,
    finalRate: item.finalRate,
    quantity: item.quantity,
    totalAmount: item.totalAmount,
    // isStrip: !!item.isStrip 
  });
  
 
  const product = productMap.get(item.purchaseInventoryId);
  setRemainingQuantity(product?.remainingQuantity || 0);
  
  setSelectedPurchaseInventoryId(item.purchaseInventoryId);
  setBatchNo(item.batchNo || '');
  setMinSaleRate(product?.minimumSaleRate || 0);
  setEditingIndex(index);
};

const handleDelete = (index) => {
  const updatedCart = [...cartItems];
  updatedCart.splice(index, 1);
  
   const cartWithDiscount = reapplyAdditionalDiscount(updatedCart);
  setCartItems(cartWithDiscount);

   setTimeout(() => {
    const newTotal = updatedCart.reduce((sum, item) => {
      return sum + parseFloat(item.totalAmount || 0);
    }, 0);
    
    form1.setFieldsValue({
      totalAmount: newTotal.toFixed(2)
    });

     handleForm1Change({}, {
      ...form1.getFieldsValue(),
      totalAmount: newTotal.toFixed(2)
    });
  }, 0);
};

 
const reapplyAdditionalDiscount = (updatedCart) => {
  const currentDiscount = parseFloat(form1.getFieldValue('supplierDiscount') || 0);
  if (currentDiscount > 0) {
    return calculateAdditionalDiscountByRate(updatedCart, currentDiscount);
  }

  return updatedCart.map(item => ({
    ...item,
    additionalDiscount: 0,
    singleItemDiscount: 0,
    finalAmount: parseFloat(item.totalAmount || 0)
  }));
};


const handleForm1Change = (changedValues, allValues) => {
  const additionalDiscount = parseFloat(allValues.supplierDiscount || 0);
  const paidAmount = parseFloat(allValues.paidAmount || 0);
  const totalAmount = parseFloat(allValues.totalAmount || totalItemAmount || 0);
  const oldCustomerAmount = parseFloat(customerRemainingAmount || 0);

  // Calculate net amount after additional discount
  const netAmount = Math.max(0, totalAmount - additionalDiscount);
  const finalTotal = netAmount + oldCustomerAmount;
  const remaining = Math.max(0, finalTotal - paidAmount);

  
  if (changedValues.supplierDiscount !== undefined) {
    // Use this for "higher rate gets higher discount"
    const updatedCartItems = calculateAdditionalDiscountByRate(cartItems, additionalDiscount);
    setCartItems(updatedCartItems); 
  }

  setTimeout(() => {
    form1.setFieldsValue({
      netAmount: netAmount.toFixed(2),
      customerOldAmount: oldCustomerAmount.toFixed(2),
      totalAmountWithOld: finalTotal.toFixed(2),
      remainingAmount: remaining.toFixed(2)
    });
  }, 0);

  setRemainingAmount(remaining.toFixed(2));
  setShowPaymentMethod(paidAmount > 0);
};

const applyRoundOff = (amount) => {
  const numAmount = parseFloat(amount);
  const lastDigit = numAmount % 10;

  if (lastDigit < 5) {
    // Round down to nearest 0
    return Math.floor(numAmount / 10) * 10;
  } else {
    // Round up to nearest 10
    return Math.ceil(numAmount / 10) * 10;
  }

 // this is example which i want
// applyRoundOff(52) → 50
// applyRoundOff(55) → 60
// applyRoundOff(59.9) → 60
// applyRoundOff(44.4) → 40

};




const handleSubmit = async () => {
  try {    
    const formData = await form1.validateFields();       
    const customerId = formData.customerId;
    if (!customerId) {
      Toaster.error('Please select a customer');
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      Toaster.error('Please add at least one item to the cart');
      return;
    }

    const invalidItems = cartItems.filter(item => {
      return !item.purchaseInventoryId || 
             !item.productId || 
             !item.quantity || 
             isNaN(parseFloat(item.quantity)) || 
             parseFloat(item.quantity) <= 0 ||
             !item.saleRate ||
             isNaN(parseFloat(item.saleRate)) ||
             parseFloat(item.saleRate) < 0;
    });

    if (invalidItems.length > 0) {
      Toaster.error('Some items in cart have invalid data. Please check quantity and rates.');
      return;
    }


    const paidAmount = parseFloat(formData.paidAmount || 0);
    const payableAmount = parseFloat(formData.totalAmountWithOld || 0);
    
    if (paidAmount > payableAmount) {
      Toaster.error('Paid amount cannot be greater than payable amount');
      return;
    }
    
    if (showPaymentMethod && !formData.paymentMethodId) {
      Toaster.error('Please select a payment method');
      return;
    }
 
    const payload = {
      ...formData,
      customerId,
      InvoiceNo:InvoiceNo,
      totalItems : cartItems.length,
      totalAmount: parseFloat(formData.totalAmount),
      DiscountAmount: parseFloat(formData.supplierDiscount || 0),
      FinalAmount: parseFloat(formData.netAmount),
        
        customerOldAmount: parseFloat(formData.customerOldAmount || 0),
        totalAmountWithOld: parseFloat(formData.totalAmountWithOld),
        paidAmount: paidAmount,
        remaining: parseFloat(formData.remainingAmount),
        paymentMethodId: formData.paymentMethodId || null,
      PurchaseDetails: cartItems,
    };
 console.log("formDate", formData);
///API cal kw ba

stripProductCache.current = null;
boxProductCache.current = null;

if (isChecked) {
  await fetchBoxProduct();
} else {
  await fetchStripProduct();
}

    console.log('Payload ready to send:', payload);
    Toaster.success('Validation successful. Ready to submit to API.');

  } catch (error) {
    console.error('Submission error:', error);
    if (error.errorFields) {
      Toaster.error('Please fill all required fields correctly');
    } else {
      Toaster.error('An error occurred while submitting the form');
    }
  }
};

 

const [isChecked, setIsChecked] = useState(false);
 const { Option } = Select;


  return (
   <Row gutter={[8, 0]} style={{ marginLeft: 0, marginRight: 0 }}>
      <Col span={18}>
        <Card
  title={
    <div style={{ display: 'flex', fontSize:'30px', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
  
  <span style={{ fontWeight: 500 }}>
   Add Sale
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
            form={form}
            layout="vertical"
            name="sale_form"
            onFinish={handleAddOrUpdate}
            onValuesChange={(changedValues, allValues) => {
              handleValuesChange(changedValues, allValues);
            }}
            initialValues={{ saleDate: dayjs() }}
                >       
                <Row gutter={[24, 0]}>

            <Col span={12}>
                <Form.Item
                  name="customerId"
                  label="Customer"
                    >
                  <Space.Compact style={{ width: '100%' }}>
                    <ReusableDropdown
                      data={customers}
                      valueField="customerId" 
                    //   labelField="customerName" 
                    labelField="label"     
                      placeholder="Select Customer"
                      loading={loadingCustomer}
                      style={{ width: 'calc(100% - 43px)' }}
                      defaultOption={false}                     
                    onChange={(customerId) => {
                     const selectedCustomer = customerMap.get(customerId);
                    const remaining = selectedCustomer ? selectedCustomer.remaining || 0 : 0;
  
                          setCustomerRemainingAmount(remaining);
  
                      form1.setFieldsValue({
                    customerId,
                    customerOldAmount: remaining,
                    paidAmount: 0,
                        netAmount: totalItemAmount,
                        totalAmountWithOld: (parseFloat(totalItemAmount || 0) + parseFloat(remaining || 0)).toFixed(2)
                      });
  
  setRemainingAmount(0);
  setShowPaymentMethod(false);
}}

                    />
                    <Button
                      type="primary"
                    //   onClick={() => setShowSuppliersModal(true)}
                    >
                      +
                    </Button>
                  </Space.Compact>
                </Form.Item>
              </Col>
              {/* <Col span={6}>
                <Form.Item                 
                  label="Customer Remaining Amount"
                    
                >
                  <Input
                  prefix={<span>Rs:</span>}
                    value={customerRemainingAmount} disabled  />
                </Form.Item>
              </Col> */}

        <Col span={6}>
                <Form.Item
                  name="saleDate"
                  label="Sale Date">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD-MM-YYYY"
                    placeholder="Select Sale date"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>

 <Col span={6}>
                <Form.Item
     
    label="Invoice No"
    rules={[{ required: true, message: 'Invoice number required' }]}
  >
    <Input type="number"
   value={InvoiceNo} disabled
     placeholder="Invoice Number" />
  </Form.Item>                
              </Col>

  <Col span={12}>
   <Form.Item
  name="purchaseInventoryId"
label={`Product Name - ${remainingQuantity}`}

>
  <Space.Compact style={{ width: '100%' }}>
     
    <Checkbox
      checked={isChecked}
      className="custom-checkbox"
      onChange={async (e) => {
        const checked = e.target.checked;
        setIsChecked(checked);
         // Reset dropdown and form fields immediately
    setSelectedPurchaseInventoryId(undefined);
    form.resetFields([
      'purchaseInventoryId',
      'saleRate',
      'saleDiscount',
      'finalRate',
      'quantity',
      'totalAmount'
    ]);
    setRemainingQuantity('');
    setBatchNo('');
    setMinSaleRate('');
    setFinalPurchaseRate('');
    setProducts([]); // Clear product options
        setLoadingproduct(true);
        try {
           if (checked) {
        await fetchStripProduct();     
      } else { 
        await fetchBoxProduct(); 
      }
        } catch (error) {
          console.error("API Error:", error);
        } finally {
          setLoadingproduct(false);
        }
      }}
    />

    
    <Select
      showSearch
      placeholder="Search a product"
      optionFilterProp="label"
      style={{ width: '100%' }}
      value={selectedPurchaseInventoryId}
      onChange={(PurchaseInventoryId) => {
        setSelectedPurchaseInventoryId(PurchaseInventoryId);      
        form.setFieldsValue({ purchaseInventoryId: PurchaseInventoryId });
        const selectedProduct = productMap.get(PurchaseInventoryId);
        console.log("selectedProduct === ", selectedProduct);
        if (selectedProduct) {
           setRemainingQuantity(selectedProduct.remainingQuantity);
           setBatchNo(selectedProduct.batchNo);
            setMinSaleRate(selectedProduct.minimumSaleRate);
            setFinalPurchaseRate(selectedProduct.finalPurchaseRate);
    const saleRate = selectedProduct.saleRate || 0;
    const discount = selectedProduct.saleDiscountPercent || 0;
    const finalRate = saleRate - (saleRate * discount / 100);
    const quantity = 1;
    const totalAmount = finalRate * quantity;
    form.setFieldsValue({
      saleRate,
      saleDiscount: discount,
      finalRate: finalRate.toFixed(2),
      quantity,
      totalAmount: totalAmount.toFixed(2)
    });

           
          } else {
         setRemainingQuantity('');
         setBatchNo('');
         setMinSaleRate('');
          setFinalPurchaseRate('');
         form.resetFields([
      'saleRate',
      'saleDiscount',
      'finalRate',
      'quantity',
      'totalAmount'
    ]);
        
        }
      }}
     filterOption={(input, option) => {
    const selected = product.find(p => p.purchaseInventoryId === option?.value);
    const name = selected?.productName?.toLowerCase() || '';
    const barcode = selected?.barcode?.toLowerCase() || '';
    return name.includes(input.toLowerCase()) || barcode.includes(input.toLowerCase());
  }}
      optionLabelProp="label"
      notFoundContent={loadingproduct ? <Spin size="small" /> : 'No products found'}
    >
      {product.map(product => (
        <Option
           key={product.purchaseInventoryId}        
          value={product.purchaseInventoryId}
          label={product.productName}
        //   label={`${product.productName} - ${product.barcode}`}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
             
            <div>
              <div style={{ fontWeight: 500 }}>{`${product.productName} - ${product.remainingQuantity}`}</div>
              <div style={{ fontSize: 12, color: 'gray' }}>
                Rate: {product.saleRate.toFixed(2)}  | B.No: {product.batchNo} | BC: {product.barcode}
              </div>
            </div>
          </div>
        </Option>
      ))}
    </Select>
  </Space.Compact>
</Form.Item>
  </Col>

             
               <Col span={6}>
                <Form.Item
                  name="saleRate"
                //   label="Sale Rate"
                 label={` Sale Rate - ${finalPurchaseRate}`}
                  rules={[{ required: true, message: 'Please enter sale rate' }]}
                >
                 <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%' }}
            min={0}
            
            step="1"
            precision={2}
            placeholder="Enter sale rate"
         
          />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                   name="saleDiscount"
                  label="Discount %"
                   rules={[{ required: true, message: 'Please enter sale discount' }]}
                >
      <InputNumber
            prefix={<span>%</span>}
            style={{ width: '100%' }}
            min={0}
            max={100}     
            step="0.01"
            precision={2}
            placeholder="Enter discount %"
            
          />
                </Form.Item>
              </Col>
         
    </Row>
               <Row gutter={[16, 0]}>
                
   <Col span={6}>
    <Form.Item
    name="quantity"
    label="Quantity"
    rules={[{ required: true, message: 'Please enter quantity' }]}
  >
    <Input type="number" placeholder="Enter quantity" />
  </Form.Item>
  </Col>
  <Col span={6}> 
        <Form.Item
    name="finalRate"
    label={`Unit Rate - Rs. ${minSaleRate}`}
    rules={[{ required: true, message: 'Please enter quantity' }]}
  >
    <Input type="number"
     disabled
     placeholder="Final Rate" />
  </Form.Item>
</Col>

   <Col span={6}>
    <Form.Item
    name="totalAmount"
    label="Total Amount"
    
    rules={[{ required: true, message: 'Please enter Total Amount' }]}
  >
    <Input disabled type="number" placeholder="Total Amount" />
  </Form.Item>
  </Col>

  {/* <Col span={6}>
    <Form.Item       
      label="Batch No"
      rules={[{ required: true, message: 'Please enter batch number' }]}
    >
      <Input value={BatchNo} disabled placeholder="Batch number" />
    </Form.Item>
  </Col> */}

 <Col span={6}>
<Form.Item
 label=" "
>
          <Button type="default" style={{width: '100%'}} htmlType="submit">
            {editingIndex !== null ? 'Update Item' : 'Add to Cart'}
          </Button>
        </Form.Item>
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
    const actualTotal = cartItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity || 0);
      const saleRate = parseFloat(item.saleRate || 0);
      return sum + (quantity * saleRate);
    }, 0);

    const discountedTotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.totalAmount || 0);
    }, 0);

    const finalTotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.finalAmount || item.totalAmount || 0);
    }, 0);

    const totalItems = cartItems.length;
    const itemLevelDiscount = (actualTotal - discountedTotal).toFixed(2);
    const additionalDiscountTotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.additionalDiscount || 0);
    }, 0);
    const totalAllDiscounts = (parseFloat(itemLevelDiscount) + additionalDiscountTotal).toFixed(2);

    form1.setFieldsValue({
      totalAmount: applyRoundOff(discountedTotal).toFixed(2)
    });

    handleForm1Change({}, {
      ...form1.getFieldsValue(),
      totalAmount: applyRoundOff(discountedTotal).toFixed(2)
    });

    return (
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '0px',
        borderTop: '1px solid #e0e0e0',
        fontSize: '15px',
        // lineHeight: 1.6
      }}>
        {/* <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          <span>Total Items:</span>
          <span>{totalItems}</span>
        </div> */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          <span>Actual Sale Total (Before Any Discount):</span>
          <span>Rs. {actualTotal.toFixed(2)}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
        //   marginBottom: '8px',
          fontWeight: '500',
          color: '#ff4d4f'
        }}>
          <span>Item Level Discount:</span>
          <span>- Rs. {itemLevelDiscount}</span>
        </div>
        {/* <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#ff4d4f'
        }}>
          <span>Additional Discount:</span>
          <span>- Rs. {additionalDiscountTotal.toFixed(2)}</span>
        </div> */}
        {/* <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#ff4d4f'
        }}>
          <span>Total All Discounts:</span>
          <span>- Rs. {totalAllDiscounts}</span>
        </div> */}
        {/* <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: '600',
          fontSize: '16px',
          color: '#3f8600'
        }}>
          <span>Final Payable Amount:</span>
          <span>Rs. { finalTotal.toFixed(2)}</span>
        </div> */}
      </div>
    );
  }}
  bordered
  columns={columns} 
  scroll={{ x: 'max-content' }}
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
  onValuesChange={handleForm1Change}
initialValues={{
    totalAmount: '0.00',
    supplierDiscount: '0.00',
    netAmount: '0.00',
    customerOldAmount: '0.00',
    totalAmountWithOld: '0.00',
    paidAmount: '0.00',
    remainingAmount: '0.00'
  }}>
             <Col gutter={[0, 0]}>
              <Form.Item name="customerId" hidden>
    <Input />
  </Form.Item>
<Row gutter={8}>
<Col span={12}> <Form.Item name="totalAmount" label="Total Amount">
        <Input disabled />
      </Form.Item></Col>
<Col span={12}>
       <Form.Item name="supplierDiscount" label="Discount">
        <InputNumber 
          
          style={{ width: '100%' }}
          min={0}
          step={1}
          precision={2}
        />
      </Form.Item>
</Col>
     
    </Row>


 

 <Row gutter={8} >
 <Col span={12}>
      <Form.Item name="netAmount" label="Net Amount">
        <Input disabled />
      </Form.Item>
      </Col>
     
      <Col span={12}>
        <Form.Item name="customerOldAmount" label="Old Amount">
        <Input disabled />
      </Form.Item>
      </Col>
    </Row>
 

<Row gutter={8}>
  <Col span={12}>
    <Form.Item name="totalAmountWithOld" label="Payable"  >
      <Input disabled />
    </Form.Item>
  </Col>

    <Col span={12}> 
      <Form.Item name="paidAmount" label="Paid Amount">
        <InputNumber 
        //   prefix="Rs:" 
          style={{ width: '100%' }}
          min={0}
          step={1}
          precision={2}
        />
      </Form.Item>
      </Col>
    </Row>

     <Row gutter={8}>
    <Col span={24}> 
      <Form.Item name="remainingAmount" label="Remaining Amount">
        <Input prefix="Rs:" disabled />
      </Form.Item>
      </Col>
    </Row>

              {showPaymentMethod && (
                <>
                <Row gutter={6} > <Col span={24} >
                <Form.Item
                  name="paymentMethodId"
                  label={`payment method - ${paymentMethodRemainingAmount}`}
                   style={{ width: '100%' }}
                    >
                  {/* <Space.Compact style={{ width: '100%' }}> */}
                    <ReusableDropdown
                      data={paymentMethod}
                      valueField="paymentMethodId" 
                      labelField="name"      
                      placeholder="Select Payment Method"
                      loading={loadingPaymentMethod}
                      style={{ width: '100%' }}
                      defaultOption={false} 
                     onChange={(paymentMethodId) => {
                        form1.setFieldsValue({ paymentMethodId });  

                      const selectedMethod = paymentMethodMap.get(paymentMethodId);
                        if (selectedMethod) {

                      setPaymentMethodRemainingAmount(selectedMethod.remaining || '');
                        } else {
                       setPaymentMethodRemainingAmount('');
                          }
                       }}
                    />
                    
                  {/* </Space.Compact> */}
                </Form.Item>
                </Col>
              </Row>
              </>
              
              )}


 

 <Row gutter={6}>
                <Col span={24}>
                 <Button 
                    key="submit"
                    type="primary"
                    onClick={handleSubmit} 
                     style={{width: '100%'}}
                    // loading={btnLoading}
                    // disabled={btnLoading}
                  >
                    Add Record
                  </Button>  </Col>
                 
              </Row>
              

            </Col>


    </Form>

    </Card>
      </Col>
 
       

    
    </Row>
  );
};

export default Sale;