
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
import Loader from "../../common/Loader";
import { getUser ,deleteUser} from "../../../api/API";
import UserModal from "./UserModal";
import AddEmloyeeModal from "./AddEmloyeeModal";
import { Toaster } from "../../common/Toaster";
import { EditOutlined, DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons';

ModuleRegistry.registerModules([
  AllCommunityModule, 
 
]);

const User = () => {
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const gridRef = useRef(null);
  const screenSize = useScreenSize(gridRef);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddEmployeeModalVisible, setIsAddEmployeeModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const loadingRef = useRef(false); 

  
  const AddnewModal = useCallback((record) => {
    setEditingRecord(record ? { ...record } : { name: '', contactNo: '', address: '' });
    setIsModalVisible(true);
  }, []);

    const AddnewEmployeeModal = useCallback((record) => {
    setEditingRecord(record ? { ...record } : { name: '',username:'', contactNo: '', address: '' });
    setIsAddEmployeeModalVisible(true);
  }, []);

  
    const handleEdit = useCallback(async (id) => {
    console.log('handleEdit called with id:', id); 

    try {
         await new Promise(resolve => setTimeout(resolve, 50));
      
      const record = rowData.find(item => item.employeeId === id);
      console.log('Found record:', record);
      if (record) {
        AddnewModal(record);
      } else {
        messageApi.error('Product not found');
      }
    } catch (error) {
      console.error('Error in handleEdit:', error);
      messageApi.error('An error occurred while editing');
    } finally {
    }
  }, [AddnewModal, rowData, messageApi]);

      const handleEditEmploee = useCallback(async (id) => {
    console.log('handleEdit called with id:', id); 

    try {
         await new Promise(resolve => setTimeout(resolve, 50));
      
      const record = rowData.find(item => item.employeeId === id);
      console.log('Found record:', record);
      if (record) {
        AddnewEmployeeModal(record);
      } else {
        messageApi.error('Product not found');
      }
    } catch (error) {
      console.error('Error in handleEdit:', error);
      messageApi.error('An error occurred while editing');
    } finally {
    }
  }, [AddnewEmployeeModal, rowData, messageApi]);

    const handleDelete = useCallback(async (id) => {     
      try {
        const response = await deleteUser(id);
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
        minWidth: 80,
        // width: 80,
        //  pinned: 'left', 
      },
      {
        headerName: "Name",
        field: "name",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
            {
        headerName: "UserName",
        field: "username",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
       {
        headerName: "Contact No",
        field: "contactNo",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
       {
        headerName: "Address",
        field: "address",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
          {
            headerName: "Actions",
            field: "actions",
            pinned: 'right',  
            cellRenderer: (params) => (
              <Space size="middle">
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(params.data.employeeId)}
                    size="small"
                  />
                </Tooltip>
                <Popconfirm
                  title="Are you sure you want to delete?"
                  onConfirm={() => handleDelete(params.data.employeeId)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      danger 
                      size="small"
                    />
                  </Tooltip>
                </Popconfirm>
                                  <Button 
                    icon={<PlusSquareOutlined />}
                    onClick={() => handleEditEmploee(params.data.employeeId)}
                    size="small"
                  />
              </Space>
            ),
            minWidth: 130,
          }
    ];
  }, [screenSize,handleDelete, handleEdit]);
  
  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

// Updated fetchUserData function
const fetchUserData = useCallback(async () => {
  
  loadingRef.current = true;
  setLoading(true);
  
  try {

      
      const response = await getUser();
      console.log('API Response: expenseeeeee', response.data);
      
      if (!response?.data) {
        throw new Error("Invalid response from server");
      }
      
      const data = response.data.data || [];
      setRowData(data);
      setFilteredData(data);
      
      // Simplified message logic
      messageApi[data.length ? 'success' : 'info']({ 
        content: data.length 
          ? 'User records loaded successfully' 
          : 'No records found',
        key: 'loadingData'
      });
  } catch (err) {
    console.error('Error:', err);
    messageApi.error({ 
      content: `Failed to fetch records: ${err.message || 'Unknown error'}`,
      key: 'loadingData'
    });
    setError(err.message);
  } finally {
    setLoading(false);
    loadingRef.current = false;
  }
}, [messageApi]);  // Added paymentId to dependencies

// Consolidated refresh function
const handleRefreshData = useCallback(async () => {
  await fetchUserData();  // Reuse the same logic
}, [fetchUserData]);

  const handleExportPDF = useCallback(() => {
      const fileName = prompt("Enter file name for PDF:", "User-data");
      if (!fileName) return;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('User Report', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Include serial number and exclude actions column
      const columns = ['S.No', 'Expense Name','Amount', 'Payment Method', 'Description', 'Date'];
      
      
      const rows = rowData.map((row, index) => [
        index + 1,
        row.name || '',
        row.description || '',
        row.amountIn || '',  
        row.amountOut || '',
        row.remaining || '',
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
        fileName: 'user-data.csv',
        sheetName: 'User',
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
    title: `Employee Details`,
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
    fetchUserData();
    
    return () => {
      loadingRef.current = false;
    };
  }, [fetchUserData]);

  useEffect(() => {
    const filterData = () => {
      if (!searchText.trim()) {
        setFilteredData(rowData);
        return;
      }
      
      const searchLower = searchText.toLowerCase();
      const filtered = rowData.filter(row =>
        // (row.typeId && row.typeId.toString().toLowerCase().includes(searchLower)) ||
        (row.name && row.name.toLowerCase().includes(searchLower))
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
    // Toaster.success(editingRecord?.typeId ? "User updated successfully!" : "User added successfully!");
   
    setIsModalVisible(false);
     
    handleRefreshData();
  }, [editingRecord?.typeId, handleRefreshData]);

      const handleEmploeeModalSave = useCallback(() => { 
    Toaster.success(editingRecord?.userId ? "User updated successfully!" : "User added successfully!");
   
    setIsModalVisible(false);
     
    handleRefreshData();
  }, [editingRecord?.userId, handleRefreshData]);

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
          No User found matching your search criteria
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
      
      
      <UserModal
        visible={isModalVisible}
        title={editingRecord?.employeeId ? 'Update Employee' : 'Add Employee'}
        button={editingRecord?.employeeId ? 'Update' : 'Save'}
        onCancel={() => setIsModalVisible(false)}
        initialValues={editingRecord}
        setIsModalVisible={setIsModalVisible}
        onSave={handleModalSave}
      />

            <AddEmloyeeModal
        visible={isAddEmployeeModalVisible}
        title={'Employee'}
        button={editingRecord?.userId ? 'Update' : 'Save'}
        onCancel={() => setIsAddEmployeeModalVisible(false)}
        initialValues={editingRecord}
        setIsModalVisible={isAddEmployeeModalVisible}
        onSave={handleEmploeeModalSave}
      />

    </div>
    
    </div>
  );
};
export default User;