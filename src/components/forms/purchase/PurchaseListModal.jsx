import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Modal, Typography } from 'antd';
import { AgGridReact } from "ag-grid-react";
import { message } from "antd";
import { getPurchaseDetailsById } from "../../../api/API";

const { Title } = Typography;

const PurchaseListModal = ({ visible, onCancel, purchaseDetails,  width, zIndex, purchaseId }) => {
  const gridRef = useRef(null);
  const [error, setError] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  
  // Extract data safely
  const mainData = purchaseDetails?.data || purchaseDetails || {};
  const itemsData = mainData?.items || rowData; // Use fetched rowData if items not available

  // Fetch purchase details when modal opens and purchaseId is available
  useEffect(() => {
    if (visible && purchaseId) {
      fetchPurchaseDetails(purchaseId);
    }
  }, [visible, purchaseId]); // Dependencies: modal visibility and purchaseId

  // For purchase details modal
  const fetchPurchaseDetails = useCallback(async (purchaseId) => {
    if (!purchaseId) return;
     
    try {
      const response = await getPurchaseDetailsById(purchaseId);
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
      headerName: "Name",
      field: "productName",
      minWidth: 150,
    },
    {
      headerName: "Batch No",
      field: "batchNo",
      minWidth: 130,
    },
    {
      headerName: "Quantity",
      headerClass: 'quantity-header',
      headerStyle: { color: 'red', 'background-color': 'green' },
      children: [
        { headerName: "Purchase Qty", field: "purchaseQuantity", minWidth: 130 },
        { headerName: "Remaining Qty", field: "remainingQuantity", minWidth: 130 },
        { headerName: "Remaining Open Strip", field: "remainingOpenStrip", minWidth: 180 },
      ]
    },
    {
      headerName: "Purchase Record",
      headerClass: 'purchase-header',
      children: [
        {
          headerName: "Purchase Rate",
          field: "purchaseRate",
          minWidth: 130,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "Discount %",
          field: "purchaseDiscountPercent",
          minWidth: 130,
        },
        {
          headerName: "Final Rate",
          field: "finalPurchaseRate",
          minWidth: 130,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        }
      ]
    },
    {
      headerName: "Sale Record",
      headerClass: 'sale-header',
      children: [
        {
          headerName: "Sale Rate",
          field: "saleRate",
          minWidth: 130,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "Discount %",
          field: "saleDiscountPercent",
          minWidth: 130,
        },
        {
          headerName: "Final Rate",
          field: "finalSaleRate",
          minWidth: 130,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "Min Sale Rate",
          field: "minimumSaleRate",
          minWidth: 150,
        }
      ]
    },
    {
      headerName: "Strip Record",
      headerClass: 'strip-header',
      children: [
        {
          headerName: "Strip Rate",
          field: "stripRate",
          minWidth: 130,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "Discount %",
          field: "stripDiscountPercent",
          minWidth: 130,
        },
        {
          headerName: "Final Rate",
          field: "finalStripRate",
          minWidth: 130,
          valueFormatter: (params) => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
        },
        {
          headerName: "Min Strip Rate",
          field: "minimumStripRate",
          minWidth: 150,
        }
      ]
    },
    {
      headerName: "Barcode",
      field: "barcode",
      minWidth: 150,
    },
    // {
    //   headerName: "Total Amount",
    //   valueGetter: (params) => {
    //     const quantity = params.data?.purchaseQuantity || 0;
    //     const rate = params.data?.finalPurchaseRate || 0;
    //     return quantity * rate;
    //   },
      
    //   valueFormatter: (params) => {
    //     return params.value ? `${parseFloat(params.value).toFixed(2)}` : '0.00';
    //   },
    // }
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
            Purchase Details - Invoice #{mainData?.purchaseId || purchaseId || 'N/A'}
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
              domLayout='autoHeight'
              suppressCellFocus={true}
              animateRows={true}
              enableCellTextSelection={true}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              onGridReady={params => {
                params.api.sizeColumnsToFit();
              }}
              onFirstDataRendered={params => params.api.sizeColumnsToFit()}
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

export default PurchaseListModal;