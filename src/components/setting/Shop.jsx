// import React, { useState, useEffect } from 'react';
// import {
//   LoadingOutlined,
//   CheckCircleOutlined,
//   ExclamationCircleOutlined,
//   SaveOutlined,
// } from '@ant-design/icons';

// import { getShop, createShop } from '../../api/API';  

//   const Shop = () => {
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [shopData, setShopData] = useState(null);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [errors, setErrors] = useState({});

//   const [formData, setFormData] = useState({
//     ownerName: '',
//     shopName: '',
//     shopDetail: '',
//     contactNo: '',
//     phoneNo: '',
//     address: '',
//     termsConditions: '',
//     personalHints: ''
//   });

//   useEffect(() => {
//     fetchShopData();
//   }, []);

// const fetchShopData = async () => {
//   try {
//     setInitialLoading(true);
//     const response = await getShop();
//     if (response.data.status === "Success" && response.data.data) {
//       const data = response.data.data;
//       setShopData(data);
//       console.log("My Shop Record", data);
//       setFormData({
//         ownerName: data.ownerName || '',
//         shopName: data.shopName || '',
//         shopDetail: data.shopDetail || '',
//         contactNo: data.contactNo || '',
//         phoneNo: data.phoneNo || '',
//         address: data.address || '',
//         termsConditions: data.termsConditions || '',
//         personalHints: data.personalHints || ''
//       });
//       if (data.logoBytes) {
//         console.log("Setting preview image from base64...");
//         const mimeType = data.logoBytes.startsWith('/9j/') ? 'image/jpeg' : 'image/png';

//         setPreviewImage(`data:${mimeType};base64,${data.logoBytes}`);
//       }
//     } else {
//       showMessage('error', 'No shop data found');
//     }
//   } catch (error) {
//     showMessage('error', 'Failed to fetch shop data');
//     console.error('Error fetching shop data:', error);
//   } finally {
//     setInitialLoading(false);
//   }
// };

//   const showMessage = (type, text) => {
//     setMessage({ type, text });
//     setTimeout(() => setMessage({ type: '', text: '' }), 5000);
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
//     if (!formData.shopName.trim()) newErrors.shopName = 'Shop name is required';
//     if (!formData.contactNo.trim()) newErrors.contactNo = 'Contact number is required';
//     if (!formData.address.trim()) newErrors.address = 'Address is required'; 
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }));
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!file.type.startsWith('image/')) {
//       showMessage('error', 'Please select an image file');
//       return;
//     }

//     // Validate file size (5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       showMessage('error', 'Image must be smaller than 5MB');
//       return;
//     }

//     setSelectedFile(file);

//     // Create preview
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setPreviewImage(e.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       showMessage('error', 'Please fill in all required fields');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       const submitData = new FormData();
     
//       if (shopData?.shopId) {
//         submitData.append('ShopId', shopData.shopId);
//       }
       
//       Object.keys(formData).forEach(key => {
//         const fieldName = key === 'termsConditions' ? 'TermsConditions' : 
//                          key === 'personalHints' ? 'PersonalHints' :
//                          key.charAt(0).toUpperCase() + key.slice(1);
//         submitData.append(fieldName, formData[key] || '');
//       });
       
//       if (selectedFile) {
//         submitData.append('Logo', selectedFile);
//       }

//       const response = await createShop(submitData);
      
//       if (response.data.status === "Success") {
//         showMessage('success', shopData?.shopId ? 'Shop updated successfully!' : 'Shop created successfully!');       
//         await fetchShopData();
//       } else {
//         showMessage('error', response.data.message || 'Failed to save shop');
//       }
//     } catch (error) {
//       showMessage('error', 'An error occurred while saving');
//       console.error('Error saving shop:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (initialLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//         <LoadingOutlined className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
//           <p className="text-gray-600">Loading shop data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4">
        
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h1 className="text-2xl font-bold text-gray-900">
//               {shopData?.shopId ? 'Update Shop Information' : 'Create Shop'}
//             </h1>
//           </div>
          
        
//           {message.text && (
//             <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center ${
//               message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
//               'bg-red-50 text-red-800 border border-red-200'
//             }`}>
//               {message.type === 'success' ? 
//                  <CheckCircleOutlined className="text-base mr-2" /> : 
//                  <ExclamationCircleOutlined className="text-base mr-2" />
//               }
//               {message.text}
//             </div>
//           )}
          
//             <form onSubmit={handleSubmit} className="p-6 space-y-6">
//             {/* Basic Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Owner Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.ownerName}
//                   onChange={(e) => handleInputChange('ownerName', e.target.value)}
//                   className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     errors.ownerName ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter owner name"
//                 />
//                 {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>}
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Shop Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.shopName}
//                   onChange={(e) => handleInputChange('shopName', e.target.value)}
//                   className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     errors.shopName ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter shop name"
//                 />
//                 {errors.shopName && <p className="text-red-500 text-sm mt-1">{errors.shopName}</p>}
//               </div>
//             </div>

//             {/* Contact Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Contact Number *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.contactNo}
//                   onChange={(e) => handleInputChange('contactNo', e.target.value)}
//                   className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     errors.contactNo ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter contact number"
//                 />
//                 {errors.contactNo && <p className="text-red-500 text-sm mt-1">{errors.contactNo}</p>}
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.phoneNo}
//                   onChange={(e) => handleInputChange('phoneNo', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter phone number"
//                 />
//               </div>
//             </div>

//             {/* Shop Details */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Shop Details
//               </label>
//               <textarea
//                 value={formData.shopDetail}
//                 onChange={(e) => handleInputChange('shopDetail', e.target.value)}
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter shop details"
//               />
//             </div>

//             {/* Address */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Address *
//               </label>
//                           <textarea
//                 value={formData.address}
//                 onChange={(e) => handleInputChange('address', e.target.value)}
//                 rows={2}
//                 className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                   errors.address ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter address"
//               />
//               {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
//             </div>

//             {/* Terms and Conditions */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Terms and Conditions
//               </label>
//               <textarea
//                 value={formData.termsConditions}
//                 onChange={(e) => handleInputChange('termsConditions', e.target.value)}
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter terms and conditions"
//               />
//             </div>

//             {/* Personal Hints */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Personal Hints
//               </label>
//               <textarea
//                 value={formData.personalHints}
//                 onChange={(e) => handleInputChange('personalHints', e.target.value)}
//                 rows={2}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter personal hints"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Upload Logo
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               />
//               {previewImage && (
//                 <div className="mt-4">
//                   <p className="text-sm text-gray-600 mb-1">Preview:</p>
//                   <img src={previewImage} alt="Logo Preview" className="h-32 w-auto rounded shadow" />
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 className="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                    <LoadingOutlined className="animate-spin text-sm mr-2" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                    <SaveOutlined className="text-sm mr-2" />

//                     {shopData?.shopId ? 'Update Shop' : 'Create Shop'}
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Shop;


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
            label="Shop Name"
            name="shopName"
            rules={[{ required: true, message: 'Shop name is required' }]}
          >
            <Input placeholder="Enter shop name" />
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

          <Form.Item label="Shop Details" name="shopDetail">
            <TextArea rows={3} placeholder="Enter shop details" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <TextArea rows={2} placeholder="Enter address" />
          </Form.Item>

          <Form.Item label="Terms and Conditions" name="termsConditions">
            <TextArea rows={3} placeholder="Enter terms and conditions" />
          </Form.Item>

          <Form.Item label="Personal Hints" name="personalHints">
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