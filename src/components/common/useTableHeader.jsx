import { useState } from 'react';
import {
  DownloadOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  PlusOutlined,
  SearchOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { Dropdown, Button, Input, Space, Tooltip } from 'antd';

export const useTableHeader = ({
  title,
  onRefresh,
  onExportExcel,
  onExportPDF,
  onAddNew,
  onTableSizeChange,
  searchText,
  onSearchChange,
  rowData,
  screenSize
}) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const mobileMenuItems = [
    {
      key: 'refresh',
      label: (
        <span>
          <ReloadOutlined /> Refresh Data
        </span>
      ),
      onClick: onRefresh
    },
    {
      key: 'excel',
      label: (
        <span>
          <DownloadOutlined /> Export to Excel
        </span>
      ),
      disabled: !rowData.length,
      onClick: onExportExcel
    },
    {
      key: 'pdf',
      label: (
        <span>
          <DownloadOutlined /> Export to PDF
        </span>
      ),
      disabled: !rowData.length,
      onClick: onExportPDF
    },
    {
      type: 'group',
      label: 'Display Options',
      children: [
        {
          key: 'Auto Height',
          label: 'Auto Height',
          onClick: () => onTableSizeChange({ key: 'Auto Height' })
        },
        {
          key: 'Fixed Height',
          label: 'Fixed Height',
          onClick: () => onTableSizeChange({ key: 'Fixed Height' })
        },
        {
          key: 'Fullscreen',
          label: 'Fullscreen',
          onClick: () => onTableSizeChange({ key: 'Fullscreen' })
        }
      ]
    }
  ];

  const desktopExportItems = [
    {
      key: 'excel',
      label: 'Export to Excel',
      disabled: !rowData.length,
      onClick: onExportExcel
    },
    {
      key: 'pdf',
      label: 'Export to PDF',
      disabled: !rowData.length,
      onClick: onExportPDF
    }
  ];

  const desktopDisplayItems = [
    {
      key: 'Auto Height',
      label: 'Auto Height'
    },
    {
      key: 'Fixed Height',
      label: 'Fixed Height'
    },
    {
      key: 'Fullscreen',
      label: 'Fullscreen'
    }
  ];

  const renderMobileHeader = () => (
    <div className="mobile-header" style={{ marginBottom: '15px' }}>
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: screenSize === 'xs' ? '18px' : '20px' }}>
          {title}
        </h2>
      </div>

      <Space style={{ width: '100%', justifyContent:'center' }}>
        <Input
          placeholder="Search..."
          value={searchText}
          onChange={onSearchChange}
          style={{ flex: 1 }}
          prefix={<SearchOutlined />}
          allowClear
        />

        <Dropdown
          menu={{ items: mobileMenuItems }}
          placement="bottomLeft"
          trigger={['click']}
          onOpenChange={setMobileMenuVisible}
          open={mobileMenuVisible}
        >
          <Button icon={<MenuOutlined />} />
        </Dropdown>

        <Button
          type="primary"
          onClick={onAddNew}
          icon={<PlusOutlined />}
        />
      </Space>
    </div>
  );

  const renderDesktopHeader = () => (
    <div className="desktop-header" style={{ marginBottom: '15px' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>

        <Input
          placeholder="Search..."
          value={searchText}
          onChange={onSearchChange}
          style={{ width: '350px' }}
          prefix={<SearchOutlined />}
          allowClear
        />

        <Space>
          <Tooltip title="Refresh Data">
            <Button icon={<ReloadOutlined />} onClick={onRefresh} />
          </Tooltip>

          <Dropdown menu={{ items: desktopExportItems }} placement="bottomRight">
            <Button icon={<DownloadOutlined />}>Export</Button>
          </Dropdown>

          <Dropdown
            menu={{ items: desktopDisplayItems, onClick: onTableSizeChange }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Tooltip title="Display Options">
              <Button icon={<ColumnHeightOutlined />} />
            </Tooltip>
          </Dropdown>

          <Button type="primary" icon={<PlusOutlined />} onClick={onAddNew}>
            Add New
          </Button>
        </Space>
      </Space>
    </div>
  );

  return {
    renderMobileHeader,
    renderDesktopHeader
  };
};