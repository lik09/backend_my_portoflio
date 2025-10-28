import React, { useEffect, useState } from "react";
import { Button, Form, Image, Input, Modal, Select, Space, Table, Tag, Upload } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import * as FaIcons from "react-icons/fa";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";
import { config } from "../../utils/config";

function ProfilePage() {
  const [state, setState] = useState({ list: [], loading: false });
  const [openModal, setOpenModal] = useState(false);
  const [formRef] = Form.useForm();
  const [toast, setToast] = useState(null);
  const [logoFileList, setLogoFileList] = useState([]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

  const showToast = (type, message) => setToast({ type, message });

  const fetchList = async () => {
    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request("profiles", "get", {});
      if (res && !res.error) {
        const formatted = res.map((item) => ({ ...item, key: item.id }));
        setState({ list: formatted, loading: false });
      }
    } catch (err) {
      console.error(err);
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

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

  const handleNew = () => {
    formRef.resetFields();
    setLogoFileList([]);
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const handleSave = async (values) => {
    setState((p) => ({ ...p, loading: true }));
    try {
      const formData = new FormData();
      formData.append("fullname", values.fullname || "");
      formData.append("bio", values.bio || "");
      formData.append("status", values.status); // FIXED ✅

      if (Array.isArray(values.connect_with_me)) {
        formData.append("connect_with_me", JSON.stringify(values.connect_with_me));
      }

      if (values.cv && values.cv[0]?.originFileObj) {
        formData.append("cv", values.cv[0].originFileObj);
      }

      if (values.photo_cover && values.photo_cover[0]?.originFileObj) {
        formData.append("photo_cover", values.photo_cover[0].originFileObj);
      }

      const id = formRef.getFieldValue("id");
      let endpoint = "profiles";
      let method = "post";

      if (id) {
        endpoint = `profiles/${id}`;
        formData.append("_method", "PUT"); // for Laravel
      }

      // Debug payload
      // for (let [k, v] of formData.entries()) {
      //   console.log("sending:", k, v);
      // }

      const res = await request(endpoint, method, formData,true, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
    setLogoFileList(toFileList(record.photo_cover));

    formRef.setFieldsValue({
      ...record,
      connect_with_me: record.connect_with_me || [],
      photo_cover: toFileList(record.photo_cover),
      // cv: record.cv ? [{ name: record.cv.split("/").pop(), url: config.pdf_path + record.cv, uid: "-1", status: "done" }] : [],
      cv: record.cv
        ? [
            {
              name: record.cv_original_name || record.cv.split("/").pop(),
              url: config.pdf_path + record.cv,
              uid: "-1",
              status: "done",
            },
          ]
        : [],


      status: record.status,
      id: record.id,
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
      const res = await request(`profiles/${itemToDelete.id}`, "delete", {});
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

  const getFaIcon = (iconClass) => {
    if (!iconClass) return null;

    const parts = iconClass.split(" ");
    const last = parts[parts.length - 1];
    const iconName = "Fa" + last.replace("fa-", "").charAt(0).toUpperCase() + last.replace("fa-", "").slice(1);

    const IconComponent = FaIcons[iconName];
    return IconComponent ? <IconComponent style={{ marginRight: 6 }} /> : null;
  };

  const columns = [
    { title: "#", dataIndex: "no", key: "id", render: (_, __, index) => index + 1 },
    { title: "Full Name", dataIndex: "fullname", key: "fullname" },
    { title: "BIO", dataIndex: "bio", key: "bio" },
    {
      title: "Connect With Me",
      dataIndex: "connect_with_me",
      key: "connect_with_me",
      render: (list) =>
        Array.isArray(list) && list.length > 0 ? (
          <Space size={[0, 8]} wrap>
            {list.map((item, index) => (
              <Tag color="blue" key={index}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  {getFaIcon(item.icon)}
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {new URL(item.link).hostname}
                  </a>
                </span>
              </Tag>
            ))}
          </Space>
        ) : (
          <Tag color="default">No Social Links</Tag>
        ),
    },
    {
      title: "Photo Cover",
      dataIndex: "photo_cover",
      key: "photo_cover",
      render: (photo) =>
        photo ? (
          <Image.PreviewGroup>
            <Image
              src={`${config.image_path}${photo}`}
              alt="photo cover"
              style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
            />
          </Image.PreviewGroup>
        ) : (
          <span>No Photo</span>
        ),
    },
    {
      title: "CV",
      dataIndex: "cv",
      key: "cv",
      render: (cv) =>
        cv ? (
          <a href={`${config.image_path}${cv}`} target="_blank" rel="noopener noreferrer">
            View PDF
          </a>
        ) : (
          <Tag color="default">No CV</Tag>
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
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Profile Information</h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> Add
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title="Profile Information" footer={null} open={openModal} onCancel={handleClose} width={700}>
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Form.Item label="Full Name" name="fullname" rules={[{ required: true, message: "Please input full name" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="BIO" name="bio" rules={[{ required: true, message: "Please input bio" }]}>
            <Input.TextArea style={{ height: 100 }} />
          </Form.Item>

          {/* Connect With Me */}
          <Form.List name="connect_with_me">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, "icon"]}
                      fieldKey={[fieldKey, "icon"]}
                      rules={[{ required: true, message: "Missing icon" }]}
                    >
                      <Input placeholder="Icon class (e.g., fab fa-facebook)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "link"]}
                      fieldKey={[fieldKey, "link"]}
                      rules={[{ required: true, message: "Missing link" }]}
                    >
                      <Input placeholder="Link URL" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Social Link
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* CV Upload */}
          <Form.Item
            label="CV"
            name="cv"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: "Please upload CV" }]}
          >
            <Upload beforeUpload={() => false} accept=".pdf" maxCount={1}>
              <Button icon={<PlusOutlined />}>Upload CV</Button>
            </Upload>
          </Form.Item>

          {/* Photo Cover Upload */}
          <Form.Item
            label="Photo Cover"
            name="photo_cover"
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

export default ProfilePage;
