import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Modal, Typography } from 'antd';
import { AgGridReact } from "ag-grid-react";
import { getTestRecordDetails,deleteTestRecord } from "../../../api/API";
import {  message, Button, Space, Tooltip, Popconfirm } from "antd";
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Toaster } from '../../common/Toaster';

const { Title } = Typography;


const LaboratoryListModol = ({ visible, onCancel, purchaseDetails,patientName,  width, zIndex, testId,onSuccess  }) => {
  const gridRef = useRef(null);
  const [error, setError] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  

  const mainData = purchaseDetails?.data || purchaseDetails || {};
  const itemsData = mainData?.items || rowData; 

  useEffect(() => {
    if (visible && testId) {
      fetchPurchaseDetails(testId);
    }
  }, [visible, testId]);  

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
const formatDate = (value) => {
  if (!value) return '';
  return dayjs(value).format('DD-MM-YYYY hh:mm:ss A');
};
  
  const handleDelete = useCallback(async (id) => {     
    try {
      const response = await deleteTestRecord(id,1);
      if(response.data.status === "Success"){       
        Toaster.success(response.data.message);
      } else {
        Toaster.error(response.data.message);
      }
       onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to delete data');
      Toaster.error({ content: `Failed to delete data: ${err.message || 'Unknown error'}`, key: 'deletingData' });
    }
  }, [rowData]);

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
        minWidth: 100,
      },
     {
        headerName: "Processing Time",
        field: "processingTime",
        sortable: true,
        filter: true,
        minWidth: 100,
      },
      {
        headerName: "Book Time",
        field: "registerTime",
        sortable: true,
        filter: true,
        minWidth: 100,
        valueFormatter: params => formatDate(params.value)
      },
      {
        headerName: "Completion Time",
        field: "completionTime",
        sortable: true,
        filter: true,
        minWidth: 100,
       valueFormatter: params => formatDate(params.value)
      },
       {
            headerName: "Action",
            field: "actions",
            pinned: 'right',  
            cellRenderer: (params) => (
              <Space size="middle">
                
                <Popconfirm
                  title="Are you sure you want to delete?"
                  onConfirm={() => handleDelete(params.data.testRecordDetailId)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      danger 
                      size="small"
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            ),
            minWidth: 90,
            width:90
          }
      
 
  ], [handleDelete]);

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
            Test Details - {patientName || 'N/A'}
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
        {/* <Title level={5} style={{ marginBottom: 16 }}>Total Test</Title> */}
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