import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../common/style.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from "ag-grid-community";
import {  message, Button, Empty, Space, Tooltip} from "antd";
import useScreenSize from '../../common/useScreenSize';
import { useTableHeader } from '../../common/useTableHeader';
import { InfoCircleOutlined, PrinterOutlined } from '@ant-design/icons';
import { TestSlip } from '../../utils/TestSlip';
import Loader from "../../common/Loader";
import { testRecord } from "../../../api/API";
import dayjs from 'dayjs';

import LaboratoryListModol from "./LaboratoryListModal";
import { useCompanyInfo } from '../../common/CompanyInfoContext';
ModuleRegistry.registerModules([
  AllCommunityModule, 
]);

const  LaboratoryList = () => {
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [testDetailsId, setTestDetailsId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newTestNo, setNewTestNo] = useState();
  const gridRef = useRef(null);
  const screenSize = useScreenSize(gridRef);
  const loadingRef = useRef(false); 
  const [dateRange, setDateRange] = 
  useState([
   dayjs().subtract(30, 'day'), // 30 days ago
  dayjs() // Today
  ]);
  const { companyInfo, fetchCompanyInfo } = useCompanyInfo();
  
   const handlePrint = async (invoiceId) => {
       let company = companyInfo;
        
    //    const newInv = parseInt(newTestNo, 10);
    //   const invoiceId = newInv - 1;     
       if (!company) {
          company = await fetchCompanyInfo(); 
         if (!company) {
           alert("Company info is not available");
           return;
         }
       }
   
        await TestSlip(invoiceId, company);
     };
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
        headerName: "Test No",
        field: "testNo",
        sortable: true,
        filter: true,
        minWidth: 110,
      },
       {
        headerName: "Customer Name",
        field: "customerName",
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
        headerName: "Doctor Name",
        field: "doctorName",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
          
     {
        headerName: "Total Test",
        field: "totalTest",
        sortable: true,
        filter: true,
        minWidth: 110,
      },
      {
        headerName: "Total Amount",
        field: "totalAmount",
        sortable: true,
        filter: true,
        minWidth: 110,
      },
           {
        headerName: "Discount",
        field: "discount",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
                 {
        headerName: "Paid Amount",
        field: "paidAmount",
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
            {
              headerName: "Actions",
              field: "actions",
              sortable: false,
              pinned: 'right',
              filter: false,
              minWidth: 100,
              cellRenderer: (params) => {
                return (
                  <Space size="middle">
                    <Tooltip title="Details">
                      <Button 
                        icon={<InfoCircleOutlined />} 
                        onClick={() => {
                          setTestDetailsId(params.data.testRecordId); 
                          setIsModalVisible(true);
                        }}
                        size="small"
                    />
                     
                    </Tooltip>
                    <Tooltip title="Print">
                      <Button 
                        icon={<PrinterOutlined />} 
                            onClick={() => {
                          handlePrint(params.data.testNo); 
                         
                        }}
                      
                   
                        size="small"
                    />
                     
                    </Tooltip>
                  </Space>
                  
                );
              },
            }
    ];
  }, [screenSize]);
  
  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

// Updated fetchPaymentDetailData function
const fetchPaymentDetailData = useCallback(async () => {
  if (loadingRef.current) return;  // Add paymentId check
  loadingRef.current = true;
  setLoading(true);
  
  try {
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      
      const response = await testRecord(startDate, endDate);
      console.log('API Response: asasa', response.data);
      
      if (!response?.data) {
        throw new Error("Invalid response from server");
      }
      
      const data = response.data.data || [];
      setRowData(data);
      setFilteredData(data);
      
      // Simplified message logic
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
}, [messageApi, dateRange]);  // Added paymentId to dependencies

// Consolidated refresh function
const handleRefreshData = useCallback(async () => {
  await fetchPaymentDetailData();  // Reuse the same logic
}, [fetchPaymentDetailData]);

// useEffect hook
useEffect(() => {
  if (dateRange[0] && dateRange[1]) {
    handleRefreshData();
  }
}, [dateRange, handleRefreshData]);

  const handleExportPDF = useCallback(() => {
      const fileName = prompt("Enter file name for PDF:", "category-data");
      if (!fileName) return;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Category Report', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Include serial number and exclude actions column
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
      // Export only specific columns, excluding the actions column
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
    title: `Tests Details`,
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
        // (row.typeId && row.typeId.toString().toLowerCase().includes(searchLower)) ||
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
      

<LaboratoryListModol 
      width={500}
      zIndex={3000}
  visible={isModalVisible}
  onCancel={() => {
    setIsModalVisible(false);
  }}
  loading={loading}
    testId={testDetailsId} 
/>
    </div>
    
    </div>
  );
};

export default LaboratoryList;