import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../common/style.css";

import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from "ag-grid-community";
import { message,  Empty } from "antd";
import useScreenSize from '../../common/useScreenSize';
import Loader from "../../common/Loader";
import { ExpiredProduct, } from "../../../api/API";

ModuleRegistry.registerModules([
  AllCommunityModule, 
]);

const ExpiredProducts = () => {
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const gridRef = useRef(null);
  const screenSize = useScreenSize(gridRef);
  const loadingRef = useRef(false); 
  
  const getColumnDefs = useCallback(() => {
    return [
      {
        headerName: 'S#',
        valueGetter: (params) => params.node.rowIndex + 1,
        minWidth: 50,
        width: 50,         
        sortable: false,
        filter:false,
      },
      {
        headerName: "Product Name",
        field: "productName",
        sortable: true,
        filter: true,
        minWidth: 230,
      },
        {
        headerName: "Batch No",
        field: "batchNo",
        sortable: true,
        filter: true,
        minWidth: 130,
      },
       {
        headerName: "Manufacture Date",
        field: "manufactureDate",
        sortable: true,
        filter: true,
        minWidth: 130,
      },
       {
        headerName: "Expiry Date",
        field: "expiryDate",
        sortable: true,
        filter: true,
        minWidth: 130,
      },
      {
        headerName: "Current Stock",
        field: "remainingQuantity",
        minWidth: 100,
      },
    ];
  }, []);

  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

  const fetchInvoiceData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await ExpiredProduct();
      console.log("Response from server:", response);
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      const data = response?.data?.data || [];
      setRowData(data);
      setFilteredData(data);
      const initialValues = {};
      data.forEach(item => {
        initialValues[item.productId] = item.stockAlert;
      });
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
    
    </div>
  );

  const renderEmptyState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span>
          No Exp products found matching your search criteria
        </span>
      }
    >
    </Empty>
  );
  
  return (
    <div className="container mt-2">
      <div className="category-management-container" style={{ padding: '0px', maxWidth: '100%' }}>
        {contextHolder}
        {screenSize === 'xs' || screenSize === 'sm'}  
         <h4 style={{ marginBottom: '12px' }}>Expired Products </h4>   
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

export default  ExpiredProducts;