import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../common/style.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

import { ModuleRegistry } from 'ag-grid-community';
 import { AllCommunityModule } from "ag-grid-community";
import {  message, Button, Empty } from "antd";
import useScreenSize from '../../common/useScreenSize';
import { useTableHeader } from '../../common/useTableHeader';

import Loader from "../../common/Loader";
import {getSupplerPaymentByDateRange } from "../../../api/API";

import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

ModuleRegistry.registerModules([
  AllCommunityModule, 
 
]);

const  SupplierPaymentDetails = () => {
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  const gridRef = useRef(null);
  const screenSize = useScreenSize(gridRef);
  const loadingRef = useRef(false); 
  const [dateRange, setDateRange] = 
  useState([
   dayjs().subtract(30, 'day'), // 30 days ago
  dayjs() // Today
  ]);

  const location = useLocation();
  const { supplierId , supplerName } = location.state || {};


   const getColumnDefs = useCallback(() => {
    return [
      {
        headerName: 'S.No',
        valueGetter: (params) => params.node.rowIndex + 1, 
        minWidth: 80,       
      },
      {
        headerName: "Paid",
        field: "paid",
        sortable: true,
        filter: true,
        minWidth: 140,
      },

       {
        headerName: "Dicount",
        field: "discount",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
       {
        headerName: "Remaining",
        field: "remaining",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
         {
        headerName: "Payment Type",
        field: "paymentMethod",
        sortable: true,
        filter: true,
        minWidth: 140,
      }, 
     {
        headerName: "Description",
        field: "description",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
           {
        headerName: "Date",
        field: "date",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
    ];
  }, [screenSize]);
  
  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

const fetchPaymentDetailData = useCallback(async () => {
  if (loadingRef.current || !supplierId) return;  
  
  loadingRef.current = true;
  setLoading(true);
  
  try {
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      
      const response = await getSupplerPaymentByDateRange(supplierId, startDate, endDate);
      console.log('API Response:', response.data);
      
      if (!response?.data) {
        throw new Error("Invalid response from server");
      }
      
      const data = response.data.data || [];
      setRowData(data);
      setFilteredData(data);
 
      messageApi[data.length ? 'success' : 'info']({ 
        content: data.length 
          ? 'Payment records loaded successfully' 
          : 'No records found for selected criteria',
        key: 'loadingData'
      });
    } else {
      messageApi.info({ 
        content: 'Please select a date range', 
        key: 'loadingData' 
      });
      setRowData([]);
      setFilteredData([]);
    }
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
}, [messageApi, dateRange, supplierId]); 

const handleRefreshData = useCallback(async () => {
  await fetchPaymentDetailData();  
}, [fetchPaymentDetailData]);


useEffect(() => {
  if (supplierId && dateRange[0] && dateRange[1]) {
    handleRefreshData();
  }
}, [supplierId, dateRange, handleRefreshData]);

  const handleExportPDF = useCallback(() => {
      const fileName = prompt("Enter file name for PDF:", "category-data");
      if (!fileName) return;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Category Report', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      const columns = ['S.No', 'Name','Description', 'Amount In', 'Amount Out', 'Remaining'];
      
      
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
     
      const columnsToExport = columnDefs
        .filter(col => col.field !== 'actions')
        .map(col => ({ 
          field: col.field,
          headerName: col.headerName
        }));
      
      gridRef.current.api.exportDataAsCsv({
        fileName: 'payment-data.csv',
        sheetName: 'Payment',
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

const handleDateChange = (dates) => {
  setDateRange(dates); // Store the array directly
  
  if (dates && dates[0] && dates[1]) {
    console.log('Start Date:', dates[0].format('YYYY-MM-DD'));
    console.log('End Date:', dates[1].format('YYYY-MM-DD'));
  } else {
    console.log('No date selected');
    setDateRange([null, null]); // Reset to null array when cleared
  }
};

  const { renderMobileHeader, renderDesktopHeader } = useTableHeader({
    title: ` Supplier Payment Details of ${supplerName}`,
    onRefresh: handleRefreshData,
    onExportExcel: handleExportExcel,
    onExportPDF: handleExportPDF,
    // onAddNew: () => AddnewModal(null),
    onTableSizeChange: handleTableSizeChange,
    onSearchChange: (e) => setSearchText(e.target.value),
    dateRange,
    handleDateChange,
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
    fetchPaymentDetailData();
    
    return () => {
      loadingRef.current = false;
    };
  }, [fetchPaymentDetailData]);

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

       </div>    
    </div>
  );
};

export default SupplierPaymentDetails;