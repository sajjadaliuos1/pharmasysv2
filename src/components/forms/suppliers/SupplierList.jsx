import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../common/style.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from "ag-grid-community";
import { message, Button, Empty, Space, Tooltip, Popconfirm } from "antd";
import useScreenSize from '../../common/useScreenSize';
import { useTableHeader } from '../../common/useTableHeader';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { Toaster } from "../../common/Toaster";
import Loader from "../../common/Loader";
import { deleteSupplier, getSuppliers } from "../../../api/API";
import SupplierListModal from "./SupplierListModal";
import SupplierTransaction from "./SupplierTransaction";

ModuleRegistry.registerModules([AllCommunityModule]);

const SupplierList = () => {
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
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [transactionRecord, setTransactionRecord] = useState(null);
 const navigate = useNavigate();
  const AddnewModal = useCallback((record) => {
    setEditingRecord(record ? { ...record } : {
      supplierId: '', name: '', contact: '', address: '', amount: '',
      discount: '', paid: '', remaining: '', description: '', date: ''
    });
    setIsModalVisible(true);
  }, []);

  // 💡 FIXED: Define this function BEFORE any usage
  const handleRefreshData = useCallback(async () => {
    if (loadingRef.current) return;
    setLoading(true);
    loadingRef.current = true;

    try {
      const response = await getSuppliers();
      if (!response) throw new Error("Failed to fetch categories");

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

  const handleEdit = useCallback((id) => {
    const record = rowData.find(supplier => supplier.supplierId === id);
    if (record) AddnewModal(record);
  }, [AddnewModal, rowData]);

const handleDetails = useCallback((id, name) => {
  navigate('/SupplierPaymentDetails', { 
    state: { 
      supplierId: id,
      supplerName: name
    }
  });
}, [navigate]);
  const handleDelete = useCallback(async (id) => {
    try {
      const response = await deleteSupplier(id);
      if (response.data.status === "Success") {
        handleRefreshData();
        Toaster.success(response.data.message);
      } else {
        Toaster.error(response.data.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete data');
      messageApi.error(`Failed to delete data: ${err.message || 'Unknown error'}`);
    }
  }, [messageApi, handleRefreshData]);

  const handleTransactionModalSave = useCallback(() => {
    Toaster.success("Transaction processed successfully!");
    setIsTransactionModalVisible(false);
    handleRefreshData();
  }, [handleRefreshData]);

  const getColumnDefs = useCallback(() => [
    {
      headerName: 'S#',
      valueGetter: (params) => params.node.rowIndex + 1,
      minWidth: 50,
       
        sortable: false,
        filter:false,
    },
    { headerName: "Supplier Name", field: "name", sortable: true, filter: true, minWidth: 180 },
    { headerName: "Contact #", field: "contact", sortable: true, filter: true, minWidth: 120 },
    { headerName: "Address", field: "address", sortable: false, filter: false, minWidth: 140 },
    { headerName: "Amount", field: "amount", sortable: false, filter: false, minWidth: 100 },
    { headerName: "Discount", field: "discount", sortable: false, filter: false, minWidth: 100 },
    { headerName: "Paid", field: "paid", sortable: false, filter: false, minWidth: 100 },
    { headerName: "Remain", field: "remaining", sortable: false, filter: false, minWidth: 100 },
    { headerName: "Description", field: "description", sortable: true, filter: true, minWidth: 140 },
    {
      headerName: "Actions",
      field: "actions",
      sortable: false,
      filter: false,
      pinned: 'right',
      minWidth: 180,
      cellRenderer: (params) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} onClick={() => handleEdit(params.data.supplierId)} size="small" />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => handleDelete(params.data.supplierId)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button icon={<DeleteOutlined />} danger size="small" />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Transaction">
            <Button
              icon={<DollarCircleOutlined />}
              onClick={() => {
                setTransactionRecord(params.data);
                setIsTransactionModalVisible(true);
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Details">
                         <Button 
                           icon={<InfoCircleOutlined />} 
                           onClick={() => handleDetails(params.data.supplierId, params.data.name)} 
                           size="small"
                         >
                           {params.data.typeId}
                         </Button>
                       </Tooltip>
        </Space>
      )
    }
  ], [handleEdit, handleDelete]);

  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

  const fetchInvoiceData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await getSuppliers();
      const data = response?.data?.data || [];
      setRowData(data);
      setFilteredData(data);
      if (data.length > 0) {
        messageApi.success('Data loaded successfully');
      } else {
        messageApi.info('No category data available');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      messageApi.error(`Failed to fetch data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [messageApi]);

  const handleExportPDF = useCallback(() => {
    const fileName = prompt("Enter file name for PDF:", "supplier-data");
    if (!fileName) return;
    const doc = new jsPDF();
    doc.setFontSize(18).text('Supplier Report', 14, 22);
    doc.setFontSize(11).text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    const columns = ['S.No', 'Supplier ID', 'Supplier Name'];
    const rows = rowData.map((row, index) => [
      index + 1,
      row.supplierId || '',
      row.name || '',
    ]);
    doc.autoTable({ head: [columns], body: rows, startY: 40, styles: { fontSize: 8 } });
    doc.save(`${fileName}.pdf`);
  }, [rowData]);

  const handleExportExcel = useCallback(() => {
    if (gridRef.current?.api) {
      const columnsToExport = columnDefs.filter(col => col.field !== 'actions').map(col => col.field);
      gridRef.current.api.exportDataAsCsv({
        fileName: 'supplier-list.csv',
        columnKeys: columnsToExport,
        skipColumnHeaders: false
      });
    }
  }, [columnDefs]);

  const setAutoHeight = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("domLayout", "autoHeight");
      document.querySelector("#myGrid").style.height = "";
    }
  }, []);

  const setFixedHeight = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("domLayout", "normal");
      document.querySelector("#myGrid").style.height = "500px";
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
    switch (key) {
      case "Auto Height": setAutoHeight(); break;
      case "Fixed Height": setFixedHeight(); break;
      case "Fullscreen": handleFullscreen(); break;
      default: break;
    }
  }, [messageApi, setAutoHeight, setFixedHeight, handleFullscreen]);

  const { renderMobileHeader, renderDesktopHeader } = useTableHeader({
    title: "Supplier List Management",
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
    return () => { loadingRef.current = false };
  }, [fetchInvoiceData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const searchLower = searchText.toLowerCase();
      const filtered = rowData.filter(row => row.name?.toLowerCase().includes(searchLower));
      setFilteredData(filtered);
      gridRef.current?.api?.onFilterChanged();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText, rowData]);

  const handleModalSave = useCallback(() => {
    Toaster.success(editingRecord?.typeId ? "Supplier updated!" : "Supplier added!");
    setIsModalVisible(false);
    handleRefreshData();
  }, [editingRecord?.typeId, handleRefreshData]);

  const renderLoadingState = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <Loader />
    </div>
  );

  const renderErrorState = () => (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h3 style={{ color: 'red' }}>Error Loading Data</h3>
      <p>{error}</p>
      <Button onClick={handleRefreshData}>Try Again</Button>
    </div>
  );

  const renderEmptyState = () => (
    <Empty description="No suppliers found" />
  );

  return (
    <div className="container mt-2">
      <div className="category-management-container" style={{ padding: 0, maxWidth: '100%' }}>
        {contextHolder}
        {screenSize === 'xs' || screenSize === 'sm' ? renderMobileHeader() : renderDesktopHeader()}
        {loading ? renderLoadingState() : error ? renderErrorState() : (
          <div id="myGrid" className="ag-theme-alpine" style={{ height: '515px', width: '100%' }}>
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
                    params.api.setGridOption('rowHeight', 40);
                  }
                }}
              />
            )}
          </div>
        )}
        <SupplierListModal
          visible={isModalVisible}
          title={editingRecord?.typeId ? "Edit Supplier" : "Add Supplier"}
          button={editingRecord?.typeId ? "Update" : "Save"}
          onCancel={() => setIsModalVisible(false)}
          initialValues={editingRecord}
          setIsModalVisible={setIsModalVisible}
          onSave={handleModalSave}
        />
        <SupplierTransaction
          visible={isTransactionModalVisible}
          title="Process Transaction"
          button="Save Transaction"
          onCancel={() => setIsTransactionModalVisible(false)}
          initialValues={transactionRecord}
          setIsModalVisible={setIsTransactionModalVisible}
          onSave={handleTransactionModalSave}
        />
      </div>
    </div>
  );
};

export default SupplierList;
