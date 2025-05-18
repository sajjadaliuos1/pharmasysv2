import axios from "axios";

const API = axios.create({
  baseURL: "https://ph.idotsolution.com/api",
    // baseURL: "http://192.168.100.7:5277/api",
    // baseURL: "http://192.168.100.7:45457/api",
    // baseURL: "http://192.168.10.4:45456/api",   
  //   baseURL: "https://localhost:7078/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
// supplier Api and supplier list
export const getSuppliers = () => API.get('/Supplier/supplier');
export const createSupplier = (data) => API.post('/Supplier/supplier', data);
export const deleteSupplier = (id) => API.post(`/Supplier/supplier/${id}`);
export default API;
