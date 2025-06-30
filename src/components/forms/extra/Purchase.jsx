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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Toaster } from "../../common/Toaster";
import ProductModal from '../product/ProductModal'; 
import ReusableDropdown from '../../common/ReusableDropdown'; 
import { purchaseOrder, getSuppliers,getPurchaseNo,getPurchaseProduct,getPayment } from '../../../api/API';  
import SupplierListModal from '../suppliers/SupplierListModal';  
 
const { RangePicker } = DatePicker;
const { Text } = Typography;
const Purchase = () => {
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

  const calculatetotalPurchaseAmount = (items) => {
  return items.reduce((sum, item) => {
    const rate = parseFloat(item.totalPurchaseAmount) || 0;   
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
      form.setFieldsValue({ supplierId: newSupplier.supplierId });
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

    const totalPurchaseAmount = parseFloat((quantity * finalRate).toFixed(2));
    
    setCalculatedValues(prev => ({
      ...prev,
      finalPurchaseRate: finalRate,
    }));

   form.setFieldsValue({
    finalPurchaseRate: finalRate,
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
 
  

  const newItem = {
    ...values,
    
    purchaseDiscountPercent: values.purchaseDiscount || 0,
    purchaseDiscountAmount:0,
    totalPurchaseAmount : values.totalPurchaseAmount,
    minimumSaleRate: values.minSaleRate || 0,
    stripRate : values.perStripRate,
    minimumStripRate: values.minStripSaleRate || 0,
    remainingOpenStrip: 0,
    remainingQuantity: values.quantity || 0,
    saleDiscountPercent: values.saleDiscount || 0,
    stripDiscountPercent: values.stripDiscount || 0,    
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
  
    form.setFieldsValue({
      purchaseRate: item.purchaseRate,
      saleRate: item.saleRate,
      productId: item.productId,
      batchNo: item.batchNo,
      quantity: item.quantity,
      saleDiscount: item.saleDiscount,
      purchaseDiscount: item.purchaseDiscount,
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

      { title: 'Product', dataIndex: 'productName' },
    { title: 'Batch No', dataIndex: 'batchNo' },
    { title: 'Barcode', dataIndex: 'barcode' },
    { title: 'Quantity', dataIndex: 'quantity' },

 
    { title: 'Purchase Rate', dataIndex: 'purchaseRate' },
    { title: 'Purchase Discount', dataIndex: 'purchaseDiscount' },
    { title: 'Final Purchase', dataIndex: 'finalPurchaseRate' },
    { title: 'Total Purchase Amount', dataIndex: 'totalPurchaseAmount' },

    { title: 'Sale Rate', dataIndex: 'saleRate' },
    { title: 'Sale Discount', dataIndex: 'saleDiscount' },
    { title: 'Final Sale Rate', dataIndex: 'finalSaleRate' },
    { title: 'Minimum Sale Rate', dataIndex: 'minSaleRate' },

    
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
        saleDiscount: 0,
        stripDiscount: null,
        finalPurchaseRate: 0,
        finalSaleRate: 0,
        finalStripRate: 0,
         
         dates: [startDate, endDate],
      }}
    >         
               <>
  {/* First Row */}
  <Row gutter={[16, 16]}>
     <Col xs={24} sm={12} md={6} lg={6} xl={6}>
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

     <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item
        name="batchNo"
        label="Batch No"
        rules={[{ required: true, message: 'Please enter batch number' }]}
      >
        <Input placeholder="Enter batch number" />
      </Form.Item>
    </Col>

    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
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
       <Col xs={24} sm={12} md={6} lg={6} xl={6}>
      <Form.Item
        name="quantity"
        label="Quantity"
        rules={[{ required: true, message: 'Please enter quantity' }]}
      >
        <Input type="number" placeholder="Enter quantity" />
      </Form.Item>
    </Col>
  </Row>

  


<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={6} lg={6} xl={6}>
    <Form.Item
      name="purchaseRate"
      label="Purchase Rate"
      rules={[{ required: true, message: 'Please enter purchase rate' }]}
    >
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

  <Col xs={24} sm={12} md={6} lg={6} xl={6}>
    <Form.Item name="purchaseDiscount" label="Discount %">
      <InputNumber
        prefix={<span>%</span>}
        style={{ width: '100%' }}
        min={0}
        max={100}
        step="0.01"
        precision={2}
        placeholder="Enter discount %"
        onFocus={() => {
          const value = form.getFieldValue("purchaseDiscount");
          if (value === 0) {
            form.setFieldsValue({ purchaseDiscount: null });
          }
        }}
      />
    </Form.Item>
  </Col>

  <Col xs={24} sm={12} md={6} lg={6} xl={6}>
    <Form.Item name="finalPurchaseRate" label="Final Rate">
      <InputNumber
        prefix={<span>Rs.</span>}
        style={{ width: '100%' }}
        disabled
        precision={2}
        value={calculatedValues.finalPurchaseRate}
      />
    </Form.Item>
  </Col>

  <Col xs={24} sm={12} md={6} lg={6} xl={6}>
    <Form.Item name="totalPurchaseAmount" label="Total Amount">
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
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={6} lg={6} xl={6}>
    <Form.Item
      name="saleRate"
      label="Sale Rate"
      rules={[{ required: true, message: 'Please enter sale rate' }]}
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
            form.setFieldsValue({ saleRate: undefined });
          }
        }}
      />
    </Form.Item>
  </Col>

  <Col xs={24} sm={12} md={6} lg={6} xl={6}>
    <Form.Item
      name="saleDiscount"
      label="Discount %"
      rules={[{ required: true, message: 'Please enter sale discount' }]}
    >
      <InputNumber
        prefix={<span>%</span>}
        style={{ width: '100%', height: '32px' }}
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

  <Col xs={24} sm={12} md={6} lg={6} xl={6}>
    <Form.Item name="finalSaleRate" label="Final Amount">
      <InputNumber
        prefix={<span>Rs.</span>}
        style={{ width: '100%', height: '32px' }}
        disabled
        precision={2}
        value={calculatedValues.finalSaleRate}
      />
    </Form.Item>
  </Col>

  <Col xs={24} sm={12} md={6} lg={6} xl={6}>
    <Form.Item
      name="minSaleRate"
      label="Minimum Rate"
      rules={[{ required: true, message: 'Please enter min sale rate' }]}
    >
      <InputNumber
        prefix={<span>Rs.</span>}
        style={{ width: '100%', height: '32px' }}
        min={0}
        step="0.01"
        precision={2}
        placeholder="Enter min sale rate"
        value={calculatedValues.finalSaleRate}
      />
    </Form.Item>
  </Col>
</Row>


</>

        
<Row gutter={[0, 0]} style={{ marginTop: '12px',marginBottom: '-8px'  }} justify="end"> 
  <Col xs={24} sm={24} md={6} lg={6} xl={6}>
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
        Payment Method - {paymentMethodRemainingAmount}
      </label>
    </Col>
  )}

  {/* Dropdown + + Button */}
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
            onChange={(paymentMethodId) => {
              form1.setFieldsValue({ paymentMethodId });
              const selectedMethod = paymentMethodMap.get(paymentMethodId);
              setPaymentMethodRemainingAmount(selectedMethod?.remaining || '');
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

export default Purchase;