import React, { useEffect, useState } from "react";
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, Tag } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";

function ShortSoursePage() {
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
      const res = await request("short_course", "get", {});
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
      course_name: values.course_name, 
      course_name_kh: values.course_name_kh, 
      teacher_name: values.teacher_name, 
      teacher_name_kh: values.teacher_name_kh,
      description: values.description, 
      description_kh: values.description_kh,
      time_study: values.time_study, 
      mode: values.mode,
      status: values.status 
    };
    let url = "short_course",
      method = "post";

    if (formRef.getFieldValue("id")) {
      url = `short_course/${formRef.getFieldValue("id")}`;
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
      course_name: record.course_name, 
      course_name_kh: record.course_name_kh, 
      teacher_name: record.teacher_name, 
      teacher_name_kh: record.teacher_name_kh,
      description: record.description, 
      description_kh: record.description_kh,
      time_study: record.time_study, 
      mode: record.mode,
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
      const res = await request(`short_course/${itemToDelete.id}`, "delete", {});
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
    { title: "Course Name English", dataIndex: "course_name", key: "course_name" },
    { title: "Course Name Khmer", dataIndex: "course_name_kh", key: "course_name_kh" },
    { title: "Teacher Name English", dataIndex: "teacher_name", key: "teacher_name" },
    { title: "Teacher Name Khmer", dataIndex: "teacher_name_kh", key: "teacher_name_kh" },
    { title: "Description English", dataIndex: "description", key: "description" },
    { title: "Description Khmer", dataIndex: "description_kh", key: "description_kh" },
    { title: "Time Study", dataIndex: "time_study", key: "time_study" },
    { title: "Type Study", 
      dataIndex: "mode", 
      key: "mode" ,
      render: (mode) => (
        <Tag color= "blue">
          {mode}
        </Tag>
      )
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
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Education Information</h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> Add
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title="Experience Information" footer={null} open={openModal} onCancel={handleClose} width={900} >
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Row gutter={20}>
            <Col xs={24} md={12}>
                <Form.Item label="Course Name English" name="course_name" rules={[{ required: true, message: "Please input course name english" }]}>
                  <Input />
                </Form.Item>

                <Form.Item label="Course Name Khmer" name="course_name_kh" rules={[{ required: true, message: "Please input course name khmer" }]}>
                  <Input />
                </Form.Item>

                <Form.Item label="Teacher Name English" name="teacher_name" rules={[{ required: true, message: "Please input teacher name english" }]}>
                  <Input />
                </Form.Item>

                <Form.Item label="Teacher Name Khmer" name="teacher_name_kh" rules={[{ required: true, message: "Please input teacher name khmer" }]}>
                  <Input />
                </Form.Item>

                <Form.Item label="Description English" name="description">
                  <Input.TextArea style={{ height: 100 }} />
                </Form.Item>

                <Form.Item label="Description Khmer" name="description_kh">
                  <Input.TextArea style={{ height: 100 }} />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item label="Time Study" name="time_study" >
                  <Input />
                </Form.Item>

                <Form.Item label="Type Study" name="mode" rules={[{ required: true, message: "Please input teacher type study" }]}>
                  <Select options={[{ label: "Online", value: 'online' } ,{ label: "Direct", value: 'direct' }]} />
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

export default ShortSoursePage;
