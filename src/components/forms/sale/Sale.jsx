import React, { useState, useEffect,useMemo, useRef  } from 'react';
 
import {
  Card,  Table,  Form,  Input,  Button,  DatePicker,  InputNumber,  Row,  Col,  Space, 
   Select, Checkbox, Spin
} from 'antd';
import {
PrinterOutlined,
  EditOutlined,
  DeleteOutlined,
  
} from '@ant-design/icons';
import dayjs from 'dayjs';

import ReusableDropdown from '../../common/ReusableDropdown';  
import {  getBoxProduct,getNewInvoice,getPayment,getShop, getSalePrint, getCustomer, getStripProduct, createSale, getOpenInvoice } from '../../../api/API';  
import { Toaster } from '../../common/Toaster';
import CustomerModal from '../customer/CustomerModal';
import useUserId from '../../../hooks/useUserId';

import ReactToPrint from 'react-to-print';
import ThermalReceipt from '../../common/ThermalReceipt';



const Sale = () => {
  const [form] = Form.useForm();
   const [form1] = Form.useForm();
 const userId = useUserId();
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);
  const [loadingproduct, setLoadingproduct] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [product, setProducts] = useState([]);
  const [productMap, setProductMap] = useState(new Map());
  const [showCustomerModal, setShowCustomerModal] = useState(false);
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


const [invoiceNumbers, setInvoiceNumbers] = useState([]);
const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
const [loadingInvoices, setLoadingInvoices] = useState(false);
 

const [newInvChecking, setNewInvChecking] = useState();

 const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchBoxProduct();
     fetchCustomer();
    fetchInvoiceNo();
    fetchPaymentMethod();
  }, []);
  
 
useEffect(() => {
  const discountedTotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.totalAmount || item.saleItemAmount || 0);
  }, 0);

  const rounded = applyRoundOff(discountedTotal).toFixed(2);

  const allValues = form1.getFieldsValue();

  if (allValues.totalAmount !== rounded) {
    // Update totalAmount
    form1.setFieldsValue({ totalAmount: rounded });

    // Immediately update all dependent fields
    handleForm1Change({ totalAmount: rounded }, {
      ...allValues,
      totalAmount: rounded
    });
  }
}, [cartItems]);

 

const totalItemAmount = useMemo(() => {
  return cartItems.reduce((sum, item) => sum +  parseFloat(item.saleItemAmount || 0), 0).toFixed(2);
}, [cartItems]);

 
// Fetch invoice number
const fetchInvoiceNo = async () => {
  try {
    setLoadingCustomer(true);
    const invoiceNo = await getInvoiceNo();
    if (invoiceNo) {
      setNewInvoiceNo(invoiceNo);
      setNewInvChecking(invoiceNo);
      setSelectedInvoiceId(`${invoiceNo}`);
      form.setFieldsValue({ invoiceId: `${invoiceNo}` });
       
    } else {
      Toaster.warning("Error in getting Purchase No.");
    }
  } catch (err) {
    Toaster.error("Failed to load Purchase No. Please try again.");
  } finally {
    setLoadingCustomer(false);
  }
}; 


const getInvoiceNo = async () => {
  try {
    const response = await getNewInvoice();
    if (response.data && response.data > 0) {
      return response.data;
    } else {
      Toaster.warning("something went wrong in getting invoice number");
      return null;
    }
  } catch (error) {
    console.error("Error getting invoice number:", error);
    Toaster.error("error in getting invoice number");
    return null;
  }
};

const fetchInvoicesByCustomer = async (customerId) => {
  try {
    setLoadingInvoices(true);
    const response = await getOpenInvoice(customerId); 

    if (response.data && response.data.data) {
      const invoiceList = response.data.data.map(inv => ({
        value: inv.openInvoiceId || inv.saleId, 
        label: `${inv.invoiceNo} - Rs. ${inv.totalAmount}`,
        text : `${inv.invoiceNo}`,
        amount:`${inv.totalAmount}`,
    }));
      setInvoiceNumbers(invoiceList);
    
     const first = invoiceList[0];
      setSelectedInvoiceId(first.value);
      setNewInvoiceNo(first.text);
       setCustomerRemainingAmount(first.amount);
      form.setFieldsValue({ invoiceId: first.value });

    } else {
      setInvoiceNumbers([]);
      setSelectedInvoiceId(null);
      form.setFieldsValue({ invoiceId: null });
      Toaster.warning("No invoices found for this customer.");
    }
  } catch (err) {
    console.error("Error fetching invoices:", err);
    Toaster.error("Failed to load invoices.");
  } finally {
    setLoadingInvoices(false);
  }
};
 const handleSaveCustomer = () => {
  fetchCustomer(); 
    setShowCustomerModal(false);  
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
      } 
      else {
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
        const map = new Map();
        customerList.forEach(s => map.set(s.customerId, s));
        setCustomerMap(map);

        if (customerList.length > 0) {
        const firstCustomer = customerList[0];
        const { customerId, customerName, remaining = 0 } = firstCustomer;

        setCustomerName(customerName);
        setCustomerRemainingAmount(remaining);

        form1.setFieldsValue({
          customerId,
          customerOldAmount: remaining,
          paidAmount: 0,
          netAmount: totalItemAmount,
          totalAmountWithOld: (parseFloat(totalItemAmount || 0) + parseFloat(remaining || 0)).toFixed(2)
        });
      setShowPaymentMethod(false);
      fetchInvoicesByCustomer(customerId);
      }
    
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

   
const createNewInvoiceNo = async () => {
  try {
    const invoiceNo = await getInvoiceNo();

    if (!invoiceNo) {
      Toaster.warning("Could not fetch new invoice number.");
      return;
    }

    const newInvoiceValue = `${invoiceNo}`;
    const alreadyExists = invoiceNumbers.some(inv => inv.value === newInvoiceValue);
    setCustomerRemainingAmount(0);
    if (alreadyExists) {
      Toaster.info("Invoice already created.");
    } else {
      const newInvoice = {
        value: newInvoiceValue,
        label: `${invoiceNo} - Rs. 0`,
         text : newInvoiceValue,
        amount: 0,
      };
      setInvoiceNumbers(prev => [newInvoice, ...prev]);
    }

    setNewInvoiceNo(invoiceNo);
    setSelectedInvoiceId(newInvoiceValue);
    form.setFieldsValue({ invoiceId: newInvoiceValue });

  } catch (err) {
    console.error("Error creating new invoice:", err);
    Toaster.error("Failed to create new invoice number.");
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

  { title: 'Product', dataIndex: 'productName' },
  { title: 'Batch No', dataIndex: 'batchNo' },
  { title: 'Sale Rate', dataIndex: 'unitSaleRate' },
  { title: 'Discount %', dataIndex: 'discountPercent' },
  { title: 'Net Rate', dataIndex: 'finalRate' },
  { title: 'Qty', dataIndex: 'saleQuantity' },  
  { 
    title: 'Total Amount', 
    dataIndex: 'saleItemAmount',
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

    // Apply additional discount if any
    const cartWithDiscount = reapplyAdditionalDiscount(updatedCart);
    setCartItems(cartWithDiscount);

    // Calculate the new total from cart items
    const newTotal = cartWithDiscount.reduce((sum, item) => {
      return sum + parseFloat(item.saleItemAmount || 0);
    }, 0);
    
    // Apply round-off immediately
    const roundedTotal = applyRoundOff(newTotal).toFixed(2);
    
    // Update form1 with rounded total
    form1.setFieldsValue({
      totalAmount: roundedTotal
    });

    // Trigger form1 change to update all dependent fields
    handleForm1Change({}, {
      ...form1.getFieldsValue(),
      totalAmount: roundedTotal
    });
 
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
  
  // Apply additional discount if any
  const cartWithDiscount = reapplyAdditionalDiscount(updatedCart);
  setCartItems(cartWithDiscount);

  // Calculate the new total from updated cart
  const newTotal = cartWithDiscount.reduce((sum, item) => {
    return sum + parseFloat(item.totalAmount || item.saleItemAmount || 0);
  }, 0);
  
  // Apply round-off immediately
  const roundedTotal = applyRoundOff(newTotal).toFixed(2);
  
  // Update form1 with rounded total
  form1.setFieldsValue({
    totalAmount: roundedTotal
  });

  // Trigger form1 change to update all dependent fields
  handleForm1Change({}, {
    ...form1.getFieldsValue(),
    totalAmount: roundedTotal
  });
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

  
  if (changedValues.supplierDiscount !== undefined) {
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

  setShowPaymentMethod(paidAmount > 0);
};

const applyRoundOff = (amount) => {
  const numAmount = parseFloat(amount);
  const lastDigit = numAmount % 10;

  if (lastDigit < 3) {
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

const printRef = useRef();
  const [saleSummary, setSaleSummary] = useState(null);
  const [saleDetails, setSaleDetails] = useState([]);


 const handlePrint = async () => {
  try {
    // const shopInfo = await getShop();
    const newInv = parseInt(newInvChecking, 10); // or your logic
    const invno = newInv - 1;
    const invoiceData = await getSalePrint(invno); // already an object

    let printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>INVOICE ${invno}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 20px;
              color: #000;
            }
            h2, h3 {
              margin: 0;
              text-align: center;
            }
            .invoice-box {
              width: 100%;
              padding: 10px;
              border: 1px solid #000;
              margin-top: 20px;
            }
            .info {
              margin: 10px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #000;
              padding: 5px;
              text-align: left;
            }
            .totals {
              text-align: right;
              margin-top: 10px;
            }
            .signature {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          
          <h2>I.Solution</h2>
          <h3>Kabal Swat</h3>
          <div class="info">
            <p>Invoice No: ${invno}</p>
            <p>Date: ${invoiceData.date}</p>
            <p>Customer: ${invoiceData.customerName}</p>
            <p>Phone: ${invoiceData.customerPhone}</p>
          </div>
          <div class="invoice-box">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.items.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${item.rate}</td>
                    <td>${item.total}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <div class="totals">
              <p><strong>Total: ${invoiceData.totalAmount}</strong></p>
              <p>Discount: ${invoiceData.discount}</p>
              <p><strong>Grand Total: ${invoiceData.grandTotal}</strong></p>
              <p>Paid: ${invoiceData.paidAmount}</p>
              <p>Remaining: ${invoiceData.remainingAmount}</p>
            </div>
            <div class="signature">
              <p>Customer Signature: ___________________</p>
              <p>Shopkeeper Signature: ___________________</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }, 200);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();

  } catch (error) {
    console.error("Error printing invoice:", error);
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
     
    const isInvoiceOpenValue = customerIndex !== 0;



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
    setIsChecked(false);
 const saleDate = form.getFieldValue('saleDate');
const jsDate = saleDate ? saleDate.toDate() : null;


const convertedInvoiceNo = parseInt(InvoiceNo, 10); 
const isInvoiceNumberNew = convertedInvoiceNo === newInvChecking;
 
 
  
    const payload = {
      ...formData,
      customerId,
      InvoiceNo:InvoiceNo,
      totalItems : totalItems,
      totalAmount: parseFloat(formData.totalAmount),
      DiscountAmount: parseFloat(formData.supplierDiscount || 0),
      FinalAmount: parseFloat(formData.netAmount),
      // customerOldAmount: parseFloat(formData.customerOldAmount || 0),
      netPayableAmount: parseFloat(formData.netAmount),
      paidAmount,
      remaining: parseFloat(formData.remainingAmount),   
      // date: jsDate,
      date: jsDate.toISOString().split('T')[0],
      report: null,
      paymentMethodId: formData.paymentMethodId || null,
       isInvoiceNew: isInvoiceNumberNew,
       isInvoiceOpen: isInvoiceOpenValue,
      saleDetails: cartItems,
      createdBy: userId, 
    };


    console.log('Payload to be sent:', payload);
 
  await createSale(payload);

    Toaster.success('Validation successful. Ready to submit to API.');
    form1.resetFields();            
setCartItems([]);               
setCustomerRemainingAmount(0); 
setShowPaymentMethod(false);   


     fetchCustomer();
    fetchInvoiceNo();
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
                    labelField="label"     
                    value={form1.getFieldValue("customerId")}
                      placeholder="Select Customer"
                      loading={loadingCustomer}
                      style={{ width: 'calc(100% - 43px)' }}
                      defaultOption={false}                     
                    onChange={(customerId) => {
                     const selectedCustomer = customerMap.get(customerId);
                     const customerName = selectedCustomer ? selectedCustomer.customerName : "";
                    const remaining = selectedCustomer ? selectedCustomer.remaining || 0 : 0;
                    setCustomerName(customerName);

                    // setCustomerRemainingAmount(remaining);
                    fetchInvoicesByCustomer(customerId);
                    
                    form1.setFieldsValue({
                    customerId,
                    customerOldAmount: remaining,
                    paidAmount: 0,
                    netAmount: totalItemAmount,
                    totalAmountWithOld: (parseFloat(totalItemAmount || 0) + parseFloat(remaining || 0)).toFixed(2)
                      });

                setShowPaymentMethod(false);
}}

                    />
                     <Button
                               type="primary"
                               onClick={() => setShowCustomerModal(true)}
                             >
                               +
                             </Button>
                  </Space.Compact>
                </Form.Item>
              </Col>
               

 <Form.Item
  name="invoiceId"
  label="Invoice Number"
  rules={[{ required: true, message: 'Please select an invoice number' }]}
>
  <Select
    placeholder="Select Invoice"
    options={invoiceNumbers}
    loading={loadingInvoices}
    value={selectedInvoiceId}
    onChange={(value) => {
      setSelectedInvoiceId(value);
      form.setFieldsValue({ invoiceId: value });
      const selectedOption = invoiceNumbers.find(item => item.value === value);
    if (selectedOption) {
      setNewInvoiceNo(selectedOption.text);  
       setCustomerRemainingAmount(selectedOption.amount);
    } else {
      setNewInvoiceNo(''); // fallback
    }
  }}
    allowClear
  />
</Form.Item>



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
              <Form.Item
               label=" "     
               >
           <Button 
                      type="default" text=""
                       onClick={() => createNewInvoiceNo()}
                    >
                      New
                    </Button>
</Form.Item>
 
    {/* <Col span={6}>
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
              </Col> */}
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
    setProducts([]); 
        setLoadingproduct(true);
        try {
           if (checked) {
            console.log("checked");
        await fetchStripProduct();     
      } else { 
                    console.log("Unchecked");
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
       
        if (selectedProduct) {
           setRemainingQuantity(selectedProduct.remainingQuantity);
           setBatchNo(selectedProduct.batchNo);
            setMinSaleRate(selectedProduct.minimumSaleRate);
            if( isChecked) {
              var finalPurchaseRate = selectedProduct.finalPurchaseRate || 0;
              var stripPerBox = selectedProduct.stripPerBox || 0;
              finalPurchaseRate = finalPurchaseRate / stripPerBox;
              setFinalPurchaseRate(finalPurchaseRate.toFixed(2));                
            }
            else{
            setFinalPurchaseRate(selectedProduct.finalPurchaseRate);
            }

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
            onFocus={() => {
            const value = form.getFieldValue("saleDiscount");
            if (value === 0) {
                form.setFieldsValue({ saleDiscount: null });
               }
               }}
            
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
    <Input
      type="number"
      placeholder="Enter quantity"
      onFocus={() => {
        const value = form.getFieldValue("quantity");
        if (value === 1) {
          form.setFieldsValue({ quantity: null });
        }
      }}
    />
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

   
 const totalItm = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.quantity);
    }, 0);
 setTotalItems(totalItm);
    const itemLevelDiscount = (actualTotal - discountedTotal).toFixed(2);
    
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
         
      }}>
           <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          // marginBottom: '8px',
          fontWeight: '500'
        }}>
          <span>Total TIems:</span>
          <span>Rs. {totalItm.toFixed(2)}</span>
        </div>
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
    supplierDiscount: '',
    netAmount: '0.00',
    customerOldAmount: '0.00',
    totalAmountWithOld: '0.00',
    paidAmount: '',
    remainingAmount: '0.00'
  }}>
             <Col gutter={[16, 16]}>
              <Form.Item name="customerId" hidden>
    <Input />
  </Form.Item>

          

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
          placeholder="0.00"
          onFocus={() => {
            const value = form1.getFieldValue("supplierDiscount");
            if (value === 0) {
                form1.setFieldsValue({ supplierDiscount: null });
               }
               }}
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
        placeholder="0.00"
        onFocus={() => {
            const value = form1.getFieldValue("paidAmount");
            if (value === 0) {
                form1.setFieldsValue({ paidAmount: null });
               }
               }}
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
              </>
              
              )}
 

             <Row gutter={6}>
              <Col>
    <Button
      icon={<PrinterOutlined />}
     onClick={handlePrint}
    />
    <div style={{ display: 'none' }}>
        {saleSummary && (
          <ThermalReceipt ref={printRef} saleSummary={saleSummary} saleDetails={saleDetails} />
        )}
      </div>
  </Col>
  <Col flex="auto">
    <Button 
      key="submit"
      type="primary"
      onClick={handleSubmit} 
      style={{ width: '100%' }}
      loading={loadingSave}
      disabled={loadingSave}
    >
      {loadingSave ? <Spin /> : 'Add Record'}
    </Button>
  </Col>

  
</Row>
           


            </Col>


    </Form>

    </Card>
      </Col>
 
         <CustomerModal
               visible={showCustomerModal}
               title="Add Customer"
               button="Add Customer"
               onCancel={() => setShowCustomerModal(false)}
               onSave={handleSaveCustomer}
               setIsModalVisible={setShowCustomerModal}
               centered={false}
               destroyOnClose={true}
               footer={null} 
             />

    
    </Row>
  );
};

export default Sale;