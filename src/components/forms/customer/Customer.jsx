import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../common/style.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

import { ModuleRegistry } from 'ag-grid-community';
 import { AllCommunityModule } from "ag-grid-community";
import {  message, Button, Empty, Space, Tooltip, Popconfirm } from "antd";
import useScreenSize from '../../common/useScreenSize';
import { useTableHeader } from '../../common/useTableHeader';
import { EditOutlined, DeleteOutlined,CheckCircleTwoTone,DollarCircleOutlined } from '@ant-design/icons';


import { Toaster } from "../../common/Toaster";
import Loader from "../../common/Loader";
import { deleteCustomer, getCustomer } from "../../../api/API";
import CustomerModal from "./CustomerModal";
import CustomerTransactionModal from "./CustomerTransactionModal";
import { useNavigate } from "react-router-dom";

ModuleRegistry.registerModules([
  AllCommunityModule, 
 
]);

const Customer = () => {
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const gridRef = useRef(null);
  const screenSize = useScreenSize(gridRef);
  const loadingRef = useRef(false); 
  const navigate = useNavigate();
  
    const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
      const [transactionRecord, setTransactionRecord] = useState(null);

      const showTransactionModal = useCallback((record) => {
        setTransactionRecord(record ? { ...record } : { customerId: '',invoiceNo: '', amount: '', discount: '',paid:'', remaining: '', date:'',paymentMethodId:'' });
        setIsTransactionModalVisible(true);
      }, []);

        const handleTransaction = useCallback((id) => {
          const record = rowData.find(item => item.customerId === id);
          if (record) {
            showTransactionModal(record);

          }
        }, [showTransactionModal, rowData]);
          const handleTransactionModalSave = useCallback(() => { 
            Toaster.success("Transaction processed successfully!");
             handleRefreshData();
            setIsTransactionModalVisible(false);
            
          });

  const AddnewModal = useCallback((record) => {
    setEditingRecord(record ? { ...record } : { CustomerId: '', customerName: '', contact :'', address: '', amount: '', discount : '', paid :'', remaining :'', date :''});
    setIsModalVisible(true);
  }, []);

  const handleEdit = useCallback((id) => {

    const record = rowData.find(customer => customer.customerId === id);
  
  if (!record) {
    Toaster.error('Customer not found');
    return;
  }

  // Check if customer name contains "walking" (case-insensitive)
  const customerName = record.customerName || '';
  const isWalkingCustomer = customerName.includes('Walking');

  if (isWalkingCustomer) {
    Toaster.warning('Walking customers cannot be edited');
    return;
  }
    // const record = rowData.find(customer => customer.customerId === id);
    if (record) {
      AddnewModal(record);
    }
  }, [AddnewModal, rowData]);

  const handleDetails = useCallback((id, name) => {
    navigate('/customerPaymentDetail', { 
      state: { 
        customerId: id,
        customerName: name
      }
    });
  }, [navigate]);

  const handleDelete = useCallback(async (id) => {
   
    try {

   const customerToDelete = rowData.find(customer => customer.customerId === id);
    if (!customerToDelete) {
      Toaster.error('Customer not found');
      return;
    }
    const customerName = customerToDelete.customerName || '';
    const isWalkingCustomer = customerName.includes('Walking');

    if (isWalkingCustomer) {
      Toaster.warning('Walking customers cannot be deleted');
      return;
    }
      const response = await deleteCustomer(id);
      if(response.data.status === "Success"){
      handleRefreshData();
        Toaster.success(response.data.message);
      } else {
        Toaster.error(response.data.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete data');
      messageApi.error({ content: `Failed to delete data: ${err.message || 'Unknown error'}`, key: 'deletingData' });
      console.error('Error deleting data:', err);
    }
  }, [rowData, messageApi]);

   const getColumnDefs = useCallback(() => {
    return [
      {
        headerName: 'S.No',
        valueGetter: (params) => params.node.rowIndex + 1, 
        minWidth: 60,
        width: 60,
        sortable: false,
        filter:false,
      },
    
      {
        headerName: "Customer Name",
        field: "customerName",
        sortable: true,
        filter: true,
        minWidth: 180,
      },
            {
        headerName: "Contact",
        field: "contact",
        sortable: true,
        filter: true,
        minWidth: 160,
      },
            {
        headerName: "Address",
        field: "address",
        sortable: false,
        filter: false,
        minWidth: 140,
      },
            {
        headerName: "Amount",
        field: "amount",
        sortable: false,
        filter: false,
        minWidth: 100,
      },
            {
        headerName: "Discount",
        field: "discount",
        sortable: false,
        filter: false,
        minWidth: 95,
      },
            {
        headerName: "Paid",
        field: "paid",
       sortable: false,
        filter: false,
        minWidth: 95,
      },
            {
        headerName: "Remain",
        field: "remaining",
       sortable: false,
        filter: false,
        minWidth: 90,
      },
            

      {
        headerName: "Actions",
        field: "actions",
        sortable: false,
        filter: false,
         pinned: 'right', 
        minWidth: 180,
        cellRenderer: (params) => {
          return (
            <Space size="middle">
              <Tooltip title="Edit">
                <Button 
                  icon={<EditOutlined />} 
                  text={params.data.customerId}
                  onClick={() => handleEdit(params.data.customerId)} 
                  size="small"
                />
              </Tooltip>
              <Popconfirm
                title="Are you sure you want to delete?"
                onConfirm={() => handleDelete(params.data.customerId)}
                okText="Yes"
                cancelText="No"
              >
                  <Tooltip title="Delete"> 
                <Button 
                  icon={<DeleteOutlined />} 
                  danger 
                  size="small"
                /> </Tooltip>
              </Popconfirm>
              <Button  
                                icon={<CheckCircleTwoTone   />} 
                                text={params.data.customerId}
                                onClick={() => handleTransaction(params.data.customerId)} 
                                size="small"
                              />
                                <Button 
                                icon={<DollarCircleOutlined   />} 
                                text={params.data.customerId}
                  onClick={() => handleDetails(params.data.customerId, params.data.customerName)}
                                size="small"
                              />
            </Space>
          );
        },
        // suppressSizeToFit: true,
      }
    ];
  }, [screenSize, handleEdit, handleDelete]);
  
  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

  const fetchInvoiceData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await getCustomer();
      // Handle potential null response safely
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      const data = response?.data?.data || [];
      setRowData(data);
      setFilteredData(data);
      
      if (data.length > 0) {
        messageApi.success({ content: 'Data loaded successfully', key: 'loadingData' });
      } else {
        messageApi.info({ content: 'No category data available', key: 'loadingData' });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      messageApi.error({ content: `Failed to fetch data: ${err.message || 'Unknown error'}`, key: 'loadingData' });
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false; 
    }
  }, [messageApi]);

  const handleRefreshData = useCallback(async () => {
    if (loadingRef.current) return;
    
    setLoading(true);
    loadingRef.current = true;

    try {
      const response = await getCustomer();
    
      if (!response) {
        throw new Error("Failed to fetch categories");
      }
      
      const data = response?.data?.data || [];
      
      setRowData(data);
      setFilteredData(data);
      
      if (gridRef.current?.api) {
        gridRef.current.api.setRowData(data);
        gridRef.current.api.refreshCells();
      }
      
    } catch (error) {
      console.error("Error refreshing data:", error);
      Toaster.error("Failed to fetch categories");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const handleExportPDF = useCallback(() => {
    const fileName = prompt("Enter file name for PDF:", "category-data");
    if (!fileName) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Category Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Include serial number and exclude actions column
    const columns = ['S.No', 'Category ID', 'Category Name'];
    
    const rows = rowData.map((row, index) => [
      index + 1,
      row.CustomerId || '',
      row.name || '',
        row.contact || '',
        row.address || '',
        row.amount || '',
        row.discount || '',
        row.paid || '',
        row.remaining || '',
               row.date || ''
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    doc.save(`${fileName}.pdf`);
  }, [rowData]);

  const handleExportExcel = useCallback(() => {
    if (gridRef.current?.api) {
      // Export only specific columns, excluding the actions column
      const columnsToExport = columnDefs
        .filter(col => col.field !== 'actions')
        .map(col => ({ 
          field: col.field,
          headerName: col.headerName
        }));
      
      gridRef.current.api.exportDataAsCsv({
        fileName: 'Customer-list.csv',
        sheetName: 'Customer List',
        columnKeys: columnsToExport
          .filter(col => col.field) // Only include columns with field property
          .map(col => col.field),   // Extract field names for columnKeys
        skipColumnHeaders: false,
        skipHeader: false
      });
    }
  }, [columnDefs]);

  const setAutoHeight = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption("domLayout", "autoHeight");
      const gridElement = document.querySelector("#myGrid");
      if (gridElement) {
        gridElement.style.height = "";
      }
    }
  }, []);

  const setFixedHeight = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption("domLayout", "normal");
      const gridElement = document.querySelector("#myGrid");
      if (gridElement) {
        gridElement.style.height = "500px";
      }
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  const handleTableSizeChange = useCallback(({ key }) => {
    messageApi.info(`Table layout set to: ${key}`);
    switch(key) {
      case "Auto Height": setAutoHeight(); break;
      case "Fixed Height": setFixedHeight(); break;
      case "Fullscreen": handleFullscreen(); break;
      default: break;
    }
  }, [messageApi, setAutoHeight, setFixedHeight, handleFullscreen]);


  const { renderMobileHeader, renderDesktopHeader } = useTableHeader({
    title: "Customer List Management",
    onRefresh: handleRefreshData,
    onExportExcel: handleExportExcel,
    onExportPDF: handleExportPDF,
    onAddNew: () => AddnewModal(null),
    onTableSizeChange: handleTableSizeChange,
    onSearchChange: (e) => setSearchText(e.target.value),
    searchText,
    rowData,
    screenSize
  });
  
  const defaultColDef = useMemo(() => ({
   
    filter: true,
    resizable: true,
    suppressSizeToFit: false
  }), []);

  const popupParent = useMemo(() => document.body, []);
  
  useEffect(() => {
    setLoading(true);
    fetchInvoiceData();
    
    return () => {
      loadingRef.current = false;
    };
  }, [fetchInvoiceData]);

  useEffect(() => {
    const filterData = () => {
      if (!searchText.trim()) {
        setFilteredData(rowData);
        return;
      }
      
      const searchLower = searchText.toLowerCase();
      const filtered = rowData.filter(row =>
        (row.customerName && row.customerName.toLowerCase().includes(searchLower))
      );
  
      setFilteredData(filtered);
    };
    
    const handler = setTimeout(() => {
      filterData();
      
      if (gridRef.current?.api) {
        gridRef.current.api.onFilterChanged();
      }
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchText, rowData]);
 
  const handleModalSave = useCallback(() => { 
    // Toaster.success(editingRecord?.typeId ? "Customer List updated successfully!" : "Customer List added successfully!");
   
    setIsModalVisible(false);
     
    handleRefreshData();
  }, [editingRecord?.customerId, handleRefreshData]);
  

  const renderLoadingState = () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '80px 0',
      minHeight: '400px',
      background: '#f9f9f9',
      borderRadius: '8px'
    }}>
    <Loader /> 
    </div>
  );

  const renderErrorState = () => (
    <div style={{ 
      padding: '40px 20px', 
      textAlign: 'center', 
      background: '#fff1f0',
      border: '1px solid #ffccc7',
      borderRadius: '8px' 
    }}>
      <h3 style={{ color: '#cf1322', marginBottom: '15px' }}>Error Loading Data</h3>
      <p style={{ color: '#555', marginBottom: '20px' }}>{error}</p>
      <Button type="primary" onClick={handleRefreshData}>Try Again</Button>
    </div>
  );

  const renderEmptyState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span>
          No categories found matching your search criteria
        </span>
      }
    >
    </Empty>
  );
  
  return (
    
    <div className="container mt-2">
    <div className="category-management-container" style={{ padding: '0px', maxWidth: '100%' }}>
      {contextHolder}
      {screenSize === 'xs' || screenSize === 'sm' ? renderMobileHeader() : renderDesktopHeader()}     
      {loading ? renderLoadingState() : error ? renderErrorState() : (
        <div 
          id="myGrid" 
          className="ag-theme-alpine" 
          style={{
            height:'515px',
            minHeight: '515px',
            maxHeight: '520px',
            width: '100%',
            fontSize: '14px'
          }}
        >
          {filteredData.length === 0 ? renderEmptyState() : (
            <AgGridReact
              gridOptions={{ suppressMenuHide: true }}
              columnDefs={columnDefs}
              ref={gridRef}
              rowData={filteredData}
              defaultColDef={defaultColDef}
              pagination={true}
              popupParent={popupParent}
              paginationPageSize={10}
              paginationPageSizeSelector={[ 10, 20, 50, 100]}
              domLayout='normal'
              suppressCellFocus={true}
              animateRows={true}
              enableCellTextSelection={true}
              onGridReady={params => {
                params.api.sizeColumnsToFit();
                if (screenSize === 'xs') {
                  params.api.setGridOption('rowHeight', 40);
                }
              }}
              onFirstDataRendered={params => params.api.sizeColumnsToFit()}
            />
          )}
        </div>
      )}
      
      <CustomerModal
        visible={isModalVisible}
        title={editingRecord?.typeId ? `Edit Customer` : 'Add New Customer'}
        button={editingRecord?.typeId ? 'Update' : 'Save'}
        onCancel={() => setIsModalVisible(false)}
        initialValues={editingRecord}
        setIsModalVisible={setIsModalVisible}
        onSave={handleModalSave}
      />

          <CustomerTransactionModal
          visible={isTransactionModalVisible}
          title="Process Transaction"
          button="Save Transaction"
          onCancel={() => setIsTransactionModalVisible(false)}
          initialValues={transactionRecord}
          setIsModalVisible={setIsTransactionModalVisible}
          onSave={handleTransactionModalSave}
        />
    </div>
    
    </div>
  );
};

export default Customer;