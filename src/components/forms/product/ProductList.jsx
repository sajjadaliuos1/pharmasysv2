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
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Toaster } from "../../common/Toaster";
import Loader from "../../common/Loader";
import { deleteProduct, getProduct } from "../../../api/API";
import ProductModal from "./ProductModal";


ModuleRegistry.registerModules([
  AllCommunityModule, 
 
]);

const ProductList = () => {
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
  const [editingId, setEditingId] = useState(null);
  
  const AddnewModal = useCallback((record) => {
    setEditingRecord(record ? { ...record } : { productId: '', categoryId: '', categoryName:'',subCategoryId: '',uomId:'',productName:'',barcode:'',discountPercent:'',stockAlert:'',location:'',description:'',isStrip:'',stripPerBox:'' });
    setIsModalVisible(true);
    setEditingId(null);
  }, []);

  
  const handleEdit = useCallback(async (id) => {
  console.log('handleEdit called with id:', id); 
  setEditingId(id); 
  try {
       await new Promise(resolve => setTimeout(resolve, 50));
    
    const record = rowData.find(item => item.productId === id);
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

  const handleModalCancel = useCallback(() => {
  setIsModalVisible(false);
  setEditingId(null);
}, []);
  const handleDelete = useCallback(async (id) => {     
    try {
      const response = await deleteProduct(id);
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
      width: 80,
      maxWidth: 80,
    },
    {
      headerName: "Product Name",
      field: "productName",
      sortable: true,
      filter: true,
      minWidth: 140,
    },
        {
      headerName: "Category",
      field: "categoryName",
      minWidth: 100,
    },
    {
      headerName: "Subcategory",
      field: "subCategoryName",
      minWidth: 100,
    },
    {
      headerName: "UOM",
      field: "uom",
      minWidth: 100,
    },
    {
      headerName: "Barcode",
      field: "barcode",
      minWidth: 140,
    },
    {
      headerName: "Stock Alert",
      field: "stockAlert",
      minWidth: 100,
    },
    
    {
      headerName: "Strip/Box",
      field: "stripPerBox",
      minWidth: 100,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />}
              onClick={() => handleEdit(params.data.productId)}
              size="small"
              loading={editingId === params.data.productId}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => handleDelete(params.data.productId)}
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
        </Space>
      ),
      minWidth: 130,
    }
  ];
}, [useScreenSize, handleEdit, handleDelete,editingId]);

  
  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

  const fetchInvoiceData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await getProduct();
      console.log("Response from server:", response);
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
      const response = await getProduct();
    
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
    const fileName = prompt("Enter file name for PDF:", "product-data");
    if (!fileName) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Product Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);     
    const columns = ['S.No','product Name','Category Name' , 'subcategoryName', 'UOM', 'Barcode', 'Stock Alert', 'Strip/Box', 'Location', 'Description'];
    
    const rows = rowData.map((row, index) => [
      index + 1,
      row.productName || '',
      row.categoryName || '',
      row.subCategoryName || '',
      row.uom || '',
      row.barcode || '',
      row.stockAlert || '',
      row.stripPerBox || '',
      row.location || '',
      row.description || '',
   
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
      const columnsToExport = columnDefs
        .filter(col => col.field !== 'actions')
        .map(col => ({ 
          field: col.field,
          headerName: col.headerName
        }));
      
      gridRef.current.api.exportDataAsCsv({
        fileName: 'category-data.csv',
        sheetName: 'Categories',
        columnKeys: columnsToExport
          .filter(col => col.field) 
          .map(col => col.field), 
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
    title: "Product Management",
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
         (row.typeName && row.typeName.toLowerCase().includes(searchLower))
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
    Toaster.success(editingRecord?.typeId ? "Product updated successfully!" : "Product added successfully!");   
    setIsModalVisible(false);     
    handleRefreshData();
  }, [editingRecord?.typeId, handleRefreshData]);



//     const handleModalCancel = useCallback(() => 
//       { 
//         console.log("Modal cancelled",editingRecord);
//       editingRecord.barcode  = ''; 
//       editingRecord.productName  = '';
//  editingRecord.stockAlert  = '';
//   editingRecord.location  = '';
//    editingRecord.description  = '';
 

//   }, []);
  

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
      
      <ProductModal
        visible={isModalVisible}
        title={editingRecord?.productId ? `Edit Product` : 'Add Product'}
        button={editingRecord?.productId ? 'Update' : 'Save'}
        // onCancel={() => setIsModalVisible(false)}
      onCancel={handleModalCancel}
        initialValues={editingRecord}
        setIsModalVisible={setIsModalVisible}
        onSave={handleModalSave}
      />
    </div>
    
    </div>
  );
};

export default ProductList;