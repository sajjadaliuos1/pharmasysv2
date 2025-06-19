import React, { useState, useEffect,useMemo  } from 'react';
 
import {
  Card,  Table,  Form,  Input,  Button,  DatePicker,  InputNumber,  Row,  Col,  Space,  message,
  Typography,
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
import { Toaster } from "../../common/Toaster";
import ProductModal from '../product/ProductModal'; // Assuming correct path
import ReusableDropdown from '../../common/ReusableDropdown'; // Assuming correct path
import { purchaseOrder, getSuppliers,getPurchaseNo,getPurchaseProduct,getPayment } from '../../../api/API'; // Assuming correct API functions
import SupplierListModal from '../suppliers/SupplierListModal'; // Assuming correct path
 
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
const [paidAmount, setPaidAmount] = useState(0);
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
  const values = form.getFieldsValue();

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

  const calculateTotalPurchaseRate = (items) => {
  return items.reduce((sum, item) => {
    const rate = parseFloat(item.totalPurchaseRate) || 0;   
    return sum + rate;
  }, 0);
};



const perStripRateLabel = useMemo(() => {
  return `Strip Rate - ${stripPerBox || ''}`;
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

   
  if (changedValues.quantity !== undefined) {
    handlePurchaseChange(allValues);
  }


  if (changedValues.purchaseRate !== undefined || changedValues.purchaseDiscount !== undefined) {
    handlePurchaseChange(allValues);
  }
  if (changedValues.saleRate !== undefined || changedValues.saleDiscount !== undefined) {
    handleSaleChange(allValues);      
  }
  if (changedValues.stripDiscount !== undefined) {    
    handleStripChange(allValues);
  } 
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

      ////// use for dropdown to get record in fast....
        const map = new Map();
        paymentList.forEach(s => map.set(s.paymentMethodId, s));
        setPaymentMethodMap(map);
    
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

   

  const handleSaveProduct = (newProduct) => {
    setShowProductModal(false);
    if (newProduct && newProduct.typeId) { 
      form.setFieldsValue({ productId: newProduct.typeId });
      fetchProduct(); 
    }
  };

  const handleSaveSupplier = (newSupplier) => {
    setShowSuppliersModal(false);
    if (newSupplier && newSupplier.supplierId) {
      form.setFieldsValue({ suppliersId: newSupplier.supplierId });
      fetchSuppliers(); 
    }
  };

   const handlePurchaseChange = (allValues) => {
    const purchaseRate = parseFloat(allValues.purchaseRate) || 0;
    const purchaseDiscount = allValues.purchaseDiscount === null || allValues.purchaseDiscount === undefined ? 0 : parseFloat(allValues.purchaseDiscount);
   const quantity = parseFloat(allValues.quantity) || 0;

    const discount = Math.min(purchaseDiscount, 100);

    const discountAmount = (purchaseRate * discount) / 100;
    const finalRate = parseFloat((purchaseRate - discountAmount).toFixed(2));

    const totalPurchaseRate = parseFloat((quantity * finalRate).toFixed(2));
    
    setCalculatedValues(prev => ({
      ...prev,
      finalPurchaseRate: finalRate,
    }));

   form.setFieldsValue({
    finalPurchaseRate: finalRate,
    totalPurchaseRate: totalPurchaseRate,
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

     const handleStripChange = (allValues) => {    
  const stripRate = allValues.perStripRate || 0;
    const stripDiscount = allValues.stripDiscount === null || allValues.stripDiscount === undefined ? 0 : parseFloat(allValues.stripDiscount);
  
    const aaa = isProductStrip ? (stripRate- (stripRate * stripDiscount)/100 ) : 0;
 
    setCalculatedValues(prev => ({
      ...prev,
      finalStripRate: aaa
    }));

     form.setFieldValue('finalStripRate', aaa);
     form.setFieldValue('minStripSaleRate', aaa);   
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

  const startDate = dayjs().add(6, 'month').startOf('month'); // 1 Dec 2025
  const endDate = startDate.add(3, 'month'); // 1 Mar 2026

 const handleAddOrUpdate = (values) => {
  console.log("Form Values:");
  const formattedNotificationDate = values.dates?.[0]
    ? values.dates[0].format("DD-MM-YYYY")
    : null;

  const formattedExpireDate = values.dates?.[1]
    ? values.dates[1].format("DD-MM-YYYY")
    : null;

  const formattedManufactureDate = values.manufactureDate
    ? values.manufactureDate.format("DD-MM-YYYY")
    : null;

  const newItem = {
    ...values,
    manufactureDate: formattedManufactureDate,
    expiryDate: formattedExpireDate,
    purchaseDiscountPercent: values.purchaseDiscount || 0,
    purchaseDiscountAmount:0,
    minimumSaleRate: values.minSaleRate || 0,
    stripRate : values.perStripRate,
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


  const total = calculateTotalPurchaseRate(updatedItems);

  setTotalPurchaseAmount(total);  

  return updatedItems;
});


  form.resetFields();
  form.setFieldsValue({
    manufactureDate: dayjs(),
    dates: [startDate, endDate],
    isSoldInStrips: false,
    purchaseDiscount: 0,
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
  const format = "DD-MM-YYYY";
    form.setFieldsValue({
      purchaseRate: item.purchaseRate,
      saleRate: item.saleRate,
      productId: item.productId,
      batchNo: item.batchNo,
      quantity: item.quantity,
   
      manufactureDate: item.manufactureDate
      ? dayjs(item.manufactureDate, format)
      : null,

      // purchaseDate: item.purchaseDate
      // ? dayjs(item.purchaseDate, format)
      // : null,

      dates: item.expiryNotification && item.expiryDate
      ? [
          dayjs(item.expiryNotification, format),
          dayjs(item.expiryDate, format)
        ]
      : [],

      saleDiscount: item.saleDiscount,
      purchaseDiscount: item.purchaseDiscount,
      finalPurchaseRate: item.finalPurchaseRate,
      finalSaleRate: item.finalSaleRate,
      totalPurchaseRate : item.totalPurchaseRate,
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
    { title: 'Product Id', dataIndex: 'productId'},
      { title: 'Product', dataIndex: 'productName' },
    { title: 'Batch No', dataIndex: 'batchNo' },
    { title: 'Barcode', dataIndex: 'barcode' },
    { title: 'Quantity', dataIndex: 'quantity' },

    { title: 'Manufacture Date', dataIndex: 'manufactureDate' },
    { title: 'Expiry Notification', dataIndex: 'expiryNotification' },
    { title: 'Expire Date', dataIndex: 'expiryDate' },

 
    { title: 'Purchase Rate', dataIndex: 'purchaseRate' },
    { title: 'Purchase Discount', dataIndex: 'purchaseDiscount' },
    { title: 'Final Purchase', dataIndex: 'finalPurchaseRate' },
    { title: 'Total Purchase Rate', dataIndex: 'totalPurchaseRate' },

    { title: 'Sale Rate', dataIndex: 'saleRate' },
    { title: 'Sale Discount', dataIndex: 'saleDiscount' },
    { title: 'Final Sale Rate', dataIndex: 'finalSaleRate' },
    { title: 'Minimum Sale Rate', dataIndex: 'minSaleRate' },

     { title: 'Per Strip Rate', dataIndex: 'perStripRate',
      render: (value) => value !== undefined && value !== null ? parseFloat(value).toFixed(2) : '',
      },
    { title: 'Strip Discount', dataIndex: 'stripDiscount' },
    { title: 'Final Strip Rate', dataIndex: 'finalStripRate' },
    { title: 'Minimum Strip Rate', dataIndex: 'minStripSaleRate' },
    
    
  ];


const handleSubmit = async () => {
  try {
    const formData = await form1.validateFields(); 
    if (cartItems.length === 0) {
      message.error("Please add at least one product to the table.");
      return;
    }

   const payload = {
      ...formData,
      supplierId: formData.suppliersId,
      invoiceNo: purchaseNo,
      totalItems: cartItems.length,
      totalAmount,
      discount: formData.supplierDiscount ?? 0,

      finalAmount: netAmount,
      paidAmount : formData.paidAmount ?? 0,
      remaining: remainingAmount,
      supplierRemainingAmount,
      date: purchaseDate ? purchaseDate.format("DD-MM-YYYY") : null,
      descriptions : '',
      report : null,
      paymentMethodId : formData.paymentMethodId ?? 0,
      paymentMethodRemainingAmount,
      PurchaseDetails: cartItems 
    };

    console.log("Final Payload:", payload);

    const response = await purchaseOrder(payload);
    console.log("Payload response:", response);
 

    if (response.data.status === "Success") {
      message.success("Record submitted successfully!");
      form1.resetFields();
      setCartItems([]);
      setPaymentMethodRemainingAmount('');
      Toaster.success("Failed to fetch categories");
    } else {
     
       Toaster.error("Failed to fetch categories");
       
      message.error("Submission failed.");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    message.error("Please fill all required fields.");
  }
};


  
  return (
   <Row gutter={[8, 0]} style={{ marginLeft: 0, marginRight: 0 }}>
      <Col span={24}>
        <Card
  title={
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
  
  <span style={{ fontWeight: 500 }}>
   Add Purchase Item
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
          suffix={
            <Button
              type="text"
              icon={<BarcodeOutlined />}
              size="small"
              style={{ margin: '-4px -8px' }}
            />
          }
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
        <Input type="number" placeholder="Enter quantity" />
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

         <Row gutter={[16, 16]} justify="space-between">
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
  >
    <Row align="middle" style={{ marginBottom: '16px' }}>
      <Col span={8}>
        <Text strong>Purchase Rate:</Text>
      </Col>
      <Col span={16}>
        <Form.Item name="purchaseRate" noStyle>
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
        <Text strong>Discount %:</Text>
      </Col>
      <Col span={16}>
        <Form.Item name="purchaseDiscount" noStyle>
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

    <Row align="middle" style={{ marginBottom: '16px' }}>
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

      <Row align="middle" style={{ marginBottom: '16px' }}>
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
    minHeight: '25px',
  }}>
    <Row align="middle" style={{ marginBottom: '16px' }}>
      <Col span={8}>
        <Text strong style={{ fontSize: '13px' }}>{perStripRateLabel}:</Text>
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
            disabled
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

    <Row align="middle" style={{ marginBottom: '16px' }}>
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
<Row gutter={[16, 16]} style={{ marginTop: '16px' }} justify="end"> 
  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
    <Form.Item>
      <Button
        type="primary"
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
      <div style={{ minHeight: 60, display: 'flex', alignItems: 'center', 
      justifyContent: 'center' }}>
        No Data
      </div>
    ),
  }}
  style={{ width: '100%' }}
/>

        </Card>
        <Card
  title={
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
  
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
    marginBottom: '20px',
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
        name="suppliersId"
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
        name="purchaseDate"
        label="Purchase Date"
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD-MM-YYYY"
          placeholder="Select purchase date"
          suffixIcon={<CalendarOutlined />}
        />
      </Form.Item>
    </Col>

    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item
        label="Purchase Amount"
      >
        <Input value={totalPurchaseAmount} disabled />
      </Form.Item>
    </Col>
  </Row>

  {/* Second Row */}
  <Row gutter={[16, 16]}>
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
        <Input prefix="Rs:" />
      </Form.Item>
    </Col>
  </Row>

  {/* Third Row */}
  <Row gutter={[16, 16]}>            
    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item                  
        label="Remaining Amount"
      >
        <Input value={remainingAmount} disabled />
      </Form.Item>
    </Col>
    
    {showPaymentMethod && (
      <Col xs={24} sm={12} md={6} lg={6} xl={6}>
        <Form.Item
          name="paymentMethodId"
          label={`Payment Method - ${paymentMethodRemainingAmount}`}
        >
          <Space.Compact style={{ width: '100%' }}>
            <ReusableDropdown
              data={paymentMethod}
              valueField="paymentMethodId" 
              labelField="name"      
              placeholder="Select Payment Method"
              loading={loadingPaymentMethod}
              style={{ width: 'calc(100% - 43px)' }}
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
            <Button
              type="primary"
              onClick={() => setShowSuppliersModal(true)}
            >
              +
            </Button>
          </Space.Compact>
        </Form.Item>
      </Col>
    )}
    
    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item                  
        label=" "
      >
        <Button 
          key="submit"
          type="primary"
          onClick={handleSubmit} 
          style={{ width: '100%' }}
          // loading={btnLoading}
          // disabled={btnLoading}
        >
          Add Record
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
    </Row>
  );
};

export default PurchaseItem;