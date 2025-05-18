import React, { useEffect, useState } from 'react';
import { Modal, Space, Form, Button, Input, message, Checkbox } from 'antd';
import { createProduct, getCategories, getSubCategories, getUom } from '../../../api/API';
import ReusableDropdown from '../../common/ReusableDropdown';
import TextArea from 'antd/es/input/TextArea';
import CategoryModal from '../../setting/Category/CategoryModol';
import { Toaster } from '../../common/Toaster';
import SubCategoryModal from '../../setting/SubCategory/SubCategoryModol';
import UomModal from '../../setting/uom/UomModol';

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
  useEffect(() => {
    if (visible) {
      fetchCategories();
      fetchSubCategories();
      fetchUom();
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          isStrip: initialValues.isStrip || false,
          stripPerBox: initialValues.stripPerBox || 0
        });
        setIsStripChecked(initialValues.isStrip || false);
      } else {
        form.resetFields();
        form.setFieldsValue({
          isStrip: false,
          stripPerBox: 0
        });
        setIsStripChecked(false);
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
        discountPercent: validatedValues.discountPercent ? Number(validatedValues.discountPercent) : 0,
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
          onSave(validatedValues); // Return updated values
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
      form.setFieldsValue({ stripPerBox: 0 });
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
      width={500}
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
      
        <Form.Item
          name="categoryId"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}>
          <Space.Compact style={{ width: '100%' }}>
            <ReusableDropdown
              data={categories}
              valueField="typeId"
              labelField="typeName"
              placeholder="Select Category"
              loading={loadingCategories}
              onChange={(value) => form.setFieldValue('categoryId', value)}
              style={{ width: 'calc(100% - 43px)' }}
            />
            <Button
              type="primary"
              onClick={() => {
                console.log("Add Category Clicked");
                setIsCategoryModalVisible(true); // Open the category modal
              }}
            >
              +
            </Button>
          </Space.Compact>
        </Form.Item>

        <CategoryModal
          visible={isCategoryModalVisible}
          title="Add New Category"
          button="Add"
          onCancel={() => setIsCategoryModalVisible(false)}
          onSave={handleSaveCategory}
          setIsModalVisible={setIsCategoryModalVisible}
        />

        <Form.Item
          name="subCategoryId"
          label="Sub Category">
          <Space.Compact style={{ width: '100%' }}>
            <ReusableDropdown
              data={subCategories}
              valueField="typeId"
              labelField="typeName"
              placeholder="Select Sub Category"
              loading={loadingCategories}
              onChange={(value) => form.setFieldValue('subCategoryId', value)}
              style={{ width: 'calc(100% - 43px)' }} 
            />
             <Button
              type="primary"
              onClick={() => {
                
                setIsSubCategoryModalVisible(true); // Open the category modal
              }}
            >
              +
            </Button>
          </Space.Compact>
        </Form.Item>
       <SubCategoryModal
          visible={isSubCategoryModalVisible}
          title="Add New Category"
          button="Add"
          onCancel={() => setIsSubCategoryModalVisible(false)}
          onSave={handleSaveSubCategory}
          setIsModalVisible={setIsSubCategoryModalVisible}
        />
        <Form.Item
          name="productName"
          label="Product Name"
          rules={[
            { required: true, message: 'Please enter product name', whitespace: true },                   
          ]}
        >
          <Input placeholder="Enter Product name" maxLength={100} />
        </Form.Item>

       <Form.Item
  name="barcode"
  label="Barcode">
  <Space.Compact style={{ width: '100%' }}>
    <Input
      id="barcodeInput"
      placeholder="Enter barcode"
      maxLength={100}
      style={{ width: 'calc(100% - 43px)' }} 
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

        <Form.Item
          name="discountPercent"
          label="Discount in Percent"
        >
          <Input placeholder="Enter Discount in Percentage" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="stockAlert"
          label="Stock Alert"
          rules={[
            { required: true, message: 'Please enter stock alert value', whitespace: true },
          ]}
        >
          <Input type='number' placeholder="Enter Stock Alert" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="uomId"
          label="Unit of Measurement"
          rules={[{ required: true, message: 'Please select a UOM' }]}
        >
          <Space.Compact style={{ width: '100%' }}>
            <ReusableDropdown
              data={uom}
              valueField="typeId"
              labelField="typeName"
              placeholder="Select UOM"
              loading={loadingCategories}
              onChange={(value) => form.setFieldValue('uomId', value)}
              style={{ width: 'calc(100% - 43px)' }} 
            />
            <Button
              type="primary"
              onClick={() => {
                
                setIsUomModalVisible(true); 
              }}
            >
              +
            </Button>
          </Space.Compact>
        </Form.Item>
<UomModal
          visible={isUomModalVisible}
          title="Add New Unit of Measurement"
          button="Add"
          onCancel={() => setIsUomModalVisible(false)}
          onSave={handleUom}
          setIsModalVisible={setIsUomModalVisible}
        />
        <Form.Item
          name="location"
          label="Location"
        >
          <Input placeholder="Enter Location" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea placeholder="Enter Description" maxLength={200} />
        </Form.Item>

        <Form.Item label="Strip Configuration" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Form.Item name="isStrip" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Checkbox onChange={handleCheckboxChange}
                style={{
                  transform: 'scale(1.5)',  
                  margin: '0 40px 0 0',    
                  height: '20px',          
                  width: '20px',
                  fontSize: '9px'          
                }}
              >Exist</Checkbox>
            </Form.Item>
            
            {isStripChecked && (
              <Form.Item
                name="stripPerBox"
                style={{ marginBottom: 0, flex: 1 }}
                rules={[
                  { required: true, message: 'Please enter Strip Per Box quantity' },
                ]}
              >
                <Input 
                  type="number" 
                  placeholder="Enter strip per box" 
                  style={{ width: '100%' }} 
                />
              </Form.Item>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductModal;