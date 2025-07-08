import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Modal, Typography } from 'antd';
import { AgGridReact } from "ag-grid-react";
import { message } from "antd";
import { getProductInventoryDetail } from "../../../api/API";

const { Title } = Typography;

const ProductAvailableStockDetailModal = ({ visible, onCancel, productDetails,  width, zIndex, productId }) => {
  const gridRef = useRef(null);
  const [error, setError] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  
  // Extract data safely
  const mainData = productDetails?.data || productDetails || {};
  const itemsData = mainData?.items || rowData; // Use fetched rowData if items not available

  // Fetch purchase details when modal opens and purchaseId is available
  useEffect(() => {
    if (visible && productId) {
      productInventoryDetail(productId);
    }
  }, [visible, productId]); // Dependencies: modal visibility and purchaseId

  // For purchase details modal
  const productInventoryDetail = useCallback(async (productId) => {
    if (!productId) return;
     
    try {
      const response = await getProductInventoryDetail(productId);
      console.log('Purchase Details Response:', response.data);
      if (!response?.data) {
        throw new Error("Invalid response from server");
      }
      const data = response.data.data || [];
      setRowData(data);
      setFilteredData(data);
      messageApi.success({
        content: 'Purchase details loaded successfully',
        key: 'loadingData'
      });
    } catch (err) {
      console.error('Error fetching purchase details:', err);
      messageApi.error({
        content: `Failed to fetch purchase details: ${err.message || 'Unknown error'}`,
        key: 'loadingData'
      });
      setError(err.message);
    } finally {
      
    }
  }, [ messageApi]);

  // Reset data when modal closes
  useEffect(() => {
    if (!visible) {
      setRowData([]);
      setFilteredData([]);
      setError(null);
    }
  }, [visible]);

  // Column definitions for AG Grid - Updated to match your data structure
  const columnDefs = useMemo(() => [
    {
      headerName: 'S.No',
      valueGetter: (params) => params.node.rowIndex + 1,
      minWidth: 70,
      width: 70,
    },
    {
      headerName: "Batch No",
      field: "batchNo",
      width: 95,
    },
    {
      headerName: "Quantity",
      headerClass: 'quantity-header',
      headerStyle: { 'background-color': '#FFF3E0' },
      children: [
        { headerName: "Purchase", field: "purchaseQuantity", width: 95 },
        { headerName: "Remaining", field: "remainingQuantity", width: 95 },
        { headerName: "OpenStrip", field: "remainingOpenStrip", width: 100 },
      ]
    },
    {
      headerName: "Purchase Record",
      headerClass: 'purchase-header',
      children: [
        {
          headerName: "Purchase",
          field: "purchaseRate",
          width: 95,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "Discount",
          field: "purchaseDiscountPercent",
          width: 95,
        },
        {
          headerName: "Final",
          field: "finalPurchaseRate",
          width: 90,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        }
      ]
    },
    {
      headerName: "Sale Record",
      headerClass: 'sale-header',
      children: [
        {
          headerName: "Rate",
          field: "saleRate",
          width: 85,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "Discount",
          field: "saleDiscountPercent",
          width: 95,
        },
        {
          headerName: "Final",
          field: "finalSaleRate",
          width: 90,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "MinRate",
          field: "minimumSaleRate",
          width: 95,
        }
      ]
    },
    {
      headerName: "Strip Record",
      headerClass: 'strip-header',
      headerStyle: { 'background-color': '#E3F2FD' },
      children: [
        {
          headerName: "Rate",
          field: "stripRate",
          width: 90,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "Final",
          field: "finalStripRate",
          width: 90,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "MinStrip",
          field: "minimumStripRate",
          width: 95,
        }
      ]
    },
  ], []);

  const defaultColDef = useMemo(() => ({
     
    resizable: true,
    suppressSizeToFit: false,
    
  }), []);

  const popupParent = useMemo(() => document.body, []);

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Purchase Details - Invoice #{mainData?.productId || productId || 'N/A'}
          </Title>
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={1200}
        zIndex={zIndex || 1000}
        
        style={{ top: 20 }}
      >
        {/* Items Grid */}
        <div style={{ marginTop: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>Purchase Items</Title>
          <div 
            className="ag-theme-alpine" 
            style={{
              height: '450px',
              width: '100%',
              overflowX: 'auto',
              fontSize: '13px'
            }}
          >
            <AgGridReact
              gridOptions={{ suppressMenuHide: true }}
              columnDefs={columnDefs}
              ref={gridRef}
              rowData={itemsData}
              defaultColDef={defaultColDef}
              pagination={false}
              popupParent={popupParent}
              domLayout='normal'
              suppressCellFocus={true}
              animateRows={true}
              enableCellTextSelection={true}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              // onGridReady={params => {
              //   params.api.sizeColumnsToFit();
              // }}
              // onFirstDataRendered={params => params.api.sizeColumnsToFit()}
              noRowsOverlayComponent={() => (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>📦</div>
                  <div>No items found in this purchase</div>
                </div>
              )}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductAvailableStockDetailModal;