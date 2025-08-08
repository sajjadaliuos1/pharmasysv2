  
import React, { useState, useEffect } from 'react';
import {
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { 
  Form,
  Input,
  Button,
  Upload,
  message as antdMessage,
  Alert,
  Spin,
} from 'antd';
import { getShop, createShop } from '../../api/API';

const { TextArea } = Input;

const Shop = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      setInitialLoading(true);
      const response = await getShop();
      if (response.data.status === "Success" && response.data.data) {
        const data = response.data.data;
        setShopData(data);
        form.setFieldsValue({
          ownerName: data.ownerName || '',
          shopName: data.shopName || '',
          shopDetail: data.shopDetail || '',
          contactNo: data.contactNo || '',
          phoneNo: data.phoneNo || '',
          address: data.address || '',
          termsConditions: data.termsConditions || '',
          personalHints: data.personalHints || '',
        });
        if (data.logoBytes) {
          const mimeType = data.logoBytes.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
          setPreviewImage(`data:${mimeType};base64,${data.logoBytes}`);
        } else {
          setPreviewImage(null);
        }
      } else {
        showMessage('error', 'No shop data found');
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch shop data');
      console.error('Error fetching shop data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    antdMessage[type](text);
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      showMessage('error', 'Please select an image file');
      return Upload.LIST_IGNORE;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image must be smaller than 5MB');
      return Upload.LIST_IGNORE;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);

    return false; // prevent automatic upload by Upload component
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const submitData = new FormData();

      if (shopData?.shopId) {
        submitData.append('ShopId', shopData.shopId);
      }

      // Append form data with appropriate casing for keys
      Object.entries(values).forEach(([key, value]) => {
        const fieldName = key === 'termsConditions' ? 'TermsConditions' : 
                          key === 'personalHints' ? 'PersonalHints' : 
                          key.charAt(0).toUpperCase() + key.slice(1);
        submitData.append(fieldName, value || '');
      });

      if (selectedFile) {
        submitData.append('Logo', selectedFile);
      }

      const response = await createShop(submitData);

      if (response.data.status === "Success") {
        showMessage('success', shopData?.shopId ? 'Shop updated successfully!' : 'Shop created successfully!');
        await fetchShopData();
        setSelectedFile(null);
      } else {
        showMessage('error', response.data.message || 'Failed to save shop');
      }
    } catch (errorInfo) {
      // Validation failed or other errors
      if (errorInfo.errorFields) {
        showMessage('error', 'Please fill in all required fields');
      } else {
        showMessage('error', 'An error occurred while saving');
        console.error('Error saving shop:', errorInfo);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Loading shop data..." />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: 32, background: '#f0f2f5' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
          {shopData?.shopId ? 'Update Shop Information' : 'Create Shop'}
        </h1>

        {message.text && (
          <Alert
            style={{ marginBottom: 24 }}
            message={message.text}
            type={message.type === 'success' ? 'success' : 'error'}
            showIcon
            icon={message.type === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            ownerName: '',
            shopName: '',
            shopDetail: '',
            contactNo: '',
            phoneNo: '',
            address: '',
            termsConditions: '',
            personalHints: '',
          }}
        >
          <Form.Item
            label="Owner Name"
            name="ownerName"
            rules={[{ required: true, message: 'Owner name is required' }]}
          >
            <Input placeholder="Enter owner name" />
          </Form.Item>

          <Form.Item
            label="Shop Name/Sale Slip"
            name="shopName"
            rules={[{ required: true, message: 'Shop name is required' }]}
          >
            <Input placeholder="Enter shop name" />
          </Form.Item>
   <Form.Item label="Slip Address" name="shopDetail">
            <TextArea rows={1} placeholder="Enter shop details" />
          </Form.Item>
          <Form.Item
            label="Contact Number"
            name="contactNo"
            rules={[{ required: true, message: 'Contact number is required' }]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>

          <Form.Item label="Phone Number" name="phoneNo">
            <Input placeholder="Enter phone number" />
          </Form.Item>

       

          <Form.Item
            label="NICU/Lab Slip Header"
            name="address"
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <TextArea rows={2} placeholder="Enter address" />
          </Form.Item>

          <Form.Item label="Terms and Conditions" name="termsConditions">
            <TextArea rows={3} placeholder="Enter terms and conditions" />
          </Form.Item>

          <Form.Item label="Personal Hints" hidden name="personalHints">
            <TextArea rows={2} placeholder="Enter personal hints" />
          </Form.Item>

          <Form.Item label="Upload Logo">
            <Upload
              accept="image/*"
              beforeUpload={beforeUpload}
              showUploadList={false}
              maxCount={1}
            >
              <Button>Click to Upload</Button>
            </Upload>
            {previewImage && (
              <div style={{ marginTop: 16 }}>
                <p style={{ marginBottom: 8, color: '#666' }}>Preview:</p>
                <img src={previewImage} alt="Logo Preview" style={{ maxHeight: 128, borderRadius: 4, boxShadow: '0 0 5px rgba(0,0,0,0.1)' }} />
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              style={{ float: 'right' }}
            >
              {shopData?.shopId ? 'Update Shop' : 'Create Shop'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Shop;