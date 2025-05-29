import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../common/style.css"; // Assuming this path is correct
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from "ag-grid-community";
import { message, Button, Empty, Space, Tooltip, Popconfirm } from "antd";
import useScreenSize from '../../common/useScreenSize'; // Assuming this path is correct
 // Assuming this path is correct
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Toaster } from "../../common/Toaster"; // Assuming this path is correct
import Loader from "../../common/Loader"; // Assuming this path is correct

ModuleRegistry.registerModules([
  AllCommunityModule,
]);

const PurchaseList = ({
  cartItems,
  loading, // Still accepting loading, though it might be controlled by the parent for cart state
  error,   // Still accepting error, though it might be controlled by the parent for cart state
  handleEditItem,
  handleDeleteItem
}) => {
  const [searchText, setSearchText] = React.useState("");
  const gridRef = useRef(null);
  const screenSize = useScreenSize(gridRef);
  const [messageApi, contextHolder] = message.useMessage();

  const getColumnDefs = useCallback(() => {
    return [
      {
        headerName: 'S.No',
        valueGetter: (params) => params.node.rowIndex + 1,
        minWidth: 60,
        maxWidth: 80,
        flex: 0.5,
      },
      {
        headerName: "Product Name",
        field: "productName", // Ensure this matches the field in dataToSubmit from PurchaseItem
        sortable: true,
        filter: true,
        minWidth: 120,
        flex: 1.5,
      },
      {
        headerName: "Category",
        field: "categoryName", // Ensure this matches the field in dataToSubmit from PurchaseItem
        sortable: true,
        filter: true,
        minWidth: 100,
        flex: 1,
      },
      {
        headerName: "Supplier",
        field: "supplierName", // Ensure this matches the field in dataToSubmit from PurchaseItem
        sortable: true,
        filter: true,
        minWidth: 100,
        flex: 1,
      },
      {
        headerName: "Batch No",
        field: "batchNo",
        minWidth: 100,
        flex: 1,
      },
      {
        headerName: "Quantity",
        field: "quantity",
        minWidth: 80,
        flex: 0.8,
      },
      {
        headerName: "Purchase Rate",
        field: "purchaseRate",
        minWidth: 100,
        flex: 1,
        valueFormatter: (params) => `$${(params.value || 0).toFixed(2)}`,
      },
      {
        headerName: "Discount",
        field: "purchaseDiscount",
        minWidth: 80,
        flex: 0.8,
        valueFormatter: (params) => `${(params.value || 0)}%`,
      },
      {
        headerName: "Final Rate",
        field: "finalPurchaseRate",
        minWidth: 100,
        flex: 1,
        valueFormatter: (params) => `$${(params.value || 0).toFixed(2)}`,
      },
      {
        headerName: "Total",
        valueGetter: (params) => (
          (parseFloat(params.data.finalPurchaseRate) || 0) * (parseInt(params.data.quantity) || 0)
        ).toFixed(2),
        minWidth: 100,
        flex: 1,
        valueFormatter: (params) => `$${params.value}`,
      },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params) => (
          <Space size="middle">
            <Tooltip title="Edit">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => handleEditItem(params.data)}
                size="small"
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleDeleteItem(params.data.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
        minWidth: 120, // Adjusted minWidth for actions
        flex: 1,
        suppressSizeToFit: true, // Prevent this column from shrinking too much
      },
    ];
  }, [handleEditItem, handleDeleteItem]);

  const columnDefs = useMemo(() => getColumnDefs(), [getColumnDefs]);

  // Refresh data simply means re-rendering with the current cartItems
  const handleRefreshData = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setRowData(cartItems);
      gridRef.current.api.refreshCells();
    }
    Toaster.success("Cart refreshed!");
  }, [cartItems]);


  const handleExportPDF = useCallback(() => {
    const fileName = prompt("Enter file name for PDF:", "purchase-cart-data");
    if (!fileName) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Purchase Cart Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    const columns = [
      'S.No', 'Product Name', 'Category', 'Supplier', 'Batch No', 'Quantity', 'Purchase Rate',
      'Discount %', 'Final Rate', 'Total'
    ];

    const rows = cartItems.map((row, index) => [
      index + 1,
      row.productName || '',
      row.categoryName || '',
      row.supplierName || '',
      row.batchNo || '',
      row.quantity || 0,
      (row.purchaseRate || 0).toFixed(2),
      (row.purchaseDiscount || 0),
      (row.finalPurchaseRate || 0).toFixed(2),
      ((parseFloat(row.finalPurchaseRate) || 0) * (parseInt(row.quantity) || 0)).toFixed(2)
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    doc.save(`${fileName}.pdf`);
  }, [cartItems]);

  const handleExportExcel = useCallback(() => {
    if (gridRef.current?.api) {
      const columnsToExport = columnDefs
        .filter(col => col.field !== 'actions')
        .map(col => ({
          field: col.field,
          headerName: col.headerName
        }));

      gridRef.current.api.exportDataAsCsv({
        fileName: 'purchase-cart-data.csv',
        sheetName: 'Purchase Cart',
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
      const gridElement = document.querySelector("#purchaseGrid");
      if (gridElement) {
        gridElement.style.height = "";
      }
    }
  }, []);

  const setFixedHeight = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption("domLayout", "normal");
      const gridElement = document.querySelector("#purchaseGrid");
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
    switch (key) {
      case "Auto Height": setAutoHeight(); break;
      case "Fixed Height": setFixedHeight(); break;
      case "Fullscreen": handleFullscreen(); break;
      default: break;
    }
  }, [messageApi, setAutoHeight, setFixedHeight, handleFullscreen]);


 

  const defaultColDef = useMemo(() => ({
    filter: true,
    resizable: true,
    suppressSizeToFit: false
  }), []);

  const popupParent = useMemo(() => document.body, []);

  // AG-Grid filtering
  useEffect(() => {
    const filterData = () => {
      if (!searchText.trim()) {
        if (gridRef.current?.api) {
          gridRef.current.api.setRowData(cartItems);
          gridRef.current.api.onFilterChanged();
        }
        return;
      }

      const searchLower = searchText.toLowerCase();
      const filtered = cartItems.filter(item =>
        (item.productName && item.productName.toLowerCase().includes(searchLower)) ||
        (item.batchNo && item.batchNo.toLowerCase().includes(searchLower)) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchLower)) ||
        (item.supplierName && item.supplierName.toLowerCase().includes(searchLower))
      );
      if (gridRef.current?.api) {
        gridRef.current.api.setRowData(filtered);
        gridRef.current.api.onFilterChanged();
      }
    };

    const handler = setTimeout(() => {
      filterData();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText, cartItems]);


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
    <div style={{ // Add this wrapper div
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px', // Ensure it takes up enough vertical space
      background: '#FFFFFF', // White background
      borderRadius: '8px',
      border: '1px solid #f0f0f0', // Optional: subtle border for definition
      padding: '20px'
    }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            No items in the cart
          </span>
        }
      />
    </div>
  );

  return (
    <>
      {contextHolder}
      <div className="container mt-2">
        <div className="category-management-container" style={{ padding: '0px', maxWidth: '100%' }}>
        
          {loading ? renderLoadingState() : error ? renderErrorState() : (
            <div
              id="purchaseGrid"
              className="ag-theme-alpine"
              style={{
                height: '515px',
                minHeight: '515px',
                maxHeight: '520px',
                width: '100%',
                fontSize: '14px'
              }}
            >
              {cartItems.length === 0 ? renderEmptyState() : (
                <AgGridReact
                  gridOptions={{ suppressMenuHide: true }}
                  columnDefs={columnDefs}
                  ref={gridRef}
                  rowData={cartItems} // Use cartItems directly for AG-Grid
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
                  onFirstDataRendered={params => params.api.sizeColumnsToFit()}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PurchaseList;