import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../common/style.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from "ag-grid-community";
import {  message, Button, Empty, Space, Tooltip } from "antd";
import useScreenSize from '../../common/useScreenSize';
import { useTableHeader } from '../../common/useTableHeader';
import { EditOutlined, PrinterOutlined,LogoutOutlined  } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Toaster } from "../../common/Toaster";
import Loader from "../../common/Loader";
import {  getNicuPatient } from "../../../api/API";
import NicuModal from "./NicuModal";
import NicuDischargeModal from "./NicuDischargeModal";
import { useCompanyInfo } from '../../common/CompanyInfoContext';
import { NicuSlip } from '../../utils/NicuSlip';
ModuleRegistry.registerModules([
  AllCommunityModule, 
]);

const Nicu = () => {
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDischargeModalVisible, setIsDischargeModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const gridRef = useRef(null);
  const screenSize = useScreenSize(gridRef);
  const loadingRef = useRef(false); 
 
  const AddnewModal = useCallback((record) => {
    setEditingRecord(record ? { ...record } : { referBy: '', patientName: '', contact: '', address: '', bed : '', admissionDatetime: '', fee:'' });
    setIsModalVisible(true);
  }, []);


  const AddDischargeModal = useCallback((record) => {
    setEditingRecord(record ? { ...record } : { referBy: '', patientName: '', contact: '', address: '', bed : '', admissionDatetime: '', fee:'' });
    setIsDischargeModalVisible(true);
  }, []);

 

  const handleDischarge = useCallback((id) => 
    {
    const record = rowData.find(item => item.nicuId === id);
    if (record) {
      AddDischargeModal(record);
    }
  }, [AddDischargeModal, rowData]);

  const handleEdit = useCallback((id) => 
    {
    const record = rowData.find(item => item.nicuId === id);
    if (record) {
      AddnewModal(record);
    }
  }, [AddnewModal, rowData]);
 

  const { companyInfo, fetchCompanyInfo } = useCompanyInfo();
  
   const handlePrint = async (invoiceId) => {
       let company = companyInfo;
       
       
       if (!company) {
          company = await fetchCompanyInfo(); 
         if (!company) {
           alert("Company info is not available");
           return;
         }
       }
   
        await NicuSlip(invoiceId, company);
     };
 
  const getColumnDefs = useCallback(() => {
    return [
      {
        headerName: '#',
        valueGetter: (params) => params.node.rowIndex + 1, 
        minWidth: 40,
        filter: false,
        sortable: false,
      },
      {
        headerName: "No",
        field: "nicuNo",
        sortable: true,
        filter: true,
        minWidth: 80,
      },
      {
        headerName: "Refer By",
        field: "referBy",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      {
        headerName: "Patient Name",
        field: "patientName",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      {
        headerName: "Contact",
        field: "contact",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
      {
        headerName: "Address",
        field: "address",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      {
        headerName: "Bed No",
        field: "bed",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
     {
  headerName: "Admission Time",
  field: "admissionDatetime",
  sortable: true,
  filter: true,
  minWidth: 180,
  valueFormatter: (params) => {
    if (!params.value) return '';
    return dayjs(params.value).format('DD/MM/YYYY hh:mm A');
  },
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
              
                <Button 
                  icon={<EditOutlined />} 
                  text={params.data.nicuId}
                  onClick={() => handleEdit(params.data.nicuId)} 
                  size="small"
                />
 <Button 
                  icon={<LogoutOutlined  />} 
                  text={params.data.nicuId}
                  onClick={() => handleDischarge(params.data.nicuId)} 
                  size="small"
                />
                  <Button 
                  icon={<PrinterOutlined />} 
                  text={params.data.nicuId}
                  onClick={() => handlePrint(params.data.nicuId)} 
                  size="small"
                />
              
               
            </Space>
          );
        },
      }
    ];
  }, [screenSize, handleEdit, ]);
  
  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

  const fetchInvoiceData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await getNicuPatient(true);
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
        messageApi.info({ content: 'No data available', key: 'loadingData' });
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
      const response = await getNicuPatient();
    
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
    const fileName = prompt("Enter file name for PDF:", "payment-data");
    if (!fileName) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('payment Report', 14, 22);
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

  const { renderMobileHeader, renderDesktopHeader } = useTableHeader({
    title: "Nicu Management",
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
        (row.patientName && row.patientName.toLowerCase().includes(searchLower)) ||
        (row.contact && row.contact.toLowerCase().includes(searchLower))
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
    Toaster.success(editingRecord?.nicuId ? "Record updated successfully!" : "Record added successfully!");
    setIsModalVisible(false);
    handleRefreshData();
  }, [editingRecord?.nicuId, handleRefreshData]);
  
 
 const handleDischargeModalSave = useCallback(() => { 
    Toaster.success(editingRecord?.nicuId ? "Record updated successfully!" : "Record added successfully!");
    setIsDischargeModalVisible(false);
    handleRefreshData();
  }, [editingRecord?.nicuId, handleRefreshData]);

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
          No payments found matching your search criteria
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
        
        <NicuModal
          visible={isModalVisible}
          title={editingRecord?.nicuId ? `Edit Record` : 'Add New Record'}
          button={editingRecord?.nicuId ? 'Update' : 'Save'}
          onCancel={() => setIsModalVisible(false)}
          initialValues={editingRecord}
          setIsModalVisible={setIsModalVisible}
          onSave={handleModalSave}
        />

          <NicuDischargeModal
          visible={isDischargeModalVisible}
          title={`Discharge Patient`}
          button={ 'Discharge'}
          onCancel={() => setIsDischargeModalVisible(false)}
          initialValues={editingRecord}
          setIsModalVisible={setIsDischargeModalVisible}
          onSave={handleDischargeModalSave}
        />

      
      </div>
    </div>
  );
};

export default Nicu;