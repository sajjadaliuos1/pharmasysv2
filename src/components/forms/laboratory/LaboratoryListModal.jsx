import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Modal, Typography } from 'antd';
import { AgGridReact } from "ag-grid-react";
import { message } from "antd";
import { getTestRecordDetails } from "../../../api/API";


const { Title } = Typography;

const LaboratoryListModol = ({ visible, onCancel, purchaseDetails,  width, zIndex, testId }) => {
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
    if (visible && testId) {
      fetchPurchaseDetails(testId);
    }
  }, [visible, testId]); // Dependencies: modal visibility and purchaseId

  // For purchase details modal
  const fetchPurchaseDetails = useCallback(async (testId) => {
    if (!testId) return;
     
    try {
      const response = await getTestRecordDetails(testId);
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
      headerName: "Test Name",
      field: "testName",
      minWidth: 150,
    },
   {
        headerName: "Test Amount",
        field: "amount",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
     {
        headerName: "Processing Time",
        field: "processingTime",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
      {
        headerName: "Completion Time",
        field: "completionTime",
        sortable: true,
        filter: true,
        minWidth: 140,
      },
      {
        headerName: "Registration Time",
        field: "registerTime",
        sortable: true,
        filter: true,
        minWidth: 40,
      }
 
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
            Test Details - Invoice #{mainData?.testId || testId || 'N/A'}
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
          <Title level={5} style={{ marginBottom: 16 }}>Total Test</Title>
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

export default LaboratoryListModol;