import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";

function ConnectMePage() {
  const [state, setState] = useState({ list: [], loading: false });
  const [openModal, setOpenModal] = useState(false);
  const [formRef] = Form.useForm();
  const [toast, setToast] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

  const showToast = (type, message) => setToast({ type, message });

  const fetchList = async () => {
    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request("connect_me", "get", {});
      if (res && !res.error) {
      
        setState({ list: res.list, loading: false });
      }
    } catch (err) {
      console.error(err);
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  const handleNew = () => {
    formRef.resetFields();
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const handleSave = async (values) => {
    const body = { 
      name: values.name, 
      name_kh: values.name_kh, 
      connection: values.connection, 
      description: values.description, 
      description_kh: values.description_kh, 
      icon_name: values.icon_name, 
      icon_import: values.icon_import, 
      bg_box: values.bg_box, 
      status: values.status 
    };
    let url = "connect_me",
      method = "post";

    if (formRef.getFieldValue("id")) {
      url = `connect_me/${formRef.getFieldValue("id")}`;
      method = "put";
    }

    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request(url, method, body);
      if (res && !res.error) {
        showToast("success", res?.message || "Saved successfully");
        handleClose();
        fetchList();
      }
    } catch (err) {
      showToast("error", "Failed to save");
    } finally {
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  const handleEditBtn = (record) => {
    formRef.setFieldsValue({
      ... record
    });
    setOpenModal(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request(`connect_me/${itemToDelete.id}`, "delete", {});
      if (res && !res.error) {
        showToast("success", res.message || "Deleted successfully");
        fetchList();
      }
    } catch (err) {
      showToast("error", "Failed to delete");
    } finally {
      setState((pre) => ({ ...pre, loading: false }));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const columns = [
    { title: "#", dataIndex: "no", key: "id", render: (_, __, index) => index + 1 },
    { title: "Name English", dataIndex: "name", key: "name" },
    { title: "Name Khmer", dataIndex: "name_kh", key: "name_kh" },
    { title: "Connection By", dataIndex: "connection", key: "connection" },
    { title: "Description English", dataIndex: "description", key: "description" },
    { title: "Description Khmer", dataIndex: "description_kh", key: "description_kh" },
    { title: "Icon Name", dataIndex: "icon_name", key: "icon_name" },
    { title: "Icon Import", dataIndex: "icon_import", key: "icon_import" },
    { title: "Backgroud Box", dataIndex: "bg_box", key: "bg_box" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={status === 1 ? "green" : "volcano"}>{status === 1 ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary"  onClick={() => handleEditBtn(record)}> Edit <EditFilled /></Button>
          <Button danger onClick={() => handleDeleteClick(record)}>Delete <DeleteFilled /></Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Connect Me Information</h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> Add
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title="Connect Me Information" footer={null} open={openModal} onCancel={handleClose}>
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Form.Item label="Name English" name="name" rules={[{ required: true, message: "Please input name english" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Name Khmer" name="name_kh" rules={[{ required: true, message: "Please input name khmer" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Connection By" name="connection" rules={[{ required: true, message: "Please input connection by" }]} >
            <Input />
          </Form.Item>

          <Form.Item label="Description English" name="description">
            <Input.TextArea style={{ height: 100 }} />
          </Form.Item>

          <Form.Item label="Description Khmer" name="description_kh">
            <Input.TextArea style={{ height: 100 }} />
          </Form.Item>

          <Form.Item label="Icon Name" name="icon_name"  >
            <Input />
          </Form.Item>
          <Form.Item label="Icon Import" name="icon_import" >
            <Input />
          </Form.Item>
          <Form.Item label="Backgroud Box" name="bg_box" >
            <Input />
          </Form.Item>

          <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please select status" }]}>
            <Select options={[{ label: "Active", value: 1 }, { label: "Inactive", value: 0 }]} />
          </Form.Item>
          <Form.Item>
            <div style={{ textAlign: "right" }}>
              <Space>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Yes"
        cancelText="No"
      >
        Are you sure you want to delete this item?
      </Modal>

      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Table */}
      <Table bordered columns={columns} dataSource={state.list} loading={state.loading} />
    </div>
  );
}

export default ConnectMePage;
