import React from "react";
import { HashRouter, BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Home from "../components/home/Home";
import Login from "../components/home/Login";
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
import Purchase from "../components/forms/extra/Purchase";
import SaleReturn from "../components/forms/sale/SaleReturn";
import PurchaseList from "../components/forms/purchase/PurchaseList";
import SaleRecord from "../components/forms/sale/SaleRecord";
import SaleRecordDetail from "../components/forms/sale/SaleRecordDetail";
import CustomerPaymentDetail from "../components/forms/customer/CustomerPaymentDetail";
import SupplierPaymentDetails from "../components/forms/suppliers/SupplierPaymentDetails"; 
import ExpenseCategory from "../components/forms/expense/ExpenseCategory";
import ProductLowStockItem from "../components/forms/product/ProductLowStockItem";
import ProductAvailableStock from "../components/forms/product/ProductAvailableStock";
import Expense from "../components/forms/expense/Expense";
import User from "../components/forms/users/User";
// LaboratoryDetail
// BookTest
import LaboratoryDetail from "../components/forms/laboratory/LaboratoryDetails";
import BookTest from "../components/forms/laboratory/BookTest";
import LaboratoryList from "../components/forms/laboratory/LaboratoryList";
import Nicu from "../components/forms/nicu/Nicu";
import NicuList from "../components/forms/nicu/NicuList";
const isAuthenticated = () => {
  return !!localStorage.getItem("authToken"); 
};

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
        <Route path="/salereturn" element={<SaleReturn />} />
        <Route path="/customer" element={<Customer/>} />
        <Route path="/purchaseList" element={<PurchaseList />} />
        <Route path="/purchaseRecrod" element={<Purchase/>} />
        <Route path="/saleRecord" element={<SaleRecord/>} />
        <Route path="/saleRecordDetail" element={<SaleRecordDetail/>} />
        <Route path="/customerPaymentDetail" element={<CustomerPaymentDetail />} />
        <Route path="/supplierpaymentDetails" element={<SupplierPaymentDetails />} />
        <Route path="productLowStockItem" element={<ProductLowStockItem />}/>
        <Route path="/expense" element={<Expense />} />
        <Route path="/productAvailableStock" element={<ProductAvailableStock />} />
        <Route path="/expenseCategory" element={<ExpenseCategory />} />
        <Route path="/user" element={<User />} />
        <Route path="/laboratoryDetails" element={<LaboratoryDetail/>} /> 
          <Route path="/booktest" element={<BookTest/>} />
          <Route path="/laboratorylist" element={<LaboratoryList/>} />
  <Route path="/nicu" element={<Nicu/>} />
  <Route path="/niculist" element={<NicuList/>} />

        </Route>
      </Routes>
      </div>
    </HashRouter>
  );
};

export default AppRoutes;
