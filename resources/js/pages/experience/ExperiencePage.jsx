import React, { useEffect, useState } from "react";
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, Tag } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";

function ExperiencePage() {
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
      const res = await request("experiences", "get", {});
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
      icon: values.icon,
      company_name: values.company_name,
      description: values.description,
      location: values.location,
      emp_type: values.emp_type,
      start_year: values.start_year,
      end_year: values.end_year,
      technologies: values.technologies,
      key_achievements: values.key_achievements,
      status: values.status,
    };
    let url = "experiences",
      method = "post";

    if (formRef.getFieldValue("id")) {
      url = `experiences/${formRef.getFieldValue("id")}`;
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
      icon: record.icon,
      company_name: record.company_name,
      description: record.description,
      location: record.location,
      emp_type: record.emp_type,
      start_year: record.start_year,
      end_year: record.end_year,
      technologies: record.technologies,
      key_achievements: record.key_achievements,
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
      const res = await request(`experiences/${itemToDelete.id}`, "delete", {});
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
    { title: "Icon", dataIndex: "icon", key: "icon" },
    { title: "Company Name", dataIndex: "company_name", key: "company_name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Jop Type", 
      dataIndex: "emp_type", 
      key: "emp_type"
     },

    {
      title: "Key Achievements",
      dataIndex: "key_achievements",
      key: "key_achievements",
      render: (keyAchieList) =>
        Array.isArray(keyAchieList) && keyAchieList.length > 0 ? (
        <Space size={[0, 8]} wrap>
          {keyAchieList.map((keyAchie, index) => (
            <Tag color="blue" key={index}>
              {keyAchie}
            </Tag>
          ))}
        </Space>
        ) : (
          <Tag color="default">Key Achievements</Tag>
        ),
    },
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
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Experience </h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> Add
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title="Experience" footer={null} open={openModal} onCancel={handleClose} width={900} >
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Row gutter={20}>
            {/* col 1 */}
            <Col xs={24} md={12}>
              <Form.Item label="Title" name="title" rules={[{ required: true, message: "Please input title" }]}>
                <Input />
              </Form.Item>

               <Form.Item label="Company Name" name="company_name" rules={[{ required: true, message: "Please input company name" }]}>
                <Input />
              </Form.Item>

              <Form.Item label="Location" name="location" rules={[{ required: true, message: "Please input location" }]}>
                <Input />
              </Form.Item>
              
              <Form.Item label="Employee Type" name="emp_type" rules={[{ required: true, message: "Please input employee type" }]}>
                <Input />
              </Form.Item>

              <Form.Item label="Description" name="description">
                <Input.TextArea style={{ height: 100 }} />
              </Form.Item>

             
            </Col>

            {/* col 2 */}
            <Col xs={24} md={12}>
              <Row gutter={20}>
                  <Col span={12}>
                    <Form.Item label="Start Year" name="start_year" rules={[{ required: true, message: "Please input start year" }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                
                  <Col span={12}>
                    <Form.Item label="End year" name="end_year" rules={[{ required: true, message: "Please input end year" }]}>
                      <Input />
                    </Form.Item>
                  </Col>
              </Row>

              {/* technologies */}
              <Form.Item
                label="Technologies"
                name="technologies"
                rules={[{ required: false, message: "Please add at least one technology" }]}
              >
                <Select
                  mode="tags"
                  style={{ width: "100%" }}
                  placeholder="Type technology and press Enter"
                />
              </Form.Item>

              <Form.Item
                label="Key Achievements"
                name="key_achievements"
                rules={[{ required: false, message: "Please add at least one key achievements" }]}
              >
                <Select
                  mode="tags"
                  style={{ width: "100%" }}
                  placeholder="Key Achievements and press Enter"
                />
              </Form.Item>

              <Form.Item label="Logo" name="icon" rules={[{ required: false, message: "Please input end year" }]}>
                <Input />
              </Form.Item>

              <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please select status" }]}>
                <Select options={[{ label: "Active", value: 1 }, { label: "Inactive", value: 0 }]} />
              </Form.Item>
            </Col>

          </Row>
           
        
          
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

export default ExperiencePage;
