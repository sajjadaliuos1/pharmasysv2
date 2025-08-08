
import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  Button,
  Upload,
  Input,
  Typography,
  message as antdMessage,
  Alert,
} from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { createBackup, restoreBackup } from "../../api/API";
import { Toaster } from "../common/Toaster";

const { Title, Text } = Typography;

export default function BackupRestore() {
  const [backupPath] = useState("D:\\ShopBackups");
  const [backupMessage, setBackupMessage] = useState("");
  const [restoreMessage, setRestoreMessage] = useState("");
  const [backupFile, setBackupFile] = useState(null);
  const [loading, isLoading] = useState(false);

  const handleBackup = async () => {
    try {
        isLoading(true);
      const res = await createBackup({ backupPath });
      setBackupMessage(res.data.message);
      antdMessage.success(res.data.message);
      Toaster.success("Backup created successfully");
              isLoading(false);
    } catch (err) {
                isLoading(false);
                      Toaster.error("Error in creating backup");
      setBackupMessage(err.response.data.message);
      antdMessage.error(err.response.data.message);
    }
  };

  const handleRestore = async () => {
    if (!backupFile) {        
      setRestoreMessage("Select backup file");
      Toaster.warning("Select backup file");
      return;
    }

    const formData = new FormData();
    formData.append("backupFile", backupFile);

    try {
                isLoading(true);
      const res = await restoreBackup(formData);
      setRestoreMessage(res.data.message);
      antdMessage.success(res.data.message);
      Toaster.success("Backup restored successfully");
              isLoading(false);
    } catch (err) {
                isLoading(false);
                Toaster.error("Error in restoring backup");
      setRestoreMessage(err.response.data.message);
      antdMessage.error(err.response.data.message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", paddingTop: 30 }}>
      <Title level={3} style={{ textAlign: "center", color: "#1890ff" }}>
       Database Backup and Restore 💾 
      </Title>

      <Card title="Backup📁 " bordered style={{ marginBottom: 20 }}>
        <Input value={backupPath} readOnly className="mb-2" />
        <Text type="secondary">
          The backup will be saved automatically: {backupPath}
        </Text>
        <br />
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          className="mt-2"
          loading={loading}
          onClick={handleBackup}
        >
         Backup
        </Button>
        {backupMessage && (
          <Alert message={backupMessage} type="info" showIcon className="mt-2" />
        )}
      </Card>

      <Card title="Restore ♻️">
        <Upload
          beforeUpload={(file) => {
            setBackupFile(file);
            return false;
          }}
          accept=".bak"
          showUploadList={{ showRemoveIcon: true }}
        >
          <Button icon={<UploadOutlined />}>Select backup file</Button>
        </Upload>
        <Button
          danger
          type="primary"
          loading={loading}
          icon={<DownloadOutlined />}
          onClick={handleRestore}
          style={{ marginTop: 10 }}
        >
         Restore
        </Button>
        {restoreMessage && (
          <Alert
            message={restoreMessage}
            type="warning"
            showIcon
            className="mt-2"
          />
        )}
      </Card>
    </div>
  );
}