import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import './navbar.css';
import {
  FaRegUser,
  FaBalanceScale,
  FaList,
  FaTachometerAlt,
  FaListAlt,
  FaCog,
  FaCreditCard,
  FaBoxOpen,
  FaTruck,
  FaCartArrowDown,
  FaShoppingCart,
  FaStore,
  FaClipboardList,
  FaTruckLoading,
  FaUserFriends,
  FaUser,
  FaFileInvoiceDollar,
  FaUndo,
  FaArrowDown,
  FaArrowUp,
  FaMoneyBillWave,
  FaFlask,
   FaProcedures,
  FaHourglassHalf,
  FaTimesCircle,
} from 'react-icons/fa';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { BiTestTube } from "react-icons/bi";        // For Test Types
import { MdLibraryAdd } from "react-icons/md";      // For Book Test
import { TbReportSearch } from "react-icons/tb";    // For Test Records

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
      localStorage.removeItem('companyInfo');
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
    setDropdownOpen((prev) => (prev[index] ? {} : { [index]: true }));
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isMainItemActive = (item) => {
    if (item.path) return item.path === location.pathname;
    if (item.dropdown && item.links) {
      return item.links.some((subItem) => subItem.path === location.pathname);
    }
    return false;
  };

  const getLinks = () => {
    switch (roleId) {
      case 1:
        return [
          { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
          {
            label: 'Setting',
            icon: <FaCog />,
            dropdown: true,
            links: [
              { path: '/shop', label: 'Shop', icon: <FaStore /> },
              { path: '/category', label: 'Category', icon: <FaListAlt /> },
              { path: '/subCategory', label: 'Sub Category', icon: <FaList /> },
              { path: '/uom', label: 'UOM', icon: <FaBalanceScale /> },
			        { path: '/role', label: 'Role', icon: <FaBalanceScale /> },
              { path: '/paymentMethod', label: 'Payment Method', icon: <FaCreditCard /> },
               { path: '/backuprestore', label: 'Back up Restore', icon: <FaCreditCard /> },
              //  { path: '/directPrintComponent', label: 'Register Form', icon: <FaUserEdit /> },
       
            ],
          },
          {
            label: 'Product',
            icon: <FaBoxOpen />,
            dropdown: true,
            links: [
              { path: '/productList', label: 'Product', icon: <FaClipboardList /> },
              { path: '/productLowStockItem', label: 'Low Product Stock', icon: <FaArrowDown /> },
              { path: '/productAvailableStock', label: 'All Product Stock ', icon: <FaArrowUp /> },
              { path: '/productNearToExpire', label: 'Short Expiry  ', icon: <FaHourglassHalf /> },
              { path: '/expiredproduct', label: 'Expired  ', icon: <FaTimesCircle /> },
            ],
          },
          {
            label: 'Supplier',
            icon: <FaTruck />,
            dropdown: true,
            links: [{ path: '/supplier', label: 'Suppliers', icon: <FaTruckLoading /> }],
          },
          {
            label: 'Customer',
            icon: <FaUserFriends />,
            dropdown: true,
            links: [{ path: '/customer', label: 'Customer', icon: <FaUser /> }],
          },
          {
            label: 'Purchase',
            icon: <FaCartArrowDown />,
            dropdown: true,
            links: [
               { path: '/purchase', label: 'Purchase', icon: <FaFileInvoiceDollar /> },
               { path: '/purchaseReturn', label: 'Purchase Return', icon: <FaUndo /> },
               { path: '/purchaseList', label: 'Purchase List', icon: <FaList /> },
            ],
          },
          {
            label: 'Sale',
            icon: <FaShoppingCart />,
            dropdown: true,
            links: [
              { path: '/sale', label: 'Sale', icon: <FaShoppingCart /> },
              { path: '/saleReturn', label: 'Sale Return', icon: <FaUndo /> },
              { path: '/saleRecord', label: 'Sale Record', icon: <FaFileInvoiceDollar /> },
            ],
          },
          {
            label: 'Expense',
            icon: <FaMoneyBillWave />,
            dropdown: true,
            links: [
              { path: '/expense', label: 'Expense', icon: <FaMoneyBillWave /> },
              { path: '/expenseCategory', label: 'Expense Category', icon: <FaListAlt /> },
            ],
          },
          {
            label: 'Laboratory',
            icon: <FaFlask />,
            dropdown: true,
            links: [
              { path: '/booktest', label: 'Book Test', icon: <MdLibraryAdd /> },
              { path: '/laboratorylist', label: 'Test Records', icon: <TbReportSearch /> },
              { path: '/laboratoryDetails', label: 'Tests Setup', icon: <BiTestTube /> },
              { path: '/nicu', label: 'Nicu', icon: <FaProcedures /> },
              { path: '/niculist', label: 'Nicu Records', icon: <FaListAlt /> },
            ],
          },
          {
            label: 'User',
            icon: <FaRegUser />,
            dropdown: true,
            links: [{ path: '/user', label: 'User', icon: <FaUser /> }],
          },
           { path: '/summary', label: 'Summary', icon: <FaClipboardList /> },
        ];
      case 2:
        return [
         { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
          {
            label: 'Setting',
            icon: <FaCog />,
            dropdown: true,
            links: [
              { path: '/shop', label: 'Shop', icon: <FaStore /> },
              { path: '/category', label: 'Category', icon: <FaListAlt /> },
              { path: '/subCategory', label: 'Sub Category', icon: <FaList /> },
              { path: '/uom', label: 'UOM', icon: <FaBalanceScale /> },
			  { path: '/role', label: 'Role', icon: <FaBalanceScale /> },
              { path: '/paymentMethod', label: 'Payment Method', icon: <FaCreditCard /> },
              //  { path: '/directPrintComponent', label: 'Register Form', icon: <FaUserEdit /> },
       
            ],
          },
          {
            label: 'Product',
            icon: <FaBoxOpen />,
            dropdown: true,
            links: [
              { path: '/productList', label: 'Product', icon: <FaClipboardList /> },
              { path: '/productLowStockItem', label: 'Low Product Stock', icon: <FaArrowDown /> },
              { path: '/productAvailableStock', label: 'All Product Stock ', icon: <FaArrowUp /> },
              { path: '/productNearToExpire', label: 'Short Expiry  ', icon: <FaHourglassHalf /> },
              { path: '/expiredproduct', label: 'Expired  ', icon: <FaTimesCircle /> },
            ],
          },
          {
            label: 'Supplier',
            icon: <FaTruck />,
            dropdown: true,
            links: [{ path: '/supplier', label: 'Suppliers', icon: <FaTruckLoading /> }],
          },
          {
            label: 'Customer',
            icon: <FaUserFriends />,
            dropdown: true,
            links: [{ path: '/customer', label: 'Customer', icon: <FaUser /> }],
          },
          {
            label: 'Purchase',
            icon: <FaCartArrowDown />,
            dropdown: true,
            links: [
               { path: '/purchase', label: 'Purchase', icon: <FaFileInvoiceDollar /> },
               { path: '/purchaseReturn', label: 'Purchase Return', icon: <FaUndo /> },
               { path: '/purchaseList', label: 'Purchase List', icon: <FaList /> },
            ],
          },
          {
            label: 'Sale',
            icon: <FaShoppingCart />,
            dropdown: true,
            links: [
              { path: '/sale', label: 'Sale', icon: <FaShoppingCart /> },
              { path: '/saleReturn', label: 'Sale Return', icon: <FaUndo /> },
              { path: '/saleRecord', label: 'Sale Record', icon: <FaFileInvoiceDollar /> },
            ],
          },
          {
            label: 'Nicu',
            icon: <FaMoneyBillWave />,
            dropdown: true,
            links: [
             { path: '/nicu', label: 'Nicu', icon: <FaProcedures /> },
              { path: '/niculist', label: 'Nicu Records', icon: <FaListAlt /> },
            ],
          },
         
        ];
      case 3:
        return [
            { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
          {
            label: 'Laboratory',
            icon: <FaFlask />,
            dropdown: true,
            links: [
              { path: '/booktest', label: 'Book Test', icon: <MdLibraryAdd /> },
              { path: '/laboratorylist', label: 'Test Records', icon: <TbReportSearch /> },
              { path: '/laboratoryDetails', label: 'Tests Setup', icon: <BiTestTube /> },
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
        <label className="navbar-brand">Pharmacy Management System</label>
        <div className="profile-container">
          <FaRegUser
            style={{ fontSize: '30px', marginRight: '30px' }}
            className="navbar-icon"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          />
          <div
            className={`profile-dropdown ${isProfileDropdownOpen ? 'open' : ''}`}
            onMouseLeave={() => setIsProfileDropdownOpen(false)}
          >{/*
            <Link to="/profile" className="dropdown-item">
              Profile
            </Link>
            <Link to="/settings" className="dropdown-item">
              Settings
            </Link>*/}
            <div className="dropdown-item">
              <span className="profile-name">{user.email}</span>
            </div>
            <div className="dropdown-item" onClick={handleLogout}>
              Logout
            </div>
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
                      <span className={`dropdown-arrow ${dropdownOpen[index] ? 'open' : ''}`}>
                        ▼
                      </span>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className="sidebar-link"
                      onClick={() => {
                        closeSidebar();
                        const newDropdownState = Object.keys(dropdownOpen).reduce((acc, key) => {
                          acc[key] = false;
                          return acc;
                        }, {});
                        setDropdownOpen(newDropdownState);
                      }}
                    >
                      {item.icon}
                      <span className="sidebar-label">{item.label}</span>
                    </Link>
                  )}

                  {item.dropdown && dropdownOpen[index] && (
                    <ul className="dropdown">
                      {item.links.map((subItem, subIndex) => (
                        <li
                          key={subIndex}
                          className={`dropdown-item ${
                            subItem.path === location.pathname ? 'active' : ''
                          }`}
                        >
                          <Link
                            to={subItem.path}
                            onClick={closeSidebar}
                            className={`dropdown-link ${
                              subItem.path === location.pathname ? 'active' : ''
                            }`}
                          >
                            {subItem.icon && (
                              <span className="dropdown-icon">{subItem.icon}</span>
                            )}
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