import React, { useEffect, useState } from 'react';
import { Modal, Space, Form, Button, Input, message, Checkbox, Row, Col } from 'antd';

import { createProduct, getCategories, getSubCategories, getUom } from '../../../api/API';
import ReusableDropdown from '../../common/ReusableDropdown';

import CategoryModal from '../../setting/Category/CategoryModol';
import { Toaster } from '../../common/Toaster';
import SubCategoryModal from '../../setting/SubCategory/SubCategoryModol';
import UomModal from '../../setting/uom/UomModol';
import preventWheelChange from '../../common/PreventWheel';

const ProductModal = ({ visible, title, onCancel, initialValues, onSave, button, setIsModalVisible }) => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);  
  const [uom, setUom] = useState([]);  
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isStripChecked, setIsStripChecked] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isSubCategoryModalVisible, setIsSubCategoryModalVisible] = useState(false);
  const [isUomModalVisible, setIsUomModalVisible] = useState(false);
  const [categoryId, setCategoryId] = useState();
  const [subCategoryId, setSubCategoryId] = useState();
  const [uomId, setUomId] = useState();
useEffect(() => {
  if (visible) {
    fetchCategories();
    fetchSubCategories();
    fetchUom();

 
    if (initialValues.productId !== "") {

      // form.setFieldsValue({ categoryId: initialValues.categoryId });


      form.setFieldsValue({
        ...initialValues,
        categoryId: initialValues.categoryId,
        barcod: initialValues.barcode || "",
        isStrip: initialValues.isStrip || false,
      });
      setIsStripChecked(initialValues.isStrip || false);
      setCategoryId(initialValues.categoryId); 
      setSubCategoryId(initialValues.subCategoryId); 
      setUomId(initialValues.uomId); 
    } else {
      
      

      form.resetFields();
      form.setFieldsValue({
        isStrip: false,
         categoryId: null,
      });
      setIsStripChecked(false);
       setCategoryId(null); 
       setSubCategoryId(null);
       setUomId(null);
    }
  }
}, [visible, initialValues, form]);


  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getCategories();
      if (response.data.data) {    
         setCategories(response.data.data);
      }
    } catch (err) {
       message.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSubCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getSubCategories();
      if (response.data.data) {    
         setSubCategories(response.data.data);
      }
    } catch (err) {
       message.error("Failed to load sub categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchUom = async () => {
    try {
      setLoadingCategories(true);
      const response = await getUom();
      if (response.data.data) {    
        setUom(response.data.data);
      }
    } catch (err) {
       message.error("Failed to load UOM");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setBtnLoading(true);
      
      try {
        await form.validateFields();
      } catch (validationError) {
        setBtnLoading(false);
        return;
      }

      const validatedValues = await form.validateFields();


      const payload = {
        ...validatedValues,
        categoryId: Number(validatedValues.categoryId),
        subCategoryId: Number(validatedValues.subCategoryId),
        productId: validatedValues.productId ? Number(validatedValues.productId) : 0,
        uomId: Number(validatedValues.uomId),
        stockAlert: Number(validatedValues.stockAlert),
        stripPerBox: validatedValues.stripPerBox ? Number(validatedValues.stripPerBox) : null,
       discountPercent :0.00
      };

      console.log("my payload is", payload);
 
      const response = await createProduct(payload);

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      if (response.data.status === "Success") {
        message.success("Product saved successfully");
        form.resetFields();

        if (typeof onSave === 'function') {
          onSave(validatedValues); 
        }

      } else {
        message.error(response.data.message || "Operation failed");
      }

    } catch (err) {
      console.error("Error saving product:", err);
      message.error(err.message || "Something went wrong while saving.");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setIsStripChecked(e.target.checked);
    if (!e.target.checked) {
      form.setFieldsValue({ stripPerBox: isStripChecked ? "" : 0 });
    }
  };

  const handleSaveCategory = async (newCategory) => {
    try {
       setIsCategoryModalVisible(false);
       await fetchCategories();
       if (newCategory && newCategory.typeId) {
        form.setFieldsValue({ categoryId: newCategory.typeId });
        if (newCategory.response && newCategory.response.data && newCategory.response.data.message) {
       Toaster.success(newCategory.response.data.message);
        } else {
          Toaster.success(`Category "${newCategory.typeName}" added and selected`);
        }
      } else {
        Toaster.success("Category added successfully");
      }
    } catch (error) {
      console.error("Error after saving category:", error);
      message.error("Failed to refresh categories");
    }
  };
  
  const handleSaveSubCategory = async (newSubCategory) => {
    try {
       setIsSubCategoryModalVisible(false);
       await fetchSubCategories();
       if (newSubCategory && newSubCategory.typeId) {
        form.setFieldsValue({ SubcategoryId: newSubCategory.typeId });
        if (newSubCategory.response && newSubCategory.response.data && newSubCategory.response.data.message) {
       Toaster.success(newSubCategory.response.data.message);
        } else {
          Toaster.success(`SubCategory "${newSubCategory.typeName}" added and selected`);
        }
      } else {
        Toaster.success("SubCategory added successfully");
      }
    } catch (error) {
      console.error("Error after saving category:", error);
      message.error("Failed to refresh categories");
    }
  };
  
  const handleUom = async (newUom) => {
    try {
       setIsUomModalVisible(false);
       await fetchUom();
       if (newUom && newUom.typeId) {
        form.setFieldsValue({ UomId: newUom.typeId });
        if (newUom.response && newUom.response.data && newUom.response.data.message) {
       Toaster.success(newUom.response.data.message);
        } else {
          Toaster.success(`Unit "${newUom.typeName}" added and selected`);
        }
      } else {
        Toaster.success("Unit added successfully");
      }
    } catch (error) {
      console.error("Error after saving category:", error);
      message.error("Failed to refresh categories");
    }
  };

  return (
    <Modal
  open={visible}
  title={title}
  onCancel={onCancel}
  width="90%"
  style={{ maxWidth: 700 }}
  zIndex={3000}
  footer={[
    <Button key="cancel" onClick={onCancel}>
      Cancel
    </Button>,
    <Button 
      key="submit"
      type="primary"
      onClick={() => handleSubmit(form.getFieldsValue())}
      loading={btnLoading}
      disabled={btnLoading}
    >
     {button}
    </Button>
  ]}
>
  <Form
    form={form}
    layout="vertical"
    initialValues={initialValues}
  >
    <Form.Item name="productId" noStyle />
    
    <Row gutter={[16, 0]}>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Form.Item
          name="categoryId"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Space.Compact style={{ width: '100%' }}>
           <ReusableDropdown
  data={categories}
  value={categoryId}
  valueField="typeId"
  labelField="typeName"
  onChange={(value) => {
    setCategoryId(value); // update local state
    form.setFieldValue('categoryId', value); // update form field
  }}
  placeholder="Select Category"
  loading={loadingCategories}
/>

            <Button
              type="primary"
              onClick={() => {
                console.log("Add Category Clicked");
                setIsCategoryModalVisible(true);
              }}
            >
              +
            </Button>
          </Space.Compact>
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
      <Form.Item
          name="subCategoryId"
          label="Sub Category"
          rules={[{ required: true, message: 'Please select a sub Category' }]}
        >
          <Space.Compact style={{ width: '100%' }}>
           <ReusableDropdown
  data={subCategories}
  value={subCategoryId}
  valueField="typeId"
  labelField="typeName"
  onChange={(value) => {
    setSubCategoryId(value); // update local state correctly
    form.setFieldValue('subCategoryId', value); // update form field
  }}
  placeholder="Select sub Category"
  loading={loadingCategories}
/>

            <Button
              type="primary"
              onClick={() => {
                console.log("Add Category Clicked");
                setIsCategoryModalVisible(true);
              }}
            >
              +
            </Button>
          </Space.Compact>
        </Form.Item>
       
      </Col>
    </Row>
    
    <Row gutter={[16, 0]}>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Form.Item
          name="productName"
          label="Product Name"
          rules={[
            { required: true, message: 'Please enter product name', whitespace: true },                   
          ]}
        >
          <Input placeholder="Enter Product name" maxLength={100} />
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Form.Item
          name="barcode"
          label="Barcode"
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input
              id="barcodeInput"
              placeholder="Enter barcode"
              maxLength={100}
            />
            <Button
              type="primary"
              onClick={() => {
                const barcodeInput = document.getElementById('barcodeInput');
                if (barcodeInput) {
                  barcodeInput.focus();
                }
              }}
            >
              +
            </Button>
          </Space.Compact>
        </Form.Item>
      </Col>
    </Row>
    
    <Row gutter={[16, 0]}>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Form.Item
          name="stockAlert"
          label="Stock Alert"
          rules={[
            { required: true, message: 'Please enter stock alert value', whitespace: true },
          ]}
        >
          <Input type='number' placeholder="Enter Stock Alert" maxLength={100} onWheel={preventWheelChange} />
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        
        <Form.Item
           name="uomId"
          label="Unit of Measurement"
          rules={[{ required: true, message: 'Please select a UOM' }]}
        >
          <Space.Compact style={{ width: '100%' }}>
           <ReusableDropdown
  data={uom}
  value={uomId}
  valueField="typeId"
  labelField="typeName"
  onChange={(value) => {
    setUomId(value); // update local state
    form.setFieldValue('uomId', value); // update form field
  }}
  placeholder="Select Uom"
  loading={loadingCategories}
/>

            <Button
              type="primary"
              onClick={() => {
                console.log("Add Category Clicked");
                setIsCategoryModalVisible(true);
              }}
            >
              +
            </Button>
          </Space.Compact>
        </Form.Item>
      </Col>
    </Row>
    
    <Row gutter={[16, 0]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24}>
        <Form.Item
          name="location"
          label="Location"
        >
          <Input placeholder="Enter Location" maxLength={100} />
        </Form.Item>
      </Col>
    </Row>
    
    <Row gutter={[16, 0]}>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea 
            placeholder="Enter Description" 
            maxLength={200} 
            rows={4}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Form.Item label="Allow Strip Sale">
          <Form.Item name="isStrip" valuePropName="checked" style={{ marginBottom: 8 }}>
            <Checkbox 
              onChange={handleCheckboxChange}
              size="large"
            >
              {isStripChecked ? "Yes" : "No"}
            </Checkbox>
          </Form.Item>
          
          {isStripChecked && (
            <Form.Item
              name="stripPerBox"
              rules={[
                { required: true, message: 'Please enter Strip Per Box quantity' },
              ]}
            >
              <Input 
                type="number" 
                placeholder="Enter strip per box" 
                onWheel={preventWheelChange}
              />
            </Form.Item>
          )}
        </Form.Item>
      </Col>
    </Row>
  </Form>
  
  {/* Modals */}
  <CategoryModal
    visible={isCategoryModalVisible}
    title="Add New Category"
    button="Add"
    onCancel={() => setIsCategoryModalVisible(false)}
    onSave={handleSaveCategory}
    setIsModalVisible={setIsCategoryModalVisible}
  />
  
  <SubCategoryModal
    visible={isSubCategoryModalVisible}
    title="Add New Category"
    button="Add"
    onCancel={() => setIsSubCategoryModalVisible(false)}
    onSave={handleSaveSubCategory}
    setIsModalVisible={setIsSubCategoryModalVisible}
  />
  
  <UomModal
    visible={isUomModalVisible}
    title="Add New Unit of Measurement"
    button="Add"
    onCancel={() => setIsUomModalVisible(false)}
    onSave={handleUom}
    setIsModalVisible={setIsUomModalVisible}
  />
</Modal>
  );
};

export default ProductModal;