import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import './navbar.css';
import { 
  FaRegUser, 
 
 FaBalanceScale ,
  FaList,
  FaTachometerAlt,
  FaShoppingBasket,
  FaListAlt,
  FaCog,
  FaUniversity,
  FaCreditCard,
  FaUserEdit,
  FaHandshake,
  FaBoxOpen, 
  FaTruck,  
  FaCartArrowDown,
  FaShoppingCart ,
  FaStore,
  FaClipboardList,
  FaTruckLoading,
  FaUserFriends,
  FaUser,
  FaFileInvoiceDollar, 
  FaUndo
} from 'react-icons/fa';
import { RiLogoutCircleRLine } from "react-icons/ri";
import { GrUserWorker} from "react-icons/gr";
import {  GiBuyCard } from "react-icons/gi";

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const roleId = parseInt(user.role, 10);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
      logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (index) => {
    setDropdownOpen((prev) => {
      if (prev[index]) {
        return {};
      }
      return { [index]: true };
    });
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Helper function to check if main menu item should be active
  const isMainItemActive = (item) => {
    if (item.path) {
      return item.path === location.pathname;
    }
    // For dropdown items, check if any sub-item is active
    if (item.dropdown && item.links) {
      return item.links.some(subItem => subItem.path === location.pathname);
    }
    return false;
  };

  const getLinks = () => {
    switch (roleId) {
      case 1: // Admin
        return [
          { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
          {
            label: 'Setting',
            icon: <FaCog  />,
            dropdown: true,
            links: [
              { path: '/shop', label: 'Shop', icon: <FaStore /> },
              { path: '/category', label: 'Category', icon: <FaListAlt /> },
              { path: '/subCategory', label: 'Sub Category', icon: <FaList  /> },
              { path: '/uom', label: 'UOM', icon: <FaBalanceScale  /> },
              { path: '/paymentMethod', label: 'Payment Method', icon: <FaCreditCard /> }, 
                           
            ],
          },
          {
            label: 'Product',
            icon: <FaBoxOpen  />,
            dropdown: true,
            links: [
              { path: '/productList', label: 'product', icon: <FaClipboardList  /> },
              { path: '/productLowStockItem', label: 'Low Stock Product', icon: <FaList  /> },
              { path: '/productAvailableStock', label: 'Available Stock', icon: <FaList  /> },
            ],
          },
          {
            label: 'Supplier',
            icon: <FaTruck />,
            dropdown: true,
            links: [
              { path: '/supplier', label: 'Suppliers', icon: <FaTruckLoading  /> },
            ],
          },
           {
            label: 'Customer',
            icon: <FaUserFriends  />,
            dropdown: true,
            links: [
              { path: '/customer', label: 'Customer', icon: <FaUser  /> },
            ],
          },
          {
            label: 'Purchase',
            icon: <FaCartArrowDown  />,
            dropdown: true,
            links: [              
              { path: '/purchaseRecrod', label: 'Purchase', icon: <FaFileInvoiceDollar  /> },
              { path: '/purchase', label: 'Purchase', icon: <FaCartArrowDown  /> },
              { path: '/purchaseList', label: 'Purchase List', icon: <FaList  /> },
              
            ],
          },
          {
            label: 'Sale',
            icon: <FaShoppingCart />,
            dropdown: true,
            links: [
               { path: '/sale', label: 'Sale', icon: <FaShoppingCart  /> },
               { path: '/saleReturn', label: 'Sale Return', icon: <FaUndo  /> },
               { path: '/saleRecord', label: 'Sale Record', icon: <FaFileInvoiceDollar /> },
                
            ],
          },
          {
            label: 'Expense',
            icon: <FaShoppingCart />,
            dropdown: true,
            links: [
               { path: '/expense', label: 'Expense', icon: <FaShoppingCart  /> },
             { path: '/expenseCategory', label: 'Expense Category', icon: <FaShoppingCart  /> },
                
            ],
          },
          {
            label: 'User',
            icon: <FaRegUser />,
            dropdown: true,
            links: [
              { path: '/user', label: 'User', icon: <FaUser /> },
            ]
          },
          
           {
            label: 'Laboratory',
            icon: <FaCreditCard />,
            dropdown: true,
            links: [
              { path: '/laboratoryDetails', label: 'Laboratory', icon: <FaCreditCard /> },
              { path: '/booktest', label: 'Book Test', icon: <FaCreditCard /> },
            ]
          },
        ];
      case 2: // Manager
        return [
          {
            label: 'Setting',
            icon: <FaStore />,
            dropdown: true,
            links: [
              { path: '/Shop', label: 'Shop', icon: <FaStore /> },
              { path: '/category', label: 'Category', icon: <FaListAlt /> },
              { path: '/brand', label: 'Brand', icon: <FaShoppingBasket /> },
              { path: '/bank', label: 'Bank', icon: <FaUniversity /> },
              { path: '/paymentMethod', label: 'Payment Method', icon: <FaCreditCard /> },
              { path: '/registerForm', label: 'Register Form', icon: <FaUserEdit /> },
            ],
          },
          { path: '/dashboard', label: 'Manager Dashboard', icon: <FaTachometerAlt /> },
          { path: '/team', label: 'Team', icon: <GrUserWorker /> },
          { path: '/bank', label: 'Bank', icon: <FaUniversity /> },
        ];
      case 3: // User
        return [
          {
            label: 'Investers',
            icon: <FaHandshake />,
            dropdown: true,
            links: [
              { path: '/investorInvestment', label: 'Investor Investment', icon: <GiBuyCard /> }
            ],
          },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <nav className="navbar custom-justify sticky-top navbar-light bg-light w-auto">
        <label className="navbar-brand">
          Store Management System
        </label>
        <div className="profile-container">
          <FaRegUser
            style={{ fontSize: '30px', marginRight: '30px' }}
            className="navbar-icon"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          />
          <div
            className={`profile-dropdown ${isProfileDropdownOpen ? 'open' : ''}`}
            onMouseLeave={() => setIsProfileDropdownOpen(false)}
          >
            <Link to="/profile" className="dropdown-item">Profile</Link>
            <Link to="/settings" className="dropdown-item">Settings</Link>
            <div className="dropdown-item" onClick={handleLogout}>Logout</div>
          </div>
        </div>
      </nav>

      <div className="navbar-container">
        <div className="hamburger" onClick={toggleSidebar}>
          <div className={`line ${isSidebarOpen ? 'open' : ''}`} />
          <div className={`line ${isSidebarOpen ? 'open' : ''}`} />
          <div className={`line ${isSidebarOpen ? 'open' : ''}`} />
        </div>

        {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}

        <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <nav>
            <div className="logo">
              <img className="logo-img" src="/logo.png" alt="My Logo" />
            </div>
            <ul>
              {getLinks().map((item, index) => (
                <li
                  key={index}
                  className={`sidebar-item ${isMainItemActive(item) ? 'active' : ''}`}
                >
                  {item.dropdown ? (
                    <div className="sidebar-link" onClick={() => toggleDropdown(index)}>
                      {item.icon}
                      <span className="sidebar-label">{item.label}</span>
                      <span className={`dropdown-arrow ${dropdownOpen[index] ? 'open' : ''}`}>▼</span>
                    </div>
                  ) : (
                    <Link to={item.path} className="sidebar-link" onClick={() => {
                      closeSidebar();
                      const newDropdownState = Object.keys(dropdownOpen).reduce((acc, key) => {
                        acc[key] = false;
                        return acc;
                      }, {});
                      setDropdownOpen(newDropdownState);
                    }}>
                      {item.icon}
                      <span className="sidebar-label">{item.label}</span>
                    </Link>
                  )}
                  
                  {item.dropdown && dropdownOpen[index] && (
                    <ul className="dropdown">
                      {item.links.map((subItem, subIndex) => (
                        <li
                          key={subIndex}
                          className={`dropdown-item ${subItem.path === location.pathname ? 'active' : ''}`}
                        >
                          <Link 
                            to={subItem.path} 
                            onClick={closeSidebar} 
                            className={`dropdown-link ${subItem.path === location.pathname ? 'active' : ''}`}
                          >
                            {subItem.icon && <span className="dropdown-icon">{subItem.icon}</span>}
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li className="sidebar-item logout-item">
                <div className="sidebar-link" onClick={handleLogout}>
                  <RiLogoutCircleRLine className="sidebar-icon" />
                  <span className="sidebar-label">Logout</span>
                </div>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
};

export default Navbar;