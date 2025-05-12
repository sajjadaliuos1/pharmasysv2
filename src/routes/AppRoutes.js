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
          {/*Routes For Products start*/}
       
      
          

          {/*Routes For investers  start*/}
      

{/*Routes For employess  end*/}
 



          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Category />} /> 
          <Route path="/subCategory" element={<SubCategory />} /> 
          
         
        </Route>
      </Routes>
      </div>
    </HashRouter>
  );
};

export default AppRoutes;
