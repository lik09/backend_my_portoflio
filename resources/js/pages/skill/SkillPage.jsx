import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Upload,
} from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons";
import { request, requestFormData } from "../../utils/request";
import Toast from "../../components/message/Toast";
import { config } from "../../utils/config";

function SkillPage() {
  const [state, setState] = useState({ list: [], skillTypeList: [], loading: false });
  const [openModal, setOpenModal] = useState(false);
  const [formRef] = Form.useForm();
  const [toast, setToast] = useState(null);
  const [imageFileList, setImageFileList] = useState([]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchList();
    fetchSkillTypeList();
  }, []);

  const showToast = (type, message) => setToast({ type, message });

  const toFileList = (images) =>
    Array.isArray(images)
      ? images.map((img, idx) => ({
          uid: String(idx),
          name: img.split("/").pop(),
          status: "done",
          url: config.image_path + img,
        }))
      : images
      ? [
          {
            uid: "-1",
            name: images.split("/").pop(),
            status: "done",
            url: config.image_path + images,
          },
        ]
      : [];

  const fetchList = async () => {
    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request("skill", "get", {});
      if (res && !res.error) {
        setState({ list: res.list, loading: false, skillTypeList: state.skillTypeList });
      }
    } catch (err) {
      console.error(err);
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  const fetchSkillTypeList = async () => {
    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request("skill_type", "get", {});
      if (res && !res.error) {
        setState((pre) => ({
          ...pre,
          skillTypeList: res,
          loading: false,
        }));
      } else {
        setState((pre) => ({ ...pre, loading: false }));
      }
    } catch (err) {
      console.error(err);
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  const handleNew = () => {
    formRef.resetFields();
    setImageFileList([]);
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const onFinish = async (values) => {
    setState((p) => ({ ...p, loading: true }));

    try {
      const formData = new FormData();
      
      // Append normal fields
      formData.append("name", values.name || "");
      formData.append("name_kh", values.name_kh || "");
      formData.append("skill_type_id", values.skill_type_id || "");
      formData.append("description", values.description || "");
      formData.append("description_kh", values.description_kh || "");
      formData.append("pct_status", values.pct_status || "");
      formData.append("status", values.status ? 1 : 0);

      // Logo file
      if (values.images && values.images[0]?.originFileObj) {
        formData.append("images", values.images[0].originFileObj);
      }

      const id = formRef.getFieldValue("id");
      let endpoint = "skill";
      let method = "post";

      if (id) {
        endpoint = `skill/${id}`;
        formData.append("_method", "PUT"); // Laravel update
      }

      console.log("Sending request to:", `${config.base_url_api}/${endpoint}`);

      const res = await requestFormData(endpoint, method, formData);

      if (res && !res.error) {
        showToast("success", res.message || "Saved successfully");
        handleClose();
        fetchList();
      } else {
        showToast("error", res?.message || "Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("error", err.message || "Network/server error");
    } finally {
      setState((p) => ({ ...p, loading: false }));
    }
  };

  const handleEditBtn = (record) => {
    setImageFileList(toFileList(record.images));
  
    formRef.setFieldsValue({
      ...record,

      skill_type_id:record.skill_type_id,
      images: toFileList(record.images),
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
      const res = await request(`skill/${itemToDelete.id}`, "delete", {});
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
    
    { title: "Name Skill English", dataIndex: "name", key: "name" },
    { title: "Name Skill Khmer", dataIndex: "name_kh", key: "name_kh" },
    {
      title: "Skill Type",
      dataIndex: "skill_type",
      key: "skill_type",
      render: (skill_type) => <Tag color="yellow">{skill_type?.name}</Tag>
    },
    {
      title: "Description English",
      dataIndex: "description",
      key: "description_study",
      width: 300
    },
    {
      title: "Description Khmer",
      dataIndex: "description_kh",
      key: "description_kh",
      width: 300
    },
    {
      title: "Image Logo",
      dataIndex: "images",
      key: "images",
      render: (logo) =>
        logo ? (
          <Image.PreviewGroup>
            <Image
              src={`${config.image_path}${logo}`}
              alt="Image logo"
              style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
            />
          </Image.PreviewGroup>
        ) : (
          <span>No Logo</span>
        ),
    },
    {
      title: "Percentage Status",
      dataIndex: "pct_status",
      key: "pct_status",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === 1 ? "green" : "volcano"}>
          {status === 1 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEditBtn(record)}>
            Edit <EditFilled />
          </Button>
          <Button danger onClick={() => handleDeleteClick(record)}>
            Delete <DeleteFilled />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>skill Information</h3>
        <Button
          type="primary"
          style={{ fontSize: 16, fontWeight: 600 }}
          onClick={handleNew}
        >
          <MdOutlineAdd /> Add
        </Button>
      </div>

      {/* Form Modal */}
      <Modal
        title="Skill Information"
        footer={null}
        open={openModal}
        onCancel={handleClose}
        width={950}
      >
        <Form form={formRef} layout="vertical" onFinish={onFinish} initialValues={{ status: 1 }}>
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Name Skill English"
                name="name"
                rules={[{ required: true, message: "Please input name skill english" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Name Skill Khmer"
                name="name_kh"
                rules={[{ required: true, message: "Please input name skill khmer" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Skill Type"
                name="skill_type_id"
                rules={[{ required: true, message: "Please select skill type" }]}
              >
                <Select
                  options={state.skillTypeList?.map((type) => ({
                    label: type.name,
                    value: type.id,
                  }))}
                />
              </Form.Item>

              <Form.Item label="Description Skill English" name="description">
                <Input.TextArea style={{ height: "100px" }} />
              </Form.Item>

              <Form.Item label="Description Skill Khmer" name="description_kh">
                <Input.TextArea style={{ height: "100px" }} />
              </Form.Item>

              <Form.Item label="Percentage Status" name="pct_status">
                <Input />
              </Form.Item>
              
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select
                  options={[
                    { label: "Active", value: 1 },
                    { label: "Inactive", value: 0 },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Image Logo"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
              >
                <Upload listType="picture-card" beforeUpload={() => false} maxCount={1} accept="image/*">
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
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
      <Table
        bordered
        columns={columns}
        dataSource={state.list}
        loading={state.loading}
        rowKey="id"
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}

export default SkillPage;
