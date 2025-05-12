import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "../common/style.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ExcelExportModule } from "ag-grid-enterprise";
import { ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule, PivotModule, TreeDataModule, ServerSideRowModelModule, SetFilterModule } from 'ag-grid-enterprise';
import { AllCommunityModule } from "ag-grid-community";
import { Spin, message, Button, Empty, Space, Tooltip, Popconfirm } from "antd";
import useScreenSize from '../common/useScreenSize';
import { useTableHeader } from '../common/useTableHeader';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import CategoryModal from './CategoryModol';

ModuleRegistry.registerModules([
  AllCommunityModule, 
  ExcelExportModule,
  RowGroupingModule,
  PivotModule,
  TreeDataModule,
  ServerSideRowModelModule,
  SetFilterModule
]);

const Categorydetail = () => {
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
  
  // Action handlers - defined early to avoid reference issues
  const AddnewModal = useCallback((record) => {
    setEditingRecord(record ? { ...record } : { typeId: '', typeName: '' });
    setIsModalVisible(true);
  }, []);

  const handleEdit = useCallback((id) => {

 
    const record = rowData.find(item => item.typeId === id);
    if (record) {
      AddnewModal(record);
    }
  }, [AddnewModal, rowData]);

  const handleDelete = useCallback((id) => {
    console.log("Delete category id:", id);
    // Add your delete API call here
    // For example:
    // axios.delete(`https://pos.idotsolution.com/api/Setting/categories/${id}`)
    //   .then(() => {
    //     messageApi.success('Category deleted successfully');
    //     fetchInvoiceData(); // Refresh data after delete
    //   })
    //   .catch(err => {
    //     messageApi.error(`Delete failed: ${err.message}`);
    //   });
    messageApi.success('Category deleted successfully');
  }, [messageApi]);

  // Define column definitions before using them in functions
  const getColumnDefs = useCallback(() => {
    return [
      {
        headerName: 'S.No',
        valueGetter: (params) => params.node.rowIndex + 1, 
        width: 80,
        // cellStyle: { textAlign: 'center' },
        pinned: 'left', 
      },
      {
        headerName: "Category ID",
        field: "typeId",
        sortable: true,
        filter: true,
        minWidth: 140,
        hide: screenSize === 'xs',
      },
      {
        headerName: "Category Name",
        field: "typeName",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
     
      {
        headerName: "Actions",
        field: "actions",
        sortable: false,
        filter: false,
        minWidth: 110,
        cellRenderer: (params) => {
          return (
            <Space size="middle">
              <Tooltip title={params.data.typeId}>
                <Button 
                  icon={<EditOutlined />} 
                  text={params.data.typeId}
                  onClick={() => handleEdit(params.data.typeId)} 
                  size="small"
                />
              </Tooltip>
              <Popconfirm
                title="Are you sure you want to delete?"
                onConfirm={() => handleDelete(params.data._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  icon={<DeleteOutlined />} 
                  danger 
                  size="small"
                />
              </Popconfirm>
            </Space>
          );
        },
        suppressSizeToFit: true,
      }
    ];
  }, [screenSize, handleEdit, handleDelete]);
  
  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

  const fetchInvoiceData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
 
    
    try {
       // messageApi.loading({ content: 'Loading category data...', key: 'loadingData', duration: 0 });
      
      // await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await getCategories();
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
      // loadingRef.current = false;
    }
  }, [messageApi]);

  // Other handlers defined after columnDefs
  const handleRefreshData = useCallback(() => {
    // Only trigger refresh if not already loading
    if (!loadingRef.current) {
      fetchInvoiceData();
    } else {
      messageApi.info('Data is currently loading');
    }
  }, [fetchInvoiceData, messageApi]);

  const handleExportPDF = useCallback(() => {
    const fileName = prompt("Enter file name for PDF:", "category-data");
    if (!fileName) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Category Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Use columnDefs safely now that it's defined
    const visibleCols = columnDefs.filter(col => !col.hide && col.field !== 'actions');
    const columns = visibleCols.map((col) => col.headerName || col.field);
    const rows = rowData.map((row) =>
      visibleCols.map((col) => row[col.field] || "")
    );

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    doc.save(`${fileName}.pdf`);
  }, [rowData, columnDefs]);

  const handleExportExcel = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsExcel({
        fileName: 'category-data.xlsx',
        sheetName: 'Categories'
      });
    }
  }, []);

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

  // Now we can safely use all the handlers in useTableHeader
  const { renderMobileHeader, renderDesktopHeader } = useTableHeader({
    title: "Category Management",
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
    enableRowGroup: true,
    enableValue: true,
    filter: true,
    resizable: true,
    suppressSizeToFit: false
  }), []);

  const popupParent = useMemo(() => document.body, []);
  
  // Effect hooks - Only run once on mount with proper cleanup
  useEffect(() => {
    // Set loading to true immediately to show loading state
    setLoading(true);
    fetchInvoiceData();
    
    return () => {
      // Reset state on unmount
      loadingRef.current = false;
    };
  }, [fetchInvoiceData]);

  // Optimize filtering for better performance
  useEffect(() => {
    const filterData = () => {
      if (!searchText.trim()) {
        setFilteredData(rowData);
        return;
      }
      
      const searchLower = searchText.toLowerCase();
      const filtered = rowData.filter(row =>
        (row.categoryId && row.categoryId.toString().toLowerCase().includes(searchLower)) ||
        (row.category && row.category.toLowerCase().includes(searchLower))
      );
  
      setFilteredData(filtered);
    };
    
    // Debounce search for better performance
    const handler = setTimeout(() => {
      filterData();
      
      // Update grid filters if grid is ready
      if (gridRef.current && gridRef.current.api) {
        gridRef.current.api.onFilterChanged();
      }
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchText, rowData]);

  
  
  // UI Components
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
      <Spin size="large" />
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
    <div className="category-management-container" style={{ padding: '10px', maxWidth: '100%' }}>
      {contextHolder}
     
      {screenSize === 'xs' || screenSize === 'sm' ? renderMobileHeader() : renderDesktopHeader()}
      
      {loading ? renderLoadingState() : error ? renderErrorState() : (
        <div 
          id="myGrid" 
          className="ag-theme-alpine" 
          style={{
            height: screenSize === 'xs' ? '450px' : '500px', 
            width: '100%',
            fontSize: screenSize === 'xs' ? '12px' : '14px'
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
              paginationPageSize={screenSize === 'xs' ? 5 : 10}
              paginationPageSizeSelector={[5, 10, 20, 50, 100]}
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
      
      <CategoryModal
        visible={isModalVisible}
        title={editingRecord?.typeId ? `Edit Category` : 'Add New Category'}
        onCancel={() => setIsModalVisible(false)}
        initialValues={editingRecord}
        
      />
    </div>
  );
};

export default Categorydetail;