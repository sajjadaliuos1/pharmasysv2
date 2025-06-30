 import React, { useState, useEffect,useMemo, useRef  } from 'react';
 
import {
  Card,  Table,  Form,  Input,  Button,  DatePicker,  InputNumber,  Row,  Col,  Space, 
   Select, Checkbox, Spin
} from 'antd';
import {

  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import ReusableDropdown from '../../common/ReusableDropdown';  
import {  getBoxProduct,getSalebyInvoice,getPayment, getCustomer, getStripProduct, createSale } from '../../../api/API';  
import { Toaster } from '../../common/Toaster';
 


const SaleReturn = () => {
  const [form] = Form.useForm();
   const [form1] = Form.useForm();
      const [formSearch] = Form.useForm();
 
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);
  const [loadingproduct, setLoadingproduct] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
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


   const [customerName, setCustomerName] = useState('');
  const [paymentMethodMap, setPaymentMethodMap] = useState(new Map());

    const [paymentMethodRemainingAmount, setPaymentMethodRemainingAmount] = useState('');
  const [InvoiceNo, setNewInvoiceNo] = useState([]);
  

   const [cartItems, setCartItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); 
const [customerRemainingAmount, setCustomerRemainingAmount] = useState('');
  

const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  useEffect(() => {
    fetchBoxProduct();
     fetchCustomer();    
    fetchPaymentMethod();
  }, []);
 
  
const totalItemAmount = useMemo(() => {
  return cartItems.reduce((sum, item) => sum +  parseFloat(item.saleItemAmount || 0), 0).toFixed(2);
}, [cartItems]);

 
 
const handleSearch = async () => {
  try {
    const formData = await formSearch.validateFields();
    const invoiceNo = parseInt(formData.search, 10);

    if (isNaN(invoiceNo)) {
      Toaster.error('Invalid invoice number');
      return;
    }

    const result = await getSalebyInvoice(invoiceNo);
    console.log("Get Record against Inv No", result);

    if (!result.data || result.data.status !== "Success") {
      Toaster.error("No record found for this invoice number.");
      return;
    }

    const saleData = result.data.data;

    // 1. Set values to the form
    form1.setFieldsValue({
      customerId: saleData.customerId,
      CustomerName: saleData.customerName,
      totalAmount: saleData.totalAmount?.toFixed(2),
      supplierDiscount: saleData.discountAmount?.toFixed(2),
      netAmount: saleData.finalAmount?.toFixed(2),
      customerOldAmount: saleData.customerOldAmount?.toFixed(2),
      totalAmountWithOld: (saleData.finalAmount + saleData.customerOldAmount).toFixed(2),
      paidAmount: saleData.paidAmount?.toFixed(2),
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
    const mappedTableData = saleDetails.map((item, index) => ({
  key: index,
  productName: item.productName,
  batchNo: item.purchaseInventoryId,
  unitSaleRate: item.unitSaleRate,
  discountPercent: item.discountPercent,
  finalRate: item.afterDiscountAmount,
  saleQuantity: item.netQuantity,
  finalAmount: item.netAmount
}));

    setCartItems(mappedTableData); 

    Toaster.success("Record loaded successfully");

  } catch (error) {
    console.error("Error submitting form:", error);
    Toaster.error("Please fill all required fields.");
  }
};

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
  { title: 'Product', dataIndex: 'productName' },
  { title: 'Batch No', dataIndex: 'batchNo' },
  { title: 'Sale Rate', dataIndex: 'unitSaleRate' },
  { title: 'Discount %', dataIndex: 'discountPercent' },
  { title: 'Net Rate', dataIndex: 'finalRate' },
  { title: 'Qty', dataIndex: 'saleQuantity' },
  {
    title: 'Amount',
    dataIndex: 'finalAmount',
    render: (value) => `Rs. ${parseFloat(value || 0).toFixed(2)}`
  },
];




const calculateRoundOffAndProfit = (items) => {
  if (!items || items.length === 0) return items;

  const totalFinalAmount = items.reduce((sum, item) => {
    return sum + parseFloat(item.finalAmount || item.saleItemAmount || 0);
  }, 0);

  const roundedTotal = applyRoundOff(totalFinalAmount);
  const roundOffDifference = roundedTotal - totalFinalAmount;
  
  const totalItems = items.length;
  const roundOffPerItem = totalItems > 0 ? roundOffDifference / totalItems : 0;

  return items.map(item => {
    const finalAmount = parseFloat(item.finalAmount || item.saleItemAmount || 0);
    const purchaseRate = parseFloat(item.unitPurchaseRate || 0);
    const quantity = parseFloat(item.saleQuantity || 0);
    
    const totalProfit = (finalAmount + roundOffPerItem) - (purchaseRate * quantity);

    return {
      ...item,
      roundOffAmount: roundOffPerItem,
      profit: totalProfit
    };
  });
};

 

 const calculateAdditionalDiscountByRate = (cartItems, totalDiscount) => {
  if (!totalDiscount || totalDiscount <= 0) {
    const itemsWithoutDiscount = cartItems.map(item => {
      const finalRate = parseFloat(item.finalRate || 0);
      const afterDiscountAmount = finalRate; 
      
      return {
        ...item,
        additionalDiscount: 0,
        singleItemDiscount: 0,
        afterDiscountAmount: afterDiscountAmount,
        afterFinalDiscountAmount: afterDiscountAmount, 
        finalAmount: parseFloat(item.saleItemAmount || 0)
      };
    });
    
    return calculateRoundOffAndProfit(itemsWithoutDiscount);
  }

  const totalWeightedAmount = cartItems.reduce((sum, item) => {
    const rate = parseFloat(item.unitSaleRate || 0);
    const quantity = parseFloat(item.saleQuantity || 0);
    return sum + (rate * quantity);
  }, 0);

  let remainingDiscount = totalDiscount;
  const updatedItems = cartItems.map((item, index) => {
    const rate = parseFloat(item.unitSaleRate || 0);
    const quantity = parseFloat(item.saleQuantity || 0);
    const finalRate = parseFloat(item.finalRate || 0);
    const weightedAmount = rate * quantity;
    let itemDiscount;
    
    if (index === cartItems.length - 1) {
      itemDiscount = remainingDiscount;
    } else {
      const discountRatio = weightedAmount / totalWeightedAmount;
      itemDiscount = totalDiscount * discountRatio;
      remainingDiscount -= itemDiscount;
    }
    
    const singleItemDiscount = quantity > 0 ? itemDiscount / quantity : 0;
    
    const afterDiscountAmount = finalRate;
    
    const afterFinalDiscountAmount = Math.max(0, afterDiscountAmount - singleItemDiscount);
    
    const itemTotal = parseFloat(item.saleItemAmount || 0);
    const finalAmount = Math.max(0, itemTotal - itemDiscount);
    
    return {
      ...item,
      additionalDiscount: itemDiscount,
      singleItemDiscount: singleItemDiscount,
      afterDiscountAmount: afterDiscountAmount,
      afterFinalDiscountAmount: afterFinalDiscountAmount,
      finalAmount: finalAmount
    };
  });

  return calculateRoundOffAndProfit(updatedItems);
};


const handleValuesChange = (changedValues, allValues) => {
  const saleRate = parseFloat(allValues.unitSaleRate || allValues.saleRate || 0);
  const discount = parseFloat(allValues.discountPercent || allValues.saleDiscount || 0);
  const quantity = parseFloat(allValues.saleQuantity || allValues.quantity || 0);
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
    const enteredQuantity = parseFloat(values.saleQuantity || values.quantity ||  0);
    const unitSaleRate = parseFloat(values.unitSaleRate || values.saleRate || 0);
    const discountPercent = parseFloat(values.discountPercent || values.saleDiscount || 0);
    const finalRate = unitSaleRate - (unitSaleRate * discountPercent / 100);
    const saleItemAmount = finalRate * enteredQuantity;

    if (enteredQuantity > remainingQuantity) {
      Toaster.error(`Entered quantity (${enteredQuantity}) exceeds remaining quantity (${remainingQuantity}).`);
      return;
    }

    if (finalRate < parseFloat(minSaleRate)) {
      Toaster.error(`Final Rate must not be less than Min Sale Rate (Rs. ${minSaleRate})`);
      return;
    }

    const selectedProduct = productMap.get(values.purchaseInventoryId);

    console.log("cart Items === ", cartItems);
    let updatedCart;

    if (editingIndex !== null) {
     // on Edit
      updatedCart = [...cartItems];
      updatedCart[editingIndex] = {
        ...values,
        purchaseInventoryId: values.purchaseInventoryId,
        productId: selectedProduct?.productId ?? '',
        unitSaleRate,
        discountPercent,
        productName: selectedProduct?.productName ?? '',
        saleQuantity : enteredQuantity,
        isStrip: isChecked,        
        UnitPurchaseRate: finalPurchaseRate,
        unitPurchaseRate: finalPurchaseRate,  
        batchNo: BatchNo,  
        finalRate: finalRate.toFixed(2),  
        saleItemAmount: saleItemAmount.toFixed(2),
        afterDiscountAmount: finalRate,
        afterFinalDiscountAmount: finalRate,
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
        const updatedQuantity = parseFloat(existingItem.saleQuantity || 0) + enteredQuantity;
        const updatedTotal = finalRate * updatedQuantity;
        
        updatedCart[existingIndex] = {
          ...existingItem,
          saleQuantity: updatedQuantity,          
          unitSaleRate,
          discountPercent,
          finalRate: finalRate.toFixed(2),
          saleItemAmount: updatedTotal.toFixed(2),
          batchNo: BatchNo,
          remainingQuantity,
          // saleQuantity : enteredQuantity,
          isStrip: isChecked,
          afterDiscountAmount: finalRate,
          afterFinalDiscountAmount: finalRate,
        };
      } else {
        const newItem = {
          ...values,
          purchaseInventoryId: values.purchaseInventoryId,
          productId: selectedProduct?.productId ?? '',
          unitSaleRate,
          discountPercent,
          productName: selectedProduct?.productName ?? '',
          unitPurchaseRate: finalPurchaseRate,
          batchNo: BatchNo,          
          remainingQuantity,
          saleQuantity : enteredQuantity,
          finalRate: finalRate.toFixed(2),
          saleItemAmount: saleItemAmount.toFixed(2),
          isStrip: isChecked,      
          afterDiscountAmount: finalRate,
          afterFinalDiscountAmount: finalRate,
        };
        updatedCart = [...cartItems, newItem];
      }
    }

      const cartWithDiscount = reapplyAdditionalDiscount(updatedCart);
    setCartItems(cartWithDiscount);

     setTimeout(() => {
      const newTotal = updatedCart.reduce((sum, item) => {
        return sum + parseFloat(item.saleItemAmount || 0);
      }, 0);
      
      form1.setFieldsValue({
        totalAmount: newTotal.toFixed(2)
      });

     
      handleForm1Change({}, {
        ...form1.getFieldsValue(),
        totalAmount: newTotal.toFixed(2)
      });
    }, 0);
 
   form.resetFields([
  'saleDate',
  'purchaseInventoryId',
  'saleRate',
  'saleDiscount',
  'finalRate',
  'quantity',
  'totalAmount'
]);


    setSelectedPurchaseInventoryId(null);
    setRemainingQuantity(0);
    setBatchNo('');
    setEditingIndex(null);
    setMinSaleRate('');
    setFinalPurchaseRate('');
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
    unitSaleRate: item.unitSaleRate,
    discountPercent: item.discountPercent,
    finalRate: item.finalRate,
    saleQuantity: item.saleQuantity,
    saleItemAmount: item.saleItemAmount,
    
  });
  
 
  const product = productMap.get(item.purchaseInventoryId);
  setRemainingQuantity(product?.remainingQuantity || 0);
  setFinalPurchaseRate(product?.finalPurchaseRate || 0);
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

  const itemsWithoutDiscount = updatedCart.map(item => {
    const finalRate = parseFloat(item.finalRate || 0);
    
    return {
      ...item,
      additionalDiscount: 0,
      singleItemDiscount: 0,
      afterDiscountAmount: finalRate,
      afterFinalDiscountAmount: finalRate,
      finalAmount: parseFloat(item.totalAmount || 0)
    };
  });
  
  return calculateRoundOffAndProfit(itemsWithoutDiscount);
};


const handleForm1Change = (changedValues, allValues) => {
  const additionalDiscount = parseFloat(allValues.supplierDiscount || 0);
  const paidAmount = parseFloat(allValues.paidAmount || 0);
  const totalAmount = parseFloat(allValues.totalAmount || totalItemAmount || 0);
  const oldCustomerAmount = parseFloat(customerRemainingAmount || 0);

  const netAmount = Math.max(0, totalAmount - additionalDiscount);
  const finalTotal = netAmount + oldCustomerAmount;
  const remaining = Math.max(0, finalTotal - paidAmount);

  
//   if (changedValues.supplierDiscount !== undefined) {
//     const updatedCartItems = calculateAdditionalDiscountByRate(cartItems, additionalDiscount);
//     setCartItems(updatedCartItems); 
//   }

  setTimeout(() => {
    form1.setFieldsValue({
      netAmount: netAmount.toFixed(2),
      customerOldAmount: oldCustomerAmount.toFixed(2),
      totalAmountWithOld: finalTotal.toFixed(2),
      remainingAmount: remaining.toFixed(2)
    });
  }, 0);

  setShowPaymentMethod(paidAmount > 0);
};

const applyRoundOff = (amount) => {
  const numAmount = parseFloat(amount);
  const lastDigit = numAmount % 10;

  if (lastDigit < 5) {
    return Math.floor(numAmount / 10) * 10;
  } else {
    return Math.ceil(numAmount / 10) * 10;
  }
 
};

const reportJson = (date, total,discount,net,old,payable,paid,remaining) => {
  return {
  invoiceNo: InvoiceNo,
  date: date,
  customer: customerName,
  tableData: cartItems.map(item => {
    const quantity = parseFloat(item.saleQuantity || 0);
    const saleRate = parseFloat(item.unitSaleRate || 0);
    const discountPercent = parseFloat(item.discountPercent || 0);
    const discountAmount = (saleRate * discountPercent) / 100;
    const netRate = saleRate - discountAmount;

    return {
      status: "S",
      productName: item.productName || "N/A",
      uom: item.uom || "-", // Add this only if your item has a uom field
      saleRate: saleRate.toFixed(2),
      quantity: quantity,
      discountPercent: discountPercent,
      discount: discountAmount.toFixed(2),
      totalAmount: (saleRate * quantity).toFixed(2),
      netAmount: (netRate * quantity).toFixed(2)
    };
  }),
  paymentInfo: {
    totalAmount: parseFloat(total),
    discount: parseFloat(discount),
    netAmount:parseFloat(net),
    oldAmount: parseFloat(old || 0),
    payableAmount: parseFloat(payable),
    paidAmount: parseFloat(paid || 0),
    remainingAmount: parseFloat(remaining)
  }
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
    const payableAmount = parseFloat(formData.totalAmountWithOld || 0);
    
    const customerIndex = customers.findIndex(c => c.customerId === customerId);

    if (customerIndex === 0 && paidAmount < payableAmount) {
      Toaster.error('Customer must pay full amount if selected as the first record.');
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


  
    if (paidAmount > payableAmount) {
      Toaster.error('Paid amount cannot be greater than payable amount');
      return;
    }
    
    if (showPaymentMethod && !formData.paymentMethodId) {
      Toaster.error('Please select a payment method');
      return;
    }

    setLoadingSave(true);

 const saleDate = form.getFieldValue('saleDate');
const jsDate = saleDate ? saleDate.toDate() : null;


const jsonReport = reportJson(jsDate,parseFloat(formData.totalAmount),
parseFloat(formData.supplierDiscount || 0),
parseFloat(formData.netAmount),parseFloat(formData.customerOldAmount || 0), payableAmount,paidAmount,
parseFloat(formData.remainingAmount));
 
  
    const payload = {
      ...formData,
      customerId,
      InvoiceNo:InvoiceNo,
      totalItems : cartItems.length,
      totalAmount: parseFloat(formData.totalAmount),
      DiscountAmount: parseFloat(formData.supplierDiscount || 0),
      FinalAmount: parseFloat(formData.netAmount),
      customerOldAmount: parseFloat(formData.customerOldAmount || 0),
      netPayableAmount: parseFloat(formData.totalAmountWithOld),
      paidAmount,
      remaining: parseFloat(formData.remainingAmount),   
      date: jsDate,
      report: JSON.stringify(jsonReport),
      paymentMethodId: formData.paymentMethodId || null,
      saleDetails: cartItems,
    };
  await createSale(payload);



    Toaster.success('Validation successful. Ready to submit to API.');
    form1.resetFields();            
setCartItems([]);               
setCustomerRemainingAmount(0); 
setShowPaymentMethod(false);   
     fetchCustomer();    
    fetchPaymentMethod();

stripProductCache.current = null;
boxProductCache.current = null;
if (isChecked) {
  await fetchBoxProduct();
} else {
  await fetchStripProduct();
}
    setLoadingSave(false);
  } catch (error) {
    setLoadingSave(false);
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
  <Col span={6} style={{ display: 'flex', alignItems: 'end' }}>
    <Button 
      type="primary" 
      htmlType="button" 
      style={{ width: '100%' }} 
      onClick={handleSearch}  
    >
      Search Record
    </Button>
  </Col>
</Row>
            </Form>

        <Form
            form={form}
            layout="vertical"
            name="sale_form"
            onFinish={handleAddOrUpdate}
            onValuesChange={(changedValues, allValues) => {
              handleValuesChange(changedValues, allValues);
            }}            
                >     
 
 
               
             
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
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          // marginBottom: '8px',
          fontWeight: '500'
        }}>
          <span>Actual Sale Total (Before Any Discount):</span>
          <span>Rs. {actualTotal.toFixed(2)}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
        
          fontWeight: '500',
          color: '#ff4d4f'
        }}>
          <span>Item Level Discount:</span>
          <span>- Rs. {itemLevelDiscount}</span>
        </div>
         
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: '600',
          fontSize: '16px',
          color: '#3f8600'
        }}> 
          <span>Final Payable Amount:</span>
          <span>Rs. { finalTotal.toFixed(2)}</span>
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
             <Col gutter={[16, 16]}>
              <Form.Item name="customerId" hidden>
    <Input />
  </Form.Item>

           <Col span={12}>
               <Form.Item
    name="CustomerName" 
    label="Customer Name"
    rules={[{ required: true, message: 'Customer Name required' }]}
  >
    <Input type="text"
    disabled
     placeholder="Customer Name" />
  </Form.Item>  
              </Col>

<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
  <Col span={6}>
    <label>Total Amount</label>
  </Col>
  <Col span={18}>
    <Form.Item name="totalAmount" noStyle>
      <Input disabled />
    </Form.Item>
  </Col>
</Row>


 
     
     <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
  <Col span={6}>
    <label>Discount</label>
  </Col>
  <Col span={18}>
    <Form.Item name="supplierDiscount" noStyle>
      <InputNumber           
        style={{ width: '100%' }}
        min={0}
        step={1}
        precision={2}
        //   onFocus={() => {
        //     const value = form1.getFieldValue("supplierDiscount");
        //     if (value === 0) {
        //         form1.setFieldsValue({ supplierDiscount: null });
        //        }
        //        }}
      />
    </Form.Item>
  </Col>
</Row> 
     
<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
  <Col span={6}>
    <label >Net Amount</label>
  </Col>
  <Col span={18}>
    <Form.Item name="netAmount" noStyle>
      <Input disabled />
    </Form.Item>
  </Col>
</Row>


      
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
  <Col span={6}>
    <label>Old Amount</label>
  </Col>
  <Col span={18}>
    <Form.Item name="customerOldAmount" noStyle>
      <Input disabled />
    </Form.Item>
  </Col>
</Row>

     
  
<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
  <Col span={6}>
    <label>Payable</label>
  </Col>
  <Col span={18}>
    <Form.Item name="totalAmountWithOld" noStyle>
      <Input disabled />
    </Form.Item>
  </Col>
</Row>


 

<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
  <Col span={6}>
    <label >Paid Amount</label>
  </Col>
  <Col span={18}>
    <Form.Item name="paidAmount" noStyle>
      <InputNumber
        style={{ width: '100%' }}
        min={0}
        step={1}
        precision={2}
      />
    </Form.Item>
  </Col>
</Row>

    
     <Row gutter={8} align="middle" style={{ marginBottom: 16 }}>
  <Col span={6}>
    <label>Remaining Amount</label>
  </Col>
  <Col span={18}>
    <Form.Item name="remainingAmount" noStyle>
      <Input prefix="Rs:" disabled />
    </Form.Item>
  </Col>
</Row>


              {showPaymentMethod && (
                <>
                <Row gutter={6} > <Col span={24} >
                <Form.Item
                  name="paymentMethodId"
                  label={`Payment Method - ${paymentMethodRemainingAmount}`}
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
                     loading={loadingSave}
                     disabled={loadingSave}
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

export default SaleReturn;