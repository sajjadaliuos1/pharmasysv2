import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../common/style.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from "ag-grid-community";
import { message, Button, Empty, Space, Tooltip, Popconfirm, Input, InputNumber } from "antd";
import useScreenSize from '../../common/useScreenSize';
import { useTableHeader } from '../../common/useTableHeader';
import { EditOutlined, CheckOutlined } from '@ant-design/icons';
import { Toaster } from "../../common/Toaster";
import Loader from "../../common/Loader";
import { getLowStockProduct, updateLowStockProduct } from "../../../api/API";


ModuleRegistry.registerModules([
  AllCommunityModule, 
]);

const ProductLowStockItem = () => {
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const gridRef = useRef(null);
  const screenSize = useScreenSize(gridRef);
  const loadingRef = useRef(false); 
  const [editingId, setEditingId] = useState(null);
  const [updatedRecords, setUpdatedRecords] = useState(new Set()); // Track updated records
  
  const [stockAlertValues, setStockAlertValues] = useState({}); // Store input values
  

  const handleEdit = useCallback(async (params) => {

    const productId = params.data.productId;
    const qty = parseInt(params.data.alertQty); 
    const stockAlert = params.data.stockAlert;
    if(qty === undefined || qty === null || qty === "") {
      Toaster.error("Please enter a valid stock alert quantity");
    return;
    }
    if( qty === stockAlert) {
      Toaster.info("No changes made to stock alert");
    return;}



    setEditingId(productId); 
    try {
        setEditingId(productId);
        const response = await updateLowStockProduct(productId, qty);
        
        if (response?.data?.status === "Success") {
          // Update the row data
          setRowData(prevData => 
            prevData.map(item => 
              item.productId === productId 
                ? { ...item, stockAlert: stockAlertValues[productId] || item.stockAlert }
                : item
            )
          );
          
          // Mark as updated
          setUpdatedRecords(prev => new Set([...prev, productId]));
          
          Toaster.success("Stock alert updated successfully");
          
          // Refresh the grid
          if (gridRef.current?.api) {
            gridRef.current.api.refreshCells({ force: true });
          }
        } else {
          throw new Error(response?.data?.message || "Update failed");
        }
      } catch (error) {
        console.error('Error updating stock alert:', error);
        Toaster.error(`Failed to update stock alert: ${error.message}`);
      } finally {
        setEditingId(null);
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
        headerName: "Current Stock",
        field: "currentStock",
        minWidth: 100,
      },
      {
        headerName: "Stock Alert",
        field: "stockAlert",
        minWidth: 100,
      },
{
  headerName: "Update Stock Alert",
  field: "alertQty",
  minWidth: 150,
  cellRenderer: (params) => {
  const isUpdated = updatedRecords.has(params.data.productId); // âœ… Only true for updated row

  return (
    <>
      <input
        type="number"
        value={params.value || ""}
        onWheel={(e) => e.target.blur()} // Prevent mouse wheel scrolling
        onChange={(e) => {
          const updatedValue = e.target.value;
          params.node.setDataValue("alertQty", updatedValue);
        }}
        style={{ width: "80%", height: "95%", padding: "4px", borderRadius: "4px", border: "1px solid #d9d9d9" }}
      />
      {isUpdated && (
        <CheckOutlined 
          style={{ 
            color: '#52c41a', 
            fontSize: '16px',
            marginLeft: '4px' 
          }} 
          title="Updated"
        />
      )}
    </>
  );

  }
},  
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params) => (
          <Space size="middle">
            <Tooltip title="Edit">
              <Button 
                icon={<EditOutlined />}
                onClick={() => handleEdit(params)}
                size="small"
                loading={editingId === params.data.productId}
              />
            </Tooltip>
          </Space>
        ),
        minWidth: 130,
      }
    ];
  }, [handleEdit, editingId]);

  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

  const fetchInvoiceData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await getLowStockProduct();
      console.log("Response from server:", response);
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      const data = response?.data?.data || [];
      setRowData(data);
      setFilteredData(data);
      
      // Initialize stock alert values
      const initialValues = {};
      data.forEach(item => {
        initialValues[item.productId] = item.stockAlert;
      });
      setStockAlertValues(initialValues);
      
      if (data.length > 0) {
        messageApi.success({ content: 'Data loaded successfully', key: 'loadingData' });
      } else {
        messageApi.info({ content: 'No product data available', key: 'loadingData' });
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
      const response = await getLowStockProduct();
    
      if (!response) {
        throw new Error("Failed to fetch products");
      }
      
      const data = response?.data?.data || [];
      
      setRowData(data);
      setFilteredData(data);
      
      // Reset stock alert values and updated records on refresh
      const initialValues = {};
      data.forEach(item => {
        initialValues[item.productId] = item.stockAlert;
      });
      setStockAlertValues(initialValues);
      setUpdatedRecords(new Set());
      
      if (gridRef.current?.api) {
        gridRef.current.api.setRowData(data);
        gridRef.current.api.refreshCells();
      }
      
      Toaster.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      Toaster.error("Failed to fetch products");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const handleExportPDF = useCallback(() => {
    const fileName = prompt("Enter file name for PDF:", "product-low-stock-data");
    if (!fileName) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Product Low Stock Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);     
    const columns = ['S.No', 'Product Name', 'Current Stock', 'Stock Alert'];
    
    const rows = rowData.map((row, index) => [
      index + 1,
      row.productName || '',
      row.currentStock || '',
      row.stockAlert || '',
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
        .filter(col => col.field !== 'actions' && col.headerName !== 'Update Stock Alert')
        .map(col => ({ 
          field: col.field,
          headerName: col.headerName
        }));
      
      gridRef.current.api.exportDataAsCsv({
        fileName: 'product-low-stock-data.csv',
        sheetName: 'Low Stock Products',
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
    title: "Product Low Stock Management",
    onRefresh: handleRefreshData,
    onExportExcel: handleExportExcel,
    onExportPDF: handleExportPDF,
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
        (row.productName && row.productName.toLowerCase().includes(searchLower)) ||
        (row.currentStock && row.currentStock.toString().toLowerCase().includes(searchLower)) ||
        (row.stockAlert && row.stockAlert.toString().toLowerCase().includes(searchLower))
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
          No low stock products found matching your search criteria
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
                paginationPageSizeSelector={[10, 20, 50, 100]}
                domLayout='normal'
                suppressCellFocus={true}
                animateRows={true}
                enableCellTextSelection={true}
                onGridReady={params => {
                  params.api.sizeColumnsToFit();
                  if (screenSize === 'xs') {
                    params.api.setGridOption('rowHeight', 50); // Increased height for input field
                  }
                }}
                onFirstDataRendered={params => params.api.sizeColumnsToFit()}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductLowStockItem;