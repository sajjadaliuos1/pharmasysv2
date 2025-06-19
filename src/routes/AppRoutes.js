import React from "react";
import { HashRouter, BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Home from "../components/home/Home";
import Login from "../components/home/Login";
// import NotFound from "../pages/NotFound";
 
import ToastProvider from "../components/common/Toaster";
import Navbar from "../components/navbar/Navbar"
import "../components/navbar/navbar.css"
import Category from "../components/setting/Category/Category";
import SubCategory from "../components/setting/SubCategory/SubCategory";
import Uom from "../components/setting/uom/Uom";
import Payment from "../components/setting/paymentMethod/Payment";
import ProductList from "../components/forms/product/ProductList";
import SupplierList from "../components/forms/suppliers/SupplierList";
import PaymentDetail from "../components/setting/paymentMethod/PaymentDetail";
import Shop from "../components/setting/Shop";
import PurchaseItem from "../components/forms/purchase/PurchaseItem";
import Sale from "../components/forms/sale/Sale";
import Customer from "../components/forms/customer/Customer";
import InvoiceRecord from "../components/forms/sale/invoiceRecord";
// Mock authentication function
const isAuthenticated = () => {
  // Replace with your actual authentication logic
  return !!localStorage.getItem("authToken"); // Example: Check if a token exists in localStorage
};

// ProtectedRoute Component
const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};


const AppRoutes = () => {
  return (
    <HashRouter>
      <Navbar></Navbar>
      <ToastProvider />
      <div className="content">
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
         
 
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<Category />} /> 
        <Route path="/subCategory" element={<SubCategory />} /> 
        <Route path="/uom" element={<Uom/>} /> 
        <Route path="/paymentMethod" element={<Payment/>} /> 
        <Route path="/productList" element={<ProductList />} />
        <Route path="/supplier" element={<SupplierList />} />
        <Route path="/purchase" element={<PurchaseItem />} />
        <Route path="/paymentDetail" element={<PaymentDetail />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/invoicerecord" element={<InvoiceRecord />} />
        <Route path="/customer" element={<Customer/>} />
        </Route>
      </Routes>
      </div>
    </HashRouter>
  );
};

export default AppRoutes;
