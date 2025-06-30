import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Modal, Typography } from 'antd';
import { AgGridReact } from "ag-grid-react";
import { message } from "antd";
import { getSaleDetailsById } from "../../../api/API";

const { Title } = Typography;

const SaleRecordDetail = ({ visible, onCancel, purchaseDetails,  width, zIndex, saleId }) => {
  const gridRef = useRef(null);
  const [error, setError] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  
  const mainData = purchaseDetails?.data || purchaseDetails || {};
  const itemsData = mainData?.items || rowData; // Use fetched rowData if items not available

   useEffect(() => {
    if (visible && saleId) {
      fetchPurchaseDetails(saleId);
    }
  }, [visible, saleId]); // Dependencies: modal visibility and saleId

  // For purchase details modal
  const fetchPurchaseDetails = useCallback(async (saleId) => {
    if (!saleId) return;
     
    try {
      const response = await getSaleDetailsById(saleId);
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

   useEffect(() => {
    if (!visible) {
      setRowData([]);
      setFilteredData([]);
      setError(null);
    }
  }, [visible]);

const columnDefs = useMemo(() => [
  {
    headerName: 'S.No',
    valueGetter: (params) => params.node.rowIndex + 1,
    minWidth: 70,
    width: 70,
  },
  {
    headerName: 'Product Name',
    field: 'productName',
    minWidth: 150,
  },
{
  headerName: 'Quantity',
  headerClass: 'quantity-header',
  children: [
    {
      headerName: 'Sale',
      field: 'saleQuantity',
      width: 80,
      cellClass: 'quantity-cell',
    },
    {
      headerName: 'Return',
      field: 'returnQuantity',
      width: 80,
      cellClass: 'quantity-cell',
    },
    {
      field: 'netQuantity',
      width: 80,
      cellClass: 'quantity-cell',
    },
  ],
},
{
  headerName: 'Purchase',
  headerClass: 'purchase-header',
  children: [
    {
      headerName: 'Purchase Rate',
      field: 'unitPurchaseRate',
      width: 130,
      cellClass: 'purchase-cell',
      valueFormatter: (params) =>
        params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
  ],
},
{
  headerName: 'Sale Record',
  headerClass: 'sale-header',
  children: [
    {
      headerName: 'Unit Rate',
      field: 'unitSaleRate',
      width: 100,
      cellClass: 'sale-cell',
      valueFormatter: (params) =>
        params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
    {
      headerName: 'Disc (%)',
      field: 'discountPercent',
      width: 100,
      cellClass: 'sale-cell',
    },
    {
      headerName: 'After Disc',
      field: 'afterDiscountAmount',
      width: 100,
      cellClass: 'sale-cell',
      valueFormatter: (params) =>
        params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
    {
      headerName: 'After Final Disc',
      field: 'afterFinalDiscountAmount',
      width: 140,
      cellClass: 'sale-cell',
      valueFormatter: (params) =>
        params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
    {
      headerName: 'Total Amount',
      field: 'saleItemAmount',
      width: 130,
      cellClass: 'sale-cell',
      valueFormatter: (params) =>
        params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
    {
      headerName: 'Return Amount',
      field: 'returnedItemAmount',
      width: 140,
      cellClass: 'sale-cell',
      valueFormatter: (params) =>
        params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
    {
      headerName: 'Net Amount',
      field: 'netAmount',
      width: 130,
      cellClass: 'sale-cell',
      valueFormatter: (params) =>
        params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
  ],
},
{
  headerName: 'Profit',
  field: 'profit',
  width: 100,
  cellClass: 'profit-cell',
  valueFormatter: (params) =>
    params.value ? parseFloat(params.value).toFixed(2) : '0.00',
},

  {
    headerName: 'Date',
    field: 'date',
    width: 120,
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
            Sale Details - Invoice #{mainData?.saleId || saleId || 'N/A'}
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

export default SaleRecordDetail;