// PurchaseItem.jsx
import React, { useState, useEffect } from 'react';
import { MaskedInput } from 'antd-mask-input';
import {
  Card,
  Table,
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Space,
  Typography,
  message,
 
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
import ProductModal from '../product/ProductModal'; // Assuming correct path
import ReusableDropdown from '../../common/ReusableDropdown'; // Assuming correct path
import { getSuppliers,getPurchaseNo,getPurchaseProduct } from '../../../api/API'; // Assuming correct API functions
import SupplierListModal from '../suppliers/SupplierListModal'; // Assuming correct path
const { Text } = Typography;
const { RangePicker } = DatePicker;

const PurchaseItem = ({
   editMode = false,
  initialValues = {},
  onAddToCart,
  onUpdateItem,
  onCancelEdit,
 }) => {
  const [form] = Form.useForm();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSuppliersModal, setShowSuppliersModal] = useState(false);
  
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingproduct, setLoadingproduct] = useState(false);
  const [product, setProducts] = useState([]);
  const [productMap, setProductMap] = useState(new Map());
  const [isProductStrip, setIsProductStrip] = useState(false);
   
  const [productBarcode, setProductBarcode] = useState('');
  const [stripPerBox, setStripPerBox] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
 
  
  const [suppliers, setSuppliers] = useState([]);
  const [supplierMap, setSupplierMap] = useState(new Map());
  const [supplierRemainingAmount, setSupplierRemainingAmount] = useState('');
  const [purchaseNo, setPurchaseNo] = useState([]);
    const [calculatedValues, setCalculatedValues] = useState({
    finalPurchaseRate: 0,
    finalSaleRate: 0,
    finalStripRate: 0,    
  });


   const [cartItems, setCartItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [perBoxRate, setPerBoxRate] = useState(null);
 
  useEffect(() => {
    fetchProduct();
    fetchSuppliers();
    fetchPurchaseNo();
    perStripRateCalculation();
  }, []);

 
useEffect(() => {
  form.setFieldsValue({
    minSaleRate: calculatedValues.finalSaleRate,   
  });
}, [calculatedValues.finalSaleRate]);

const handleValuesChange = (changedValues, allValues) => {
  // Sync saleDiscount to stripDiscount first
  if ('saleDiscount' in changedValues) {
    form.setFieldsValue({
      stripDiscount: changedValues.saleDiscount
    });
  }
  
  // Then process other changes
  if (changedValues.purchaseRate !== undefined || changedValues.purchaseDiscount !== undefined) {
    handlePurchaseChange(allValues);
  }
  if (changedValues.saleRate !== undefined || changedValues.saleDiscount !== undefined) {
    handleSaleChange(allValues);
  }
  if (changedValues.perStripRate !== undefined || changedValues.stripDiscount !== undefined) {
    handleStripChange(allValues);
  }
};
 

 const fetchPurchaseNo = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await getPurchaseNo();
 
      if (response.data > 0 ) {
              console.log("PurchaseNo Response", response.data);
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
      fetchSuppliers(); // Re-fetch suppliers to include the new one
    }
  };

   const handlePurchaseChange = (allValues) => {
    const purchaseRate = parseFloat(allValues.purchaseRate) || 0;
    const purchaseDiscount = allValues.purchaseDiscount === null || allValues.purchaseDiscount === undefined ? 0 : parseFloat(allValues.purchaseDiscount);

    // Ensure discount doesn't exceed 100%
    const discount = Math.min(purchaseDiscount, 100);

    const discountAmount = (purchaseRate * discount) / 100;
    const finalRate = parseFloat((purchaseRate - discountAmount).toFixed(2));

    setCalculatedValues(prev => ({
      ...prev,
      finalPurchaseRate: finalRate,
    }));

    // Update the form field
    form.setFieldValue('finalPurchaseRate', finalRate);
    };
 
    const handleSaleChange = (allValues) => {
   
    const saleRate = parseFloat(allValues.saleRate) || 0;
    const saleDiscount = allValues.saleDiscount === null || allValues.saleDiscount === undefined ? 0 : parseFloat(allValues.saleDiscount);

    // Ensure discount doesn't exceed 100%
    const discount = Math.min(saleDiscount, 100);

    const discountAmount = (saleRate * discount) / 100;
    const finalRate = parseFloat((saleRate - discountAmount).toFixed(2));

    const ccc = allValues.saleRate / stripPerBox || 0;
    const aaa = isProductStrip ? (ccc- (ccc * allValues.stripDiscount)/100 ) : 0;

    setCalculatedValues(prev => ({
      ...prev,
      finalSaleRate: finalRate,
      finalStripRate: aaa
    }));
 
    form.setFieldValue('finalSaleRate', finalRate);
    form.setFieldValue('finalStripRate', aaa);
    form.setFieldValue('minStripSaleRate', aaa);
      
     };




     const handleStripChange = (allValues) => {
      
      console.log("handleStripChange", allValues);
  const stripRate = perBoxRate || 0;
    const stripDiscount = allValues.stripDiscount === null || allValues.stripDiscount === undefined ? 0 : parseFloat(allValues.stripDiscount);
  
    const aaa = isProductStrip ? (stripRate- (stripRate * stripDiscount)/100 ) : 0;

    setCalculatedValues(prev => ({
      ...prev,
      finalStripRate: aaa
    }));

    // Update the form field
    form.setFieldValue('finalStripRate', aaa);
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

    const perStripRateCalculation = (value) => {
        const purchasePrice = value

     const perRate = purchasePrice / stripPerBox;
        setPerBoxRate (perRate);
    }

const handleAddOrUpdate = (values) => {
  console.log("handleAddOrUpdate", values);
  const newItem = {
    ...values,
    productId: selectedProductId,
    barcode: productBarcode,
    isStrip: isProductStrip,
    productName: productMap.get(selectedProductId)?.productName || '',    
  };

  setCartItems((prev) => [...prev, newItem]);
  // form.resetFields();  
  // calculatedValues.finalSaleRate = '';
  // setProductBarcode('');
  // setStripPerBox('');
  // setSelectedProductId(null);
};

  const handleEdit = (index) => {
    const item = cartItems[index];
    form.setFieldsValue({
      purchaseRate: item.purchaseRate,
      saleRate: item.saleRate,
      productId: item.productId,
      batchNo: item.batchNo,
      quantity: item.quantity,
      purchaseDate: item.purchaseDate ? dayjs(item.purchaseDate) : null,
      saleDiscount: item.saleDiscount,
      purchaseDiscount: item.purchaseDiscount,
      finalPurchaseRate: item.finalPurchaseRate,
      finalSaleRate: item.finalSaleRate,
      finalStripRate: item.finalStripRate,
      stripDiscount: item.stripDiscount,
      minSaleRate: item.minSaleRate,
      minStripSaleRate: item.minStripSaleRate,
      barcode: item.barcode,
      dates: item.dates ? [dayjs(item.dates[0]), dayjs(item.dates[1])] : null,
      isSoldInStrips: item.isStrip || false,
      stripPerBox: item.stripPerBox || '',
      productName: item.productName || '',
    });
    setProductBarcode(item.barcode);
    setStripPerBox(item.stripPerBox);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updatedItems = [...cartItems];
    updatedItems.splice(index, 1);
    setCartItems(updatedItems);
    message.success('Item deleted!');
  };


    const columns = [
    { title: 'Product', dataIndex: 'productName' },
    { title: 'Batch No', dataIndex: 'batchNo' },
    { title: 'Quantity', dataIndex: 'quantity' },
    { title: 'Purchase Rate', dataIndex: 'purchaseRate' },
    { title: 'Final Purchase', dataIndex: 'finalPurchaseRate' },
    { title: 'Sale Rate', dataIndex: 'saleRate' },
    { title: 'Final Sale Rate', dataIndex: 'finalSaleRate' },
    { title: 'Barcode', dataIndex: 'barcode' },
    {
      title: 'Actions',
      render: (_, __, index) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(index)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(index)} danger />
        </Space>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card
  title={
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
  {/* Left side */}
 
  <span style={{ fontWeight: 500 }}>
    {editMode ? 'Edit Purchase Item' : 'Add Purchase Item'}
  </span>
 

  {/* Right side */}
  <div>
    <span style={{ marginRight: 8 }}>Purchase No:</span>
    <Input
      value={purchaseNo}
      readOnly
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
  }}
        >
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
        purchaseDate: dayjs(),
        purchaseDiscount: null,   
        saleDiscount: null,
        stripDiscount: null,
        finalPurchaseRate: 0,
        finalSaleRate: 0,
        finalStripRate: 0
      }}
    >         
          
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Form.Item
                  name="suppliersId"
                  label="Supplier"
                  // rules={[{ required: true, message: 'Please select a Supplier' }]}
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
              <Col span={6}>
                <Form.Item                 
                  // name="supplierRemainingAmount"
                  label="Supplier Remaining Amount"
                  
                >
                  <Input
                  prefix={<span>Rs:</span>}
                    value={supplierRemainingAmount} readOnly  />
                </Form.Item>
              </Col>
             
              <Col span={6}>
                <Form.Item
                  name="purchaseDate"
                  label="Purchase Date">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD-MM-YYYY"
                    placeholder="Select purchase date"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="purchaseDate"
                  label="Manufacture Date">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD-MM-YYYY"
                    placeholder="Select purchase date"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Product Information Section */}
           
            <Row gutter={[16, 16]}>
  <Col span={6}>
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
  style={{ width: 'calc(100% - 43px)' }}
  defaultOption={false}
  onChange={(productId) => {
    setSelectedProductId(productId);  
    const selectedProduct = productMap.get(productId);
    if (selectedProduct) {
      setIsProductStrip(selectedProduct.isStrip || false);
      setProductBarcode(selectedProduct.barcode || '');
      setStripPerBox(selectedProduct.stripPerBox || '')
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

  <Col span={6}>
    <Form.Item
      name="batchNo"
      label="Batch No"
      rules={[{ required: true, message: 'Please enter batch number' }]}
    >
      <Input placeholder="Enter batch number" />
    </Form.Item>
  </Col>

  {/* Scan Product Field with Scan Icon in Suffix */}
  <Col span={6}>
   <Form.Item
                  name="dates"
                  label="Expiry Not & Expire Date"
                  rules={[{ required: true, message: 'Please select  dates' }]}
                >
                  <RangePicker
                    style={{ width: '100%' }}
                    format="DD-MM-YYYY"
                    placeholder={["Manufacture Date", "Expire Date"]}
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
  </Col>

 <Col span={6}>
  <Form.Item
    name="quantity"
    label="Quantity"
    rules={[{ required: true, message: 'Please enter quantity' }]}
  >
    <Input type="decimal" placeholder="Enter quantity" />
  </Form.Item>
</Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                
              </Col>
             
             
            </Row>

            {/* Purchase Information Section */}
         
            <Row gutter={[16, 16]}>
              <Col span={6}>
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
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
           
          />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="purchaseDiscount"
                  label="Purchase Discount %"
                 initialValue="00.00"
                  rules={[{ required: true, message: 'Please enter discount' }]}
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
              <Col span={6}>
                <Form.Item
                  name="finalPurchaseRate"
                  label="Final Purchase Rate"
                >
                 <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%' }}
            disabled
            precision={2}
            value={calculatedValues.finalPurchaseRate}
          />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  //  name="barcode"
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

            {/* Sale Information Section */}
           
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Form.Item
                  name="saleRate"
                  label="Sale Rate"
                  rules={[{ required: true, message: 'Please enter sale rate' }]}
                >
                 <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%' }}
            min={0}
            step="1"
            precision={2}
            placeholder="Enter sale rate"
             onChange={(value)=>
              isProductStrip ? perStripRateCalculation(value) : null
            }
          />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                   name="saleDiscount"
                  label="Sale Discount %"
                 initialValue="00.00"
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
              <Col span={6}>
                <Form.Item
                  name="finalSaleRate"
                  label="Final Sale Rate"
                >
                  <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%' }}
            disabled
            precision={2}
            value={calculatedValues.finalSaleRate}
          />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  // name="minSaleRate"
                  label="Minimum Sale Rate"
                  rules={[
                    { required: true, message: 'Please enter min sale rate' }
                  ]}
                >
                  <InputNumber
                   value={calculatedValues.finalSaleRate}
                   prefix={<span >Rs:</span>}
                    style={{ width: '100%' }}
                    min={0}
                    step="0.01"
                    precision={2}
                    placeholder="Enter min sale rate"
                    
                  />
                </Form.Item>
              </Col>
                    
            </Row>

{isProductStrip ?  
            <Row gutter={[16, 16]}>


                <Col span={6}>
                    <Form.Item
                      // name="perBoxRate"
                      label={`Per Strip Rate - ${stripPerBox}`}
                    >
                      <InputNumber
                      value={perBoxRate}
            prefix={<span>Rs.</span>}
            style={{ width: '100%' }}
            min={0}
            step="1"
            precision={2}
            placeholder="Enter strip rate"
            disabled
          />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="stripDiscount"
                      label="Strip Discount %"
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
                    <Col span={6}>
                    <Form.Item
                      name="finalStripRate"
                      label="Final Strip Rate"
                    >
                      <InputNumber
            prefix={<span>Rs.</span>}
            style={{ width: '100%' }}
            disabled
            precision={2}
            value={calculatedValues.finalStripRate}
          />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="minStripSaleRate"
                      label="Minimum Strip Rate"
                    >
                      <InputNumber
                         prefix={<span>Rs:</span>}
                        style={{ width: '100%' }}
                        precision={2}
                        value={calculatedValues.minStripSaleRate}
                        
                      />
                    </Form.Item>
                  </Col>

             </Row>
             : '' }
             <Form.Item>
          <Button type="primary" htmlType="submit">
            {editingIndex !== null ? 'Update Item' : 'Add to Cart'}
          </Button>
        </Form.Item>
          </Form>
         <Table
  dataSource={cartItems}
  rowKey={(record, index) => index}
  pagination={false}
  bordered
   columns={columns} 
>
</Table>

        </Card>
      </Col>


      {/* Product Modal - Now Full Screen */}
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