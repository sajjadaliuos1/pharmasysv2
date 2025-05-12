import axios from "axios";

const API = axios.create({
  // baseURL: "https://pos.idotsolution.com/api",
    baseURL: "http://192.168.100.7:5277/api",
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

export default API;
