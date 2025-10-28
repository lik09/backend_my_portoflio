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

function ProjectPage() {
  const [state, setState] = useState({ list: [], proTypeList: [], loading: false });
  const [openModal, setOpenModal] = useState(false);
  const [formRef] = Form.useForm();
  const [toast, setToast] = useState(null);
  const [logoFileList, setLogoFileList] = useState([]);
  const [imageFileList, setImageFileList] = useState([]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchList();
    fetchProTypeList();
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
      const res = await request("project", "get", {});
      if (res && !res.error) {
        setState({ list: res.list, loading: false, proTypeList: state.proTypeList });
      }
      console.log("Show: ",res.list );
    } catch (err) {
      console.error(err);
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  const fetchProTypeList = async () => {
    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request("project_type", "get", {});
      if (res && !res.error) {
        setState((pre) => ({
          ...pre,
          proTypeList: res,
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
    setLogoFileList([]);
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
      formData.append("pro_type_id", values.pro_type_id || "");
      formData.append("description", values.description || "");
      formData.append("description_kh", values.description_kh || "");
      formData.append("url_live_demo", values.url_live_demo || "");
      formData.append("url_code_project", values.url_code_project || "");
      formData.append("release_year", values.release_year || "");
      formData.append("start_date", values.start_date || "");
      formData.append("end_date", values.end_date || "");
      formData.append("customer_used", values.customer_used || "");
      formData.append("status", values.status ? 1 : 0);


      // Arrays (append properly as [] fields)
      if (Array.isArray(values.technologies)) {
        values.technologies.forEach((item) => {
          formData.append("technologies[]", item);
        });
      }

      // Multiple images
      if (values.images?.length > 0) {
        values.images.forEach((file) => {
          if (file.originFileObj) formData.append("images[]", file.originFileObj);
        });
      }

      const id = formRef.getFieldValue("id");
      let endpoint = "project";
      let method = "post";

      if (id) {
        endpoint = `project/${id}`;
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
    // setLogoFileList(toFileList(record.logo_school));
    setImageFileList(toFileList(record.images));
  
    formRef.setFieldsValue({
      ...record,
      technologies: Array.isArray(record.technologies)
        ? record.technologies
        : [],
      pro_type_id:record.pro_type_id,
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
      const res = await request(`project/${itemToDelete.id}`, "delete", {});
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
    {
      title: "Name English",
      dataIndex: "name",
      key: "name"
    },
    { title: "Name Khmer", dataIndex: "name_kh", key: "name_kh" },
    {
      title: "Project Type",
      dataIndex: "project_type",
      key: "project_type",
      render: (pro_type) => <Tag color="yellow">{pro_type.name}</Tag>,
    },
    {
      title: "Description English",
      dataIndex: "description",
      key: "description",
      width: 300
    },
    {
      title: "Description Khmer",
      dataIndex: "description_kh",
      key: "description_kh",
      width: 300
    },
    {
      title: "Technologies",
      dataIndex: "technologies",
      key: "technologies",
      width: 300,
      render: (arr) => (
        <Space wrap>
          {arr?.map((item, idx) => (
            <Tag color="blue" key={idx}>
              {item}
            </Tag>
          ))}
        </Space>
      ),
    },
    { title: "URL Live Demo", 
      dataIndex: "url_live_demo", 
      key: "url_live_demo" ,
      render: (url) => (
        <Tag color="green">
          {url}
        </Tag>
      ),
    },
    { title: "URL Code Project", 
      dataIndex: "url_code_project", 
      key: "url_code_project" ,
      render: (url) => (
        <Tag color="green">
          {url}
        </Tag>
      ),
    },
    {
      title: "Images",
      dataIndex: "images",
      key: "images",
      width: 300,
      render: (arr) => (
        <Image.PreviewGroup>
          <Flex gap={10}>
            {arr?.map((img, idx) => (
              <div key={idx}>
                <Image
                  src={`${config.image_path}${img}`}
                  alt="project"
                  width={50}
                  height={50}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </Flex>
        </Image.PreviewGroup>
      ),
    },
    { title: "Release Year", dataIndex: "release_year", key: "release_year" },
    { title: "Start Date", dataIndex: "start_date", key: "start_date" },
    { title: "End Date", dataIndex: "end_date", key: "end_date" },
    { title: "Customer Used", dataIndex: "customer_used", key: "customer_used" },


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
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Project</h3>
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
        title="Project"
        footer={null}
        open={openModal}
        onCancel={handleClose}
        width={950}
      >
        <Form form={formRef} layout="vertical" onFinish={onFinish} initialValues={{ status: 1 }}>
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Name Project English"
                name="name"
                rules={[{ required: true, message: "Please input name project english" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Name Project Khmer"
                name="name_kh"
                rules={[{ required: true, message: "Please input name project khmer" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Project Type"
                name="pro_type_id"
                rules={[{ required: true, message: "Please select project type" }]}
              >
                <Select
                  options={state.proTypeList?.map((type) => ({
                    label: type.name,
                    value: type.id,
                  }))}
                />
              </Form.Item>

              <Form.Item label="Description Project English" name="description">
                <Input.TextArea style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Description Project Khmer" name="description_kh">
                <Input.TextArea style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Technologies" name="technologies">
                <Select mode="tags" style={{ width: "100%" }} placeholder="Type and press Enter" />
              </Form.Item>

              <Form.Item label="URR Live Demo" name="url_live_demo">
                <Input placeholder="Ex: https://my-portoflio-drab.vercel.app/" />
              </Form.Item>

              <Form.Item label="URR Code Project" name="url_code_project">
                <Input placeholder="Ex: https://my-portoflio-drab.vercel.app/" />
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
              <Form.Item label="Release Year" name="release_year">
                <Input />
              </Form.Item>

              <Row gutter={20}>
                  <Col span={12}>
                    <Form.Item label="Start Date" name="start_date" rules={[{ required: true, message: "Please input start year" }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                
                  <Col span={12}>
                    <Form.Item label="End Ddate" name="end_date" rules={[{ required: true, message: "Please input end year" }]}>
                      <Input />
                    </Form.Item>
                  </Col>
              </Row>

              <Form.Item label="Customer Used" name="customer_used">
                <Input />
              </Form.Item>

              <Form.Item
                label="Images"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
              >
                <Upload listType="picture-card" multiple beforeUpload={() => false} accept="image/*">
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

export default ProjectPage;
