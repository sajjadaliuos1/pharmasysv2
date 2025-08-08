import React, { useState, useEffect,useMemo  } from 'react';
 
import {
  Card,  Table,  Form,  Input,  Button,  DatePicker,  InputNumber,  Row,  Col,  Space,  message,
  Typography,Spin
} from 'antd';
import {
  
  EditOutlined,
   DeleteOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Toaster } from "../../common/Toaster";
import ProductModal from '../product/ProductModal'; // Assuming correct path
import ReusableDropdown from '../../common/ReusableDropdown'; // Assuming correct path
import { purchaseOrder, getSuppliers,getPurchaseNo,getPurchaseProduct,getPayment } from '../../../api/API'; // Assuming correct API functions
import SupplierListModal from '../suppliers/SupplierListModal'; // Assuming correct path
 import PaymentModal from '../../setting/paymentMethod/PaymentModol';
const { RangePicker } = DatePicker;
const { Text } = Typography;
const PurchaseItem = () => {
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSuppliersModal, setShowSuppliersModal] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);
  const [loadingproduct, setLoadingproduct] = useState(false);
  const [product, setProducts] = useState([]);
  const [productMap, setProductMap] = useState(new Map());
  const [isProductStrip, setIsProductStrip] = useState(false);
   
  const [productBarcode, setProductBarcode] = useState('');
  const [stripPerBox, setStripPerBox] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
 
  
  const [suppliers, setSuppliers] = useState([]);
   const [paymentMethod, setPaymentMethod] = useState([]);
  const [supplierMap, setSupplierMap] = useState(new Map());
  const [paymentMethodMap, setPaymentMethodMap] = useState(new Map());
const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethodRemainingAmount, setPaymentMethodRemainingAmount] = useState('');
  const [purchaseNo, setPurchaseNo] = useState([]);
    const [calculatedValues, setCalculatedValues] = useState({
    finalPurchaseRate: 0,
    finalSaleRate: 0,
    finalStripRate: 0,    
  });


   const [cartItems, setCartItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
 const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
const [supplierRemainingAmount, setSupplierRemainingAmount] = useState('');
const [netAmount, setNetAmount] = useState(0);
const [totalAmount, setTotalAmount] = useState(0);

const [remainingAmount, setRemainingAmount] = useState(0);
const [showPaymentMethod, setShowPaymentMethod] = useState(false);

const [purchaseDate, setPurchaseDate] = useState(dayjs());
  useEffect(() => {
    fetchProduct();
    fetchSuppliers();
    fetchPurchaseNo();
    fetchPaymentMethod();
  }, []);
 
useEffect(() => {
  // Run calculation only when supplierRemainingAmount is updated
  const values = form1.getFieldsValue();

  const purchaseAmount = totalPurchaseAmount;  
  const discount = parseFloat(values.supplierDiscount) || 0;
  const paidAmount = parseFloat(values.paidAmount) || 0;
  const supplierRemaining = parseFloat(supplierRemainingAmount) || 0;

  const netAmount = purchaseAmount - discount;
  const totalAmount = netAmount + supplierRemaining;
  const remainingAmount = totalAmount - paidAmount;

  setNetAmount(netAmount);
  setTotalAmount(totalAmount);
  setRemainingAmount(remainingAmount);

  setShowPaymentMethod(paidAmount > 0); 
}, [supplierRemainingAmount, totalPurchaseAmount]);

  const calculatetotalPurchaseAmount = (items) => {
  return items.reduce((sum, item) => {
    const rate = parseFloat(item.totalPurchaseAmount) || 0;   
    return sum + rate;
  }, 0);
};



const perStripRateLabel = useMemo(() => {
  return `Strip Rate : ${stripPerBox || ''}`;
}, [stripPerBox]);

 
useEffect(() => {
  form.setFieldsValue({
    minSaleRate: calculatedValues.finalSaleRate,   
  });
}, [calculatedValues.finalSaleRate]);



const handleValuesChange = (changedValues, allValues) => { 
  if ('saleDiscount' in changedValues) {
    form.setFieldsValue({
      stripDiscount: changedValues.saleDiscount
    });
  }

 if (changedValues.manufactureDate) {
    const manufactureDate = dayjs(changedValues.manufactureDate);

    const expiryNotification = manufactureDate.add(1, 'year').add(9, 'months');
    const expireDate = manufactureDate.add(2, 'year');

    form.setFieldsValue({
      dates: [expiryNotification, expireDate]
    });
  }

  if (changedValues.purchaseRate !== undefined || changedValues.purchaseDiscount !== undefined  || changedValues.purchaseAmount !== undefined || changedValues.quantity !== undefined) {
    handlePurchaseChange(allValues);
  }
  if (changedValues.saleRate !== undefined || changedValues.saleDiscount !== undefined) {
 
    handleSaleChange(allValues);      
  }

  if(changedValues.perStripRate != undefined || changedValues.stripDiscount !== undefined){
    handleStripRateChange(allValues);
  }
  
};
     const handlePurchaseChange = (allValues) => {
  const purchaseRate = parseFloat(allValues.purchaseRate) || 0;
  const discount1 = parseFloat(allValues.purchaseDiscount) || 0;
  const discount2 = parseFloat(allValues.purchaseAmount) || 0;
  const quantity = parseFloat(allValues.quantity) || 0;

  // Apply first discount
  const afterFirstDiscount = purchaseRate - (purchaseRate * discount1) / 100;

  // Apply second discount on the discounted value
  const finalRate = afterFirstDiscount - (afterFirstDiscount * discount2) / 100;

  const roundedFinalRate = parseFloat(finalRate.toFixed(2));
  const totalPurchaseAmount = parseFloat((quantity * roundedFinalRate).toFixed(2));

  setCalculatedValues(prev => ({
    ...prev,
    finalPurchaseRate: roundedFinalRate,
  }));

  form.setFieldsValue({
    finalPurchaseRate: roundedFinalRate,
    totalPurchaseAmount: totalPurchaseAmount,
  });
};

 
    const handleSaleChange = (allValues) => {
   
    const saleRate = parseFloat(allValues.saleRate) || 0;
    const saleDiscount = allValues.saleDiscount === null || allValues.saleDiscount === undefined ? 0 : parseFloat(allValues.saleDiscount);

    
    const discount = Math.min(saleDiscount, 100);

    const discountAmount = (saleRate * discount) / 100;
    const finalRate = parseFloat((saleRate - discountAmount).toFixed(2));

    const perStriprateCalculated = allValues.saleRate / stripPerBox || 0;
    
    const stripDiscount = parseFloat(discount) || 0;

      
   const aaa = isProductStrip
  ? parseFloat((perStriprateCalculated - (perStriprateCalculated * stripDiscount) / 100).toFixed(2))
  : 0; 

     const purchasePrice = allValues.saleRate;
   
     const perRate = purchasePrice / stripPerBox;
 
         
    setCalculatedValues(prev => ({
      ...prev,
      finalSaleRate: finalRate,
      perStripRate : perRate,
      finalStripRate: aaa,

    }));
 
    form.setFieldValue('finalSaleRate', finalRate);        
    form.setFieldValue('perStripRate', perRate);
    form.setFieldValue('finalStripRate', aaa);
    form.setFieldValue('minStripSaleRate', aaa);


     };

 
     const handleStripRateChange = (allValues) => {    
  const stripRate = allValues.perStripRate || 0;
  const stripDiscount = allValues.stripDiscount === null || allValues.stripDiscount === undefined
    ? 0
    : parseFloat(allValues.stripDiscount);

  // Store original strip rate in state/form if needed
  form.setFieldValue('stripRate', stripRate);

  // Calculate discounted rate
  const discountedRate = isProductStrip ? (stripRate - (stripRate * stripDiscount) / 100) : 0;

  // Update state and form values
  setCalculatedValues(prev => ({
    ...prev,
    finalStripRate: discountedRate,
    stripRate: stripRate  // Save strip rate too
  }));

  form.setFieldValue('finalStripRate', discountedRate);
  form.setFieldValue('minStripSaleRate', discountedRate);   
};


const handleValuesChange2 = (changedValues, allValues) => {
   const values = form1.getFieldsValue();


  const purchaseAmount = totalPurchaseAmount;  
  const discount = parseFloat(values.supplierDiscount) || 0;
    const paidAmount = parseFloat(values.paidAmount) || 0;
  const supplierRemaining = parseFloat(supplierRemainingAmount) || 0;

  const netAmount = purchaseAmount - discount;
  const totalAmount = netAmount + supplierRemaining;
  const remainingAmount = totalAmount - paidAmount;


  setNetAmount(netAmount);
  setTotalAmount(totalAmount);
  setRemainingAmount(remainingAmount);
 

  setShowPaymentMethod(paidAmount > 0); 
};

 const fetchPurchaseNo = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await getPurchaseNo();
 
      if (response.data > 0 ) {
          const purchaseNo = response.data;
               setPurchaseNo(purchaseNo);
      } else {
        message.warn("Error in getting Purchase No.");
      }
    } catch (err) {
      
      message.error("Failed to load Purchase No. Please try again.");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  
  const fetchProduct = async () => {
    try {
      setLoadingproduct(true);
      const response = await getPurchaseProduct();
      if (response.data && response.data.data) {
const productList = response.data.data;
setProducts(productList);
      
      // ////// use for dropdown to get record in fast....
         const map = new Map();
        productList.forEach(s => map.set(s.productId, s));
         setProductMap(map);
        
      } else {
        message.warn("No product found or unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      message.error("Failed to load product. Please try again.");
    } finally {
      setLoadingproduct(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await getSuppliers();
       if (response.data && response.data.data) {
         const supplierList = response.data.data;
      setSuppliers(supplierList);

      ////// use for dropdown to get record in fast....
        const map = new Map();
        supplierList.forEach(s => map.set(s.supplierId, s));
        setSupplierMap(map);
    
      } else {
        message.warn("No suppliers found or unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      message.error("Failed to load suppliers. Please try again.");
    } finally {
      setLoadingSuppliers(false);
    }
  };

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
    
        if (paymentList.length > 0) {
        const firstItem = paymentList[0];
        form1.setFieldsValue({ paymentMethodId: firstItem.paymentMethodId });
        setPaymentMethodRemainingAmount(firstItem.remaining || '');
      }
      } else {
        message.warn("No payment Method found or unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      message.error("Failed to load suppliers. Please try again.");
    } finally {
      setLoadingPaymentMethod(false);
    }
  };

   

  const handleSaveProduct = async (newProduct) => {
    setShowProductModal(false);
    await fetchProduct();
    Toaster.success("Added Successfully")
  };

  const handleSaveSupplier = () => {
    fetchSuppliers(); 
    setShowSuppliersModal(false);
  };


  const handleSavePayment = () => {
      fetchPaymentMethod(); 
    setShowPaymentModal(false);  
  };
 

    const handleBarcodeEnter = (e) => {
  if (e.key === 'Enter') {
    const enteredBarcode = e.target.value.trim();
    const matchedProduct = product.find(p => p.barcode === enteredBarcode);

    if (matchedProduct) {
      const selectedProduct = matchedProduct; 
      setSelectedProductId(selectedProduct.productId);
       setIsProductStrip(selectedProduct.isStrip || false);
      setProductBarcode(selectedProduct.barcode || '');
      setStripPerBox(selectedProduct.stripPerBox || '');
    } else {
      message.error('Product not found for this barcode');
    }
  }
    };

  const startDate = dayjs().add(6, 'month').startOf('month');  
  const endDate = startDate.add(3, 'month');  

 const handleAddOrUpdate = (values) => {
 
  const formattedNotificationDate = values.dates?.[0]
    ? values.dates[0].format("YYYY-MM-DD")
    : null;

  const formattedExpireDate = values.dates?.[1]
    ? values.dates[1].format("YYYY-MM-DD")
    : null;

  const formattedManufactureDate = values.manufactureDate
    ? values.manufactureDate.format("YYYY-MM-DD")
    : null;

  const newItem = {
    ...values,
    manufactureDate: formattedManufactureDate,
    expiryDate: formattedExpireDate,
    purchaseDiscountPercent: values.purchaseDiscount || 0,
    purchaseDiscountAmount:values.purchaseAmount || 0,
    totalPurchaseAmount : values.totalPurchaseAmount,
    minimumSaleRate: values.minSaleRate || 0,
    stripRate: !isFinite(values.perStripRate) ? 0 : values.perStripRate,
    minimumStripRate: values.minStripSaleRate || 0,
    remainingOpenStrip: 0,
    remainingQuantity: values.quantity || 0,
    saleDiscountPercent: values.saleDiscount || 0,
    stripDiscountPercent: values.stripDiscount || 0, 
    expiryNotification: formattedNotificationDate,
    purchaseQuantity: values.quantity || 0,
    productId: selectedProductId,
    barcode: productBarcode,
    isStrip: isProductStrip,
    stripPerBox,
    productName: productMap.get(selectedProductId)?.productName || '',
  };
 
  
  setCartItems((prev) => {
  const index = prev.findIndex(item => item.productId === selectedProductId);
  let updatedItems;

  if (index !== -1) {       
    updatedItems = [...prev];
    updatedItems[index] = newItem;
  } else {    
    updatedItems = [...prev, newItem];
  }


  const total = calculatetotalPurchaseAmount(updatedItems);

  setTotalPurchaseAmount(total);  

  return updatedItems;
});


  form.resetFields();
  form.setFieldsValue({
    manufactureDate: dayjs(),
    dates: [startDate, endDate],
    isSoldInStrips: false,
    purchaseDiscount: 0,
    purchaseAmount: 0,
    saleDiscount: 0,
    stripDiscount: null,
    finalPurchaseRate: 0,
    finalSaleRate: 0,
    finalStripRate: 0,
  });
  setSelectedProductId(null);
  setProductBarcode('');
  setIsProductStrip(false);
  setStripPerBox('');
  setEditingIndex(null);
};

  const handleEdit = (index) => {
    const item = cartItems[index];
     setSelectedProductId(item.productId);
      const selectedProduct = productMap.get(item.productId);
  if (selectedProduct) {
    setStripPerBox(selectedProduct.stripPerBox || '');
  } else {
    setStripPerBox('');
  }
  const format = "YYYY-MM-DD";
    form.setFieldsValue({
      purchaseRate: item.purchaseRate,
      saleRate: item.saleRate,
      productId: item.productId,
      batchNo: item.batchNo,
      quantity: item.quantity,
   
      manufactureDate: item.manufactureDate
      ? dayjs(item.manufactureDate, format)
      : null,

      dates: item.expiryNotification && item.expiryDate
      ? [
          dayjs(item.expiryNotification, format),
          dayjs(item.expiryDate, format)
        ]
      : [],

      saleDiscount: item.saleDiscount,
      purchaseDiscount: item.purchaseDiscount,
      purchaseAmount: item.purchaseAmount,
      finalPurchaseRate: item.finalPurchaseRate,
      finalSaleRate: item.finalSaleRate,
      totalPurchaseAmount : item.totalPurchaseAmount,
      finalStripRate: item.finalStripRate,
      stripDiscount: item.stripDiscount,
      minSaleRate: item.minSaleRate,
      minStripSaleRate: item.minStripSaleRate,
      barcode: item.barcode,      
      isSoldInStrips: item.isStrip || false,
      perStripRate: item.perStripRate || '',
      stripPerBox: item.stripPerBox || '',
      productName: item.productName || '',
    });
   
    setProductBarcode(item.barcode);
    // setStripPerBox(item.stripPerBox);
    setIsProductStrip(item.isStrip || false); 
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updatedItems = [...cartItems];
    updatedItems.splice(index, 1);
    setCartItems(updatedItems);
    message.success('Item deleted!');
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
    // { title: 'Product Id', dataIndex: 'productId'},
      { title: 'Product', dataIndex: 'productName' },
    { title: 'Batch No', dataIndex: 'batchNo' },
    { title: 'Barcode', dataIndex: 'barcode' },
    { title: 'Quantity', dataIndex: 'quantity' },

 
    { title: 'Purchase Rate', dataIndex: 'purchaseRate' },
    { title: 'Disc %', dataIndex: 'purchaseDiscount' },
    { title: 'Disc 2 %', dataIndex: 'purchaseAmount' },
    { title: 'Final Purchase', dataIndex: 'finalPurchaseRate' },
    { title: 'Total Purchase Amount', dataIndex: 'totalPurchaseAmount' },

    { title: 'Sale Rate', dataIndex: 'saleRate' },
    { title: 'Discount %', dataIndex: 'saleDiscount' },
    { title: 'Final Sale Rate', dataIndex: 'finalSaleRate' },
    { title: 'Minimum Sale Rate', dataIndex: 'minSaleRate' },

     { title: 'Per Strip Rate', dataIndex: 'perStripRate',
      render: (value) => value !== undefined && value !== null ? parseFloat(value).toFixed(2) : '',
      },
    { title: 'Strip Discount', dataIndex: 'stripDiscount' },
    { title: 'Final Strip Rate', dataIndex: 'finalStripRate' },
    { title: 'Minimum Strip Rate', dataIndex: 'minStripSaleRate' },
    
        { title: 'Manufacture Date', dataIndex: 'manufactureDate' },
    { title: 'Expiry Notification', dataIndex: 'expiryNotification' },
    { title: 'Expire Date', dataIndex: 'expiryDate' },
    
  ];

const [loading, setLoading] = useState(false);
const handleSubmit = async () => {
  try {
    setLoading(true);
    const formData = await form1.validateFields(); 
    if (cartItems.length === 0) {
      Toaster.warning("Please add at least one product to the table.");
      return;
    }    
    if (!formData.supplierId || formData.supplierId === 0) {
  Toaster.warning("Please select a supplier.");
  return;
}

  if ( formData.paidAmount > paymentMethodRemainingAmount ) {
  Toaster.warning("Insufficient balance in the selected payment method.");
  return;
}

   const payload = {
      ...formData,
      supplierId: formData.supplierId,
      invoiceNo: purchaseNo,
      totalItems: cartItems.length,
      totalAmount,
      discount: formData.supplierDiscount ?? 0,
      finalAmount: netAmount,
      paidAmount : formData.paidAmount ?? 0,
      remaining: remainingAmount,
      supplierRemainingAmount,
      date: purchaseDate ? purchaseDate.format("YYYY-MM-DD") : null,
      descriptions : '',
      report : null,
      paymentMethodId : formData.paymentMethodId ?? 0,
      paymentMethodRemainingAmount,
      PurchaseDetails: cartItems 
    };

    const response = await purchaseOrder(payload);     
    if (response.data.status === "Success") {
      Toaster.success("Record submitted successfully!");
      
      form1.resetFields();
      setTotalPurchaseAmount();
      setNetAmount();
      setSupplierRemainingAmount();
      setRemainingAmount();
      setSuppliers([]);
      setCartItems([]);
      setPaymentMethodRemainingAmount('');
      setNetAmount(0);
      setTotalAmount(0);
      setSupplierRemainingAmount('');
      fetchSuppliers();
      fetchPurchaseNo();
      fetchPaymentMethod();
    } else {     
       Toaster.error("Error to save Record");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    message.error("Please fill all required fields.");
  }finally {
    setLoading(false);
  }
};


  
  return (
   <Row gutter={[8, 0]} style={{ marginLeft: 0, marginRight: 0 }}>
      <Col span={24}>
        <Card
  title={
    <div style={{ display: 'flex', fontSize:'30px', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
  
  <span style={{ fontWeight: 500 }}>
   Add Purchase
  </span>  
</div>

  }
  style={{
    marginBottom: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
  }}>
 
        <Form
      form={form}
      layout="vertical"
      name="purchase_form"
      onFinish={handleAddOrUpdate}
      onValuesChange={(changedValues, allValues) => {             
        handleValuesChange(changedValues, allValues);       
      }}
        initialValues={{   
        isSoldInStrips: false,                   
        purchaseDiscount: 0,  
        purchaseAmount: 0, 
        saleDiscount: 0,
        stripDiscount: null,
        finalPurchaseRate: 0,
        finalSaleRate: 0,
        finalStripRate: 0,
         manufactureDate: dayjs(),
         dates: [startDate, endDate],
      }}
    >         
               <>
  {/* First Row */}
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
      <Form.Item
        name="productId"
        label="Product Name"
        // rules={[{ required: true, message: 'Please select a product' }]}
      >
        <Space.Compact style={{ width: '100%' }}>
          <ReusableDropdown
            data={product}
            value={selectedProductId} 
            valueField="productId"
            labelField="productName"
            placeholder="Select product"
            loading={loadingproduct}
            defaultOption={false}
            onChange={(productId) => {
              setSelectedProductId(productId);  
              const selectedProduct = productMap.get(productId);
              if (selectedProduct) {
                setIsProductStrip(selectedProduct.isStrip || false);
                setProductBarcode(selectedProduct.barcode || '');
                setStripPerBox(selectedProduct.stripPerBox || '');
              } else {
                setIsProductStrip(false);
                setProductBarcode('');
                setStripPerBox('');
              }
            }}
          />
          <Button
            type="primary"
            onClick={() => setShowProductModal(true)}
          >
            +
          </Button>
        </Space.Compact>
      </Form.Item>
    </Col>

    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
      <Form.Item
        name="batchNo"
        label="Batch No"
        rules={[{ required: true, message: 'Please enter batch number' }]}
      >
        <Input placeholder="Enter batch number" />
      </Form.Item>
    </Col>

    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
      <Form.Item
        // name="barcode"
        label="Barcode"
        rules={[{ required: true, message: 'Please enter barcode' }]}
      >
        <Input
          prefix={<BarcodeOutlined className="site-form-item-icon" />}
          placeholder="Enter barcode"
          value={productBarcode}
          onChange={(e) => setProductBarcode(e.target.value)}
          onKeyDown={handleBarcodeEnter}
          
        />
      </Form.Item>
    </Col>
  </Row>

  {/* Second Row */}
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
      <Form.Item
        name="quantity"
        label="Quantity"
        rules={[{ required: true, message: 'Please enter quantity' }]}
      >
        
          <InputNumber            
            style={{ width: '100%' }}
            min={0}
            step="1"           
            placeholder="Enter quantity"
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
          />

      </Form.Item>
    </Col>

    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
      <Form.Item
        name="manufactureDate"
        label="Manufacture Date"
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD-MM-YYYY"
          placeholder="Select Manufacture date"
          suffixIcon={<CalendarOutlined />}
        />
      </Form.Item>
    </Col>

    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
      <Form.Item
        name="dates"
        label="Expiry Notification & Expire Date"
        rules={[{ required: true, message: 'Please select dates' }]}
      >
        <RangePicker
          style={{ width: '100%' }}
          format="DD-MM-YYYY"
          placeholder={["Notification Date", "Expire Date"]}
          suffixIcon={<CalendarOutlined />}
        />
      </Form.Item>
    </Col>
  </Row>
</>

         <Row gutter={[16, 0]} justify="space-between">
  {/* Purchase Details Card */}
  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
  <Card
    title="Purchase Details"
     style={{ height: '100%' }}
    headStyle={{
      backgroundColor: '#f0f2f5', 
      fontWeight: 'bold',
      minHeight: '25px',
    }}
    bodyStyle={
      {
         padding: '10px'
      }
    }
  >
    <Row align="middle" style={{ marginBottom: '16px' }}>
      <Col span={8}>
        <Text strong>Purchase Rate:</Text>
      </Col>
      <Col span={16}>
        <Form.Item name="purchaseRate"
        rules={[{ required: true, message: 'Please enter purchase rate' }]}
             noStyle>
          <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%' }}
            min={0}
            step="1"
            precision={2}
            placeholder="Enter purchase rate"
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </Col>



    </Row>

    
    <Row align="middle" style={{ marginBottom: '16px' }}>
  <Col span={8}>
    <Text strong>Discount 1 %:</Text>
  </Col>
  <Col span={8}>
    <Form.Item name="purchaseDiscount" noStyle>
      <InputNumber
        prefix={<span>%</span>}
        style={{ width: '100%' }}
        min={0}
        max={100}
        step="0.01"
        precision={2}
        placeholder="Enter discount 1 %"
        onFocus={() => {
          const value = form.getFieldValue("purchaseDiscount");
          if (value === 0) {
            form.setFieldsValue({ purchaseDiscount: null });
          }
        }}
        onBlur={() => {
          const value = form.getFieldValue("purchaseDiscount");
          if (value === null || value === undefined || value === '') {
            form.setFieldsValue({ purchaseDiscount: 0 });
          }
        }}
      />
    </Form.Item>
  </Col>
   <Col span={7} offset={1}>
    <Form.Item name="purchaseAmount" noStyle>
      <InputNumber
        prefix={<span>%</span>}
        style={{ width: '100%' }}
        min={0}
        max={100}
        step="0.01"
        precision={2}
        placeholder="Enter discount 2 %"
        onFocus={() => {
          const value = form.getFieldValue("purchaseAmount");
          if (value === 0) {
            form.setFieldsValue({ purchaseAmount: null });
          }
        }}
        onBlur={() => {
          const value = form.getFieldValue("purchaseAmount");
          if (value === null || value === undefined || value === '') {
            form.setFieldsValue({ purchaseAmount: 0 });
          }
        }}
      />
    </Form.Item>
  </Col>
</Row>

{/* <Row align="middle" style={{ marginBottom: '16px' }}>
  <Col span={8}>
    <Text strong>Discount 2 %:</Text>
  </Col>
 
</Row> */}


    <Row align="middle" style={{ marginBottom: '16px' }}>
      <Col span={8}>
        <Text strong>Final Rate:</Text>
      </Col>
      <Col span={16}>
        <Form.Item name="finalPurchaseRate" noStyle>
          <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%' }}
            disabled
            precision={2}
            value={calculatedValues.finalPurchaseRate}
          />
        </Form.Item>
      </Col>
    </Row>

    <Row align="middle" style={{ marginBottom: '0px' }}>
      <Col span={8}>
        <Text strong>Total Amount:</Text>
      </Col>
      <Col span={16}>
        <Form.Item name="totalPurchaseAmount" noStyle>
          <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%' }}
            disabled
            precision={2}
            value={calculatedValues.finalPurchaseRate}
          />
        </Form.Item>
      </Col>
    </Row>
  </Card>
</Col>


  {/* Sale Details Card */}
  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
    <Card title="Sale Details" style={{ height: '100%' }}
    headStyle={{
      backgroundColor: '#f0f2f5', 
      fontWeight: 'bold',
      minHeight: '25px',
    }}
    bodyStyle={
      {
         padding: '10px'
      }}>
      <Row align="middle" style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Text strong style={{ fontSize: '13px' }}>Sale Rate:</Text>
        </Col>
        <Col span={16}>
          <Form.Item
            name="saleRate"
            rules={[{ required: true, message: 'Please enter sale rate' }]}
            noStyle
          >
            <InputNumber
              prefix={<span>Rs.</span>}
              style={{ width: '100%', height: '32px' }}
              min={0}
              step="1"
              precision={2}
              placeholder="Enter sale rate"
              onBlur={() => {
      const values = form.getFieldsValue();
      if (
        values.saleRate !== undefined &&
        values.purchaseRate !== undefined &&
        values.saleRate < values.purchaseRate
      ) {
        Toaster.error("Sale rate cannot be less than purchase rate");
        form.setFieldsValue({ saleRate: undefined }); // optional: reset the invalid value
      }
    }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row align="middle" style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Text strong style={{ fontSize: '13px' }}>Discount %:</Text>
        </Col>
        <Col span={16}>
         <Form.Item
  name="saleDiscount"
  rules={[{ required: true, message: 'Please enter sale discount' }]}
  noStyle
>
  <InputNumber
    prefix={<span>%</span>}
    style={{ width: '100%', height: '32px' }}
    min={0}
    max={100}
    step="0.01"
    precision={2}
    placeholder="Enter discount %"

    // Optional: Clear if 0 for cleaner UX
    onFocus={() => {
      const value = form.getFieldValue("saleDiscount");
      if (value === 0) {
        form.setFieldsValue({ saleDiscount: null });
      }
    }}

    // Set to 0 only if left empty
    onBlur={() => {
      const value = form.getFieldValue("saleDiscount");
      if (value === null || value === undefined || value === '') {
        form.setFieldsValue({ saleDiscount: 0 });
      }
    }}
  />
</Form.Item>

        </Col>
      </Row>

      <Row align="middle" style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Text strong style={{ fontSize: '13px' }}>Final Amount:</Text>
        </Col>
        <Col span={16}>
          <Form.Item name="finalSaleRate" noStyle>
            <InputNumber
              prefix={<span>Rs.</span>}
              style={{ width: '100%', height: '32px' }}
              disabled
              precision={2}
              value={calculatedValues.finalSaleRate}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row align="middle" style={{ marginBottom: '0px' }}>
        <Col span={8}>
          <Text strong style={{ fontSize: '13px' }}>Minimum Rate:</Text>
        </Col>
        <Col span={16}>
          <Form.Item
            name="minSaleRate"
            rules={[{ required: true, message: 'Please enter min sale rate' }]}
            noStyle
          >
            <InputNumber
              value={calculatedValues.finalSaleRate}
              prefix={<span>Rs.</span>}
              style={{ width: '100%', height: '32px' }}
              min={0}
              step="0.01"
              precision={2}
              placeholder="Enter min sale rate"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  </Col>

  {/* Strip Details Card */}
  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
  <Card title="Strip Details" headStyle={{
    backgroundColor: '#f0f2f5',
    fontWeight: 'bold',
    minHeight: '20px',
  }}  bodyStyle={
      {
         padding: '10px'
      }}>
    <Row align="middle" style={{ marginBottom: '16px' }}>
      <Col span={8}>
        <Text strong style={{ fontSize: '13px' }}>{perStripRateLabel}</Text>
      </Col>
      <Col span={16}>
        <Form.Item name="perStripRate" noStyle>
          <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%', height: '32px' }}
            min={0}
            step="1"
            precision={2}
            placeholder="Enter strip rate" 
             disabled={!isProductStrip}            
          />
        </Form.Item>
      </Col>
    </Row>

    <Row align="middle" style={{ marginBottom: '16px' }}>
      <Col span={8}>
        <Text strong style={{ fontSize: '13px' }}>Discount %:</Text>
      </Col>
      <Col span={16}>
        <Form.Item name="stripDiscount" noStyle>
          <InputNumber
            prefix={<span>%</span>}
            style={{ width: '100%', height: '32px' }}
            min={0}
            max={100}
            step="0.01"
            precision={2}
            placeholder="Enter discount %"
            disabled={!isProductStrip} 
          />
        </Form.Item>
      </Col>
    </Row>

    <Row align="middle" style={{ marginBottom: '16px' }}>
      <Col span={8}>
        <Text strong style={{ fontSize: '13px' }}>Final Amount:</Text>
      </Col>
      <Col span={16}>
        <Form.Item name="finalStripRate" noStyle>
          <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%', height: '32px' }}
            disabled 
            precision={2}
            value={calculatedValues.finalStripRate}
          />
        </Form.Item>
      </Col>
    </Row>

    <Row align="middle" style={{ marginBottom: '0px' }}>
      <Col span={8}>
        <Text strong style={{ fontSize: '13px' }}>Minimum Rate:</Text>
      </Col>
      <Col span={16}>
        <Form.Item name="minStripSaleRate" noStyle>
          <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%', height: '32px' }}
            precision={2}
            value={calculatedValues.minStripSaleRate}
            disabled={!isProductStrip} 
          />
        </Form.Item>
      </Col>
    </Row>
  </Card>
</Col>
</Row>
<Row gutter={[0, 0]} style={{ marginTop: '12px',marginBottom: '-8px'  }} justify="end"> 
  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
    <Form.Item>
      <Button
       type="default"
        htmlType="submit"
        style={{ width: '100%' }}
      >
        {editingIndex !== null ? 'Update Item' : 'Add to Cart'}
      </Button>
    </Form.Item>
  </Col>
</Row>
          </Form>
<Table
  dataSource={cartItems}
  rowKey={(record, index) => index}
  pagination={false}
  bordered
  columns={columns}

  scroll={{ x: 'max-content' }}
  locale={{
    emptyText: (
      <div style={{ minHeight: 30, display: 'flex', alignItems: 'center', 
      justifyContent: 'center' }}>
        No items in cart
      </div>
    ),
  }}
  style={{ width: '100%' }}
/>

        </Card>
        <Card
  title={
    <div style={{ display: 'flex', fontSize:'18px', justifyContent: 'space-between', alignItems: 'center', }}>
  
  <span style={{ fontWeight: 500 }}>
   Payment Information
  </span>

    <div>
    <span style={{ marginRight: 8 }}>Purchase No:</span>
    <Input
      value={purchaseNo}
      disabled
      size="small"
      style={{ width: 150 }}
      placeholder="Purchase No"
    />
  </div>

    <div>
        <span style={{ marginRight: 8 }}>Purchase Date:</span>  
        <DatePicker
          value={purchaseDate}
          onChange={(date) => setPurchaseDate(date)}
          format="DD-MM-YYYY"
          style={{ width: 150 }}
          placeholder="Select Date"
          suffixIcon={<CalendarOutlined />}
        />
  </div>

</div>

}
  style={{
    // marginBottom: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
  }}>

           <Form
      form={form1}
      layout="vertical"
       onFinish={handleSubmit}
      onValuesChange={handleValuesChange2}
        initialValues={{                
         purchaseDate: dayjs(),
      
       }}
    >   

  <>
  {/* First Row */}
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item
        name="supplierId"
        label="Supplier"
      >
        <Space.Compact style={{ width: '100%' }}>
          <ReusableDropdown
            data={suppliers}
            valueField="supplierId" 
            labelField="name"      
            placeholder="Select Supplier"
            loading={loadingSuppliers}
            style={{ width: 'calc(100% - 43px)' }}
            defaultOption={false} 
            onChange={(supplierId) => {
              form1.setFieldsValue({ supplierId }); 
              const selectedSupplier = supplierMap.get(supplierId);
              if (selectedSupplier) {
                setSupplierRemainingAmount(selectedSupplier.remaining || '');
                
              } else {
                setSupplierRemainingAmount('');
              }
            }}
          />
          <Button
            type="primary"
            onClick={() => setShowSuppliersModal(true)}
          >
            +
          </Button>
        </Space.Compact>
      </Form.Item>
    </Col>
    
    
    

    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item
        label="Purchase Amount"
      >
        <Input value={totalPurchaseAmount} disabled />
      </Form.Item>
    </Col>
     <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item                 
        name="supplierDiscount"  
        label="Discount"
      >
        <Input
          prefix={<span>Rs:</span>}  
        />
      </Form.Item>
    </Col>

    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item
        label="Net Amount"
      >
        <Input value={netAmount} disabled />
      </Form.Item>
    </Col>
  </Row>

  {/* Second Row */}
  <Row gutter={[16, 0]}>
   
    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item                 
        label="Supplier Remaining Amount"
      >
        <Input
          prefix={<span>Rs:</span>}
          value={supplierRemainingAmount} 
          disabled  
        />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item                  
        label="Total Amount"
      >
        <Input value={totalAmount} disabled />
      </Form.Item>
    </Col>
    
    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item 
        name="paidAmount" 
        label="Paid Amount"
      >
         <InputNumber
                style={{ width: '100%' }}
                min={0}
                prefix="Rs:"
                step={1}
                precision={2}
              />
      </Form.Item>
    </Col>
      <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item                  
        label="Remaining Amount"
      >
        <Input value={remainingAmount} disabled />
      </Form.Item>
    </Col>
  </Row>

 
<Row gutter={8} align="middle">
  {/* Label */}
  {showPaymentMethod && (
    <Col span={6}>
      <label style={{ fontWeight: 500 }}>
        Payment Method: {paymentMethodRemainingAmount}
      </label>
    </Col>
  )}


  {showPaymentMethod && (
    <Col span={12}>
      <Form.Item name="paymentMethodId" noStyle>
        <Space.Compact style={{ width: '100%' }}>
          <ReusableDropdown
            data={paymentMethod}
            valueField="paymentMethodId"
            labelField="name"
            placeholder="Select Payment Method"
            loading={loadingPaymentMethod}
            style={{ width: 'calc(100% - 43px)' }}
            defaultOption={false}
            value={form1.getFieldValue("paymentMethodId")}
            onChange={(paymentMethodId) => {
              form1.setFieldsValue({ paymentMethodId });
              const selectedMethod = paymentMethodMap.get(paymentMethodId);
              setPaymentMethodRemainingAmount(selectedMethod?.remaining || '');
            }}
          />
          <Button
            type="primary"
            onClick={() => setShowPaymentModal(true)}
          >
            +
          </Button>
        </Space.Compact>
      </Form.Item>
    </Col>
  )}

  {/* Submit Button */}
  <Col
    span={6}
    style={{
      textAlign: showPaymentMethod ? 'left' : 'right',
      marginLeft: showPaymentMethod ? 0 : 'auto',
    }}
  >
    <Form.Item label=" ">
      <Button
        key="submit"
        type="primary"
        onClick={handleSubmit}
        style={{ width: '100%' }}
        disabled={loading}
      >
        {loading ? <Spin /> : 'Submit Purchase'}
      </Button>
    </Form.Item>
  </Col>
</Row>


</>

    </Form>

    </Card>
      
      </Col>
 
      <ProductModal
        visible={showProductModal}
        title="Add New Product"
        button="Add Product"
        onCancel={() => setShowProductModal(false)}
        onSave={handleSaveProduct}
        setIsModalVisible={setShowProductModal}
        width="100%"
        centered={false}
        destroyOnClose={true}
        footer={null} 
      />

      {/* Supplier List Modal - Now Full Screen */}
      <SupplierListModal
        visible={showSuppliersModal}
        title="Add New Supplier"
        button="Add Supplier"
        onCancel={() => setShowSuppliersModal(false)}
        onSave={handleSaveSupplier}
        setIsModalVisible={setShowSuppliersModal}
        centered={false}
        destroyOnClose={true}
        footer={null} 
      />

      <PaymentModal
        visible={showPaymentModal}
        title="Add Payment Method"
        button="Add Payment Method"
        onCancel={() => setShowPaymentModal(false)}
        onSave={handleSavePayment}
        setIsModalVisible={setShowPaymentModal}
        centered={false}
        destroyOnClose={true}
        footer={null} 
      />
    </Row>
  );
};

export default PurchaseItem;