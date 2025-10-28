import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";

function EducationInfoPage() {
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
      const res = await request("education_info", "get", {});
      if (res && !res.error) {
        const formatted = res.map((item) => ({ ...item, key: item.id }));
        setState({ list: formatted, loading: false });
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
      title: values.title, 
      bio: values.bio, 
      status: values.status 
    };
    let url = "education_info",
      method = "post";

    if (formRef.getFieldValue("id")) {
      url = `education_info/${formRef.getFieldValue("id")}`;
      method = "put";
    }

    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request(url, method, body);
      if (res && !res.error) {
        showToast("success", res.message || "Saved successfully");
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
      title: record.title,
      bio: record.bio,
      status: record.status,
      id: record.id
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
      const res = await request(`education_info/${itemToDelete.id}`, "delete", {});
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
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "BIO", dataIndex: "bio", key: "bio" },
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
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Education Information</h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> Add
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title="Experience Information" footer={null} open={openModal} onCancel={handleClose}>
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Form.Item label="Title" name="title" rules={[{ required: true, message: "Please input title" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="BIO" name="bio">
            <Input.TextArea style={{ height: 100 }} />
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

export default EducationInfoPage;
