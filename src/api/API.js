import axios from "axios";

const API = axios.create({
    baseURL: "https://ph.idotsolution.com/api",
    // baseURL: "http://192.168.100.7:5277/api", //  Office
    // baseURL: "http://192.168.10.12:5277/api", // Home
    //  baseURL: "http://192.168.10.14:5277/api", // Clg
    // baseURL: "http://192.168.214.9:5277/api", // Mobile Hotspot
    
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const getShop = () => API.get('/Setting/shop');  
export const createShop = (data) => API.post('/Setting/shop', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const getCategories = () => API.get('/Setting/categories');  
export const createCategory = (data) => API.post('/Setting/categories', data);  
export const deleteCategory = (id) => API.post(`/Setting/categories/${id}`);  

// subcategory Api
export const getSubCategories = () => API.get('/Setting/subCategories');  
export const createSubCategory = (data) => API.post('/Setting/subCategories', data);  
export const deleteSubCategory = (id) => API.post(`/Setting/subCategories/${id}`); 
// Uom Api
export const getUom = () => API.get('/Setting/Uom');  
export const createUom = (data) => API.post('/Setting/Uom', data);  
export const deleteUom = (id) => API.post(`/Setting/Uom/${id}`);

// Product Api
export const getProduct = () => API.get('/Product/product');  
export const createProduct = (data) => API.post('/Product/product', data);  
export const deleteProduct = (id) => API.post(`/Product/product/${id}`);

// Payment Api
export const getPayment = () => API.get('/Setting/paymentMethod');  
export const createPayment = (data) => API.post('/Setting/paymentMethod', data);  
export const deletePayment= (id) => API.post(`/Setting/paymentMethod/${id}`);
export const transactionPayment = (data) => API.post('/Setting/paymentMethodBalance', data); 
export const getPaymentByDateRange = (id, startDate, endDate) => {
   return API.get(`Setting/paymentMethodRecord`, { 
    params: { id, startDate, endDate } 
  });
};
// supplier Api and supplier list
export const getSuppliers = () => API.get('/Supplier/supplier');
export const createSupplier = (data) => API.post('/Supplier/supplier', data);
export const SupplierPayment = (data) => API.post('/Supplier/supplierPayment', data);
export const deleteSupplier = (id) => API.post(`/Supplier/supplier/${id}`);
export const getSupplerPaymentByDateRange = (id, startDate, endDate) => {
   return API.get(`Supplier/supplierPaymentRecord`, { 
    params: { id, startDate, endDate } 
  });
};
// Purchase Api
export const getPurchaseNo = () => API.get('/Purchase/invoiceNo');
export const getPurchaseProduct = () => API.get('/Purchase/product');
export const purchaseOrder = (data) => API.post('/Purchase/purchase', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const getPurchaseByDateRange = (startDate, endDate) => {
   return API.get(`Purchase/getPurchase`, { 
    params: { startDate, endDate } 
  });
};
export const getPurchaseDetailsById = (id) => API.get(`Purchase/getPurchaseRecord/${id}`);


// customer Api
export const getCustomer = () => API.get('/Customer/customer');
export const createCustomer = (data) => API.post('/Customer/customer', data);
export const deleteCustomer = (id) => API.post(`/Customer/customer/${id}`);


// Sale Api
export const getNewInvoice = () => API.get('/Sale/newInvoice');
export const getBoxProduct = () => API.get('/Sale/boxProduct');
export const getStripProduct = () => API.get('/Sale/stripProduct');
export const createSale = (data) => API.post('/Sale/insertSale', data);
export const getSalebyInvoice = (id) => API.get(`/Sale/getInvoiceRecord/${id}`);
export const getOpenInvoice = (id) => API.get(`/Sale/getOpenInvoice/${id}`);
export const getSaleDateRange = (startDate, endDate) => {
   return API.get(`Sale/getSale`, { 
    params: { startDate, endDate } 
  });
};
export const getSaleDetailsById = (id) => API.get(`Sale/getSaleRecord/${id}`);


export default API;