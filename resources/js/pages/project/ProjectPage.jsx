import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
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
import dayjs from "dayjs";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons";
import { request, requestFormData } from "../../utils/request";
import Toast from "../../components/message/Toast";
import { config } from "../../utils/config";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalizedField, formatDateClient, formatDateServer } from "../../utils/helper";

function ProjectPage() {
  const { lang, t } = useLanguage();
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
        setState((pre) => ({ ...pre, list: res.list, loading: false }));
      }
    
    } catch (err) {
      console.error(err);
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  const fetchProTypeList = async () => {
    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request("project-type", "get", {});
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
      formData.append("start_date", values.start_date ? formatDateServer(values.start_date) : "");
      formData.append("end_date", values.end_date ? formatDateServer(values.end_date) : "");
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

      const res = await requestFormData(endpoint, method, formData);

      if (res && !res.error) {
        showToast("success", res.message || t('savedSuccessfully'));
        handleClose();
        fetchList();
      } else {
        showToast("error", res?.message || t('failedToSave'));
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("error", err.message || t('networkServerError'));
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
      pro_type_id: Number(record.pro_type_id ?? undefined),
      images: toFileList(record.images),
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
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
        showToast("success", res.message || t('deletedSuccessfully'));
        fetchList();
      }
    } catch (err) {
      showToast("error", t('failedToDelete'));
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
    { title: "#", dataIndex: "no", key: "id", render: (_, __, index) => index + 1 ,width:80 ,align:'center' },
    {
      title: t('name'),
      key: "name",
      render: (_, record) => getLocalizedField(record, "name", lang),
    },
    {
      title: t('projectType'),
      dataIndex: "project_type",
      key: "project_type",
      render: (pro_type) => (
        <Tag color="yellow">{getLocalizedField(pro_type, "name", lang)}</Tag>
      ),
    },
    {
      title: t('description'),
      key: "description",
      width: 300,
      render: (_, record) => getLocalizedField(record, "description", lang),
    },
    {
      title: t('technologies'),
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
    { title: t('urlLiveDemo'),
      dataIndex: "url_live_demo",
      key: "url_live_demo" ,
      render: (url) => (
        <Tag color="green">
          {url}
        </Tag>
      ),
    },
    { title: t('urlCodeProject'),
      dataIndex: "url_code_project",
      key: "url_code_project" ,
      render: (url) => (
        <Tag color="green">
          {url}
        </Tag>
      ),
    },
    {
      title: t('images'),
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
    { 
      title: t('releaseYear'), 
      dataIndex: "release_year", 
      key: "release_year" , 
      width:120,
      align:'center',
      render: (release_year) => (
        <Tag style={{
            color: '#FF4400',
            background: '#FFF1EB',
            border: '1px solid #FF4400',
          }}>
          {release_year}
        </Tag>
      ), 
    },
    {
      title: t('startDate'),
      dataIndex: "start_date",
      key: "start_date",
      width:120,
      align:'center',
      render: (date) => (date ? formatDateClient(date, "DD-MM-YYYY") : ""),
    },
    {
      title: t('endDate'),
      dataIndex: "end_date",
      key: "end_date",
      width:120,
      align:'center',
      render: (date) => (date ? formatDateClient(date, "DD-MM-YYYY") : ""),
    },
    { 
      title: t('customerUsed'), 
      dataIndex: "customer_used", 
      key: "customer_used" ,
      width:160 ,
      align:'center',
      render: (customer_used) => (
        <Tag color="magenta">
          {customer_used}
        </Tag>
      ),
    },
    {
      title: t('status'),
      dataIndex: "status",
      key: "status",
      width:110,
      align:'center',
      render: (status) => (
        <Tag color={status === 1 ? "green" : "volcano"}>
          {status === 1 ? t('active') : t('inactive')}
        </Tag>
      ),
    },
    {
      title: t('action'),
      key: "action",
      width:110,
      align:'center',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEditBtn(record)}>
            {t('edit')} <EditFilled />
          </Button>
          <Button danger onClick={() => handleDeleteClick(record)}>
            {t('delete')} <DeleteFilled />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20  }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t('project')}</h3>
        <Button
          type="primary"
          style={{ fontSize: 16, fontWeight: 600 }}
          onClick={handleNew}
        >
          <MdOutlineAdd /> {t('add')}
        </Button>
      </div>

      {/* Form Modal */}
      <Modal
        title={t('project')}
        footer={null}
        open={openModal}
        onCancel={handleClose}
        width={950}
      >
        <Form form={formRef} layout="vertical" onFinish={onFinish} initialValues={{ status: 1 }}>
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('name')}
                name="name"
                rules={[{ required: true, message: t('plsInputNameProjectEn') }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('nameKh')}
                name="name_kh"
                rules={[{ required: true, message: t('plsInputNameProjectKh') }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('projectType')}
                name="pro_type_id"
                rules={[{ required: true, message: t('plsSelectProjectType') }]}
              >
                <Select
                  options={state.proTypeList?.map((type) => ({
                    label: getLocalizedField(type, "name", lang),
                    value: type.id,
                  }))}
                />
              </Form.Item>

              <Form.Item label={t('description')} name="description">
                <Input.TextArea style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label={t('descriptionKh')} name="description_kh">
                <Input.TextArea style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label={t('technologies')} name="technologies">
                <Select mode="tags" style={{ width: "100%" }} placeholder={t('typeAndPressEnter')} />
              </Form.Item>

              <Form.Item label={t('urlLiveDemo')} name="url_live_demo">
                <Input placeholder="Ex: https://my-portoflio-drab.vercel.app/" />
              </Form.Item>

              <Form.Item label={t('urlCodeProject')} name="url_code_project">
                <Input placeholder="Ex: https://my-portoflio-drab.vercel.app/" />
              </Form.Item>

              <Form.Item
                label={t('status')}
                name="status"
                rules={[{ required: true, message: t('plsSelectStatus') }]}
              >
                <Select
                  options={[
                    { label: t('active'), value: 1 },
                    { label: t('inactive'), value: 0 },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={t('releaseYear')} name="release_year">
                <Input />
              </Form.Item>

              <Row gutter={20}>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('startDate')} name="start_date" rules={[{ required: true, message: t('plsInputStartYear') }]}>
                      <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item label={t('endDate')} name="end_date" rules={[{ required: true, message: t('plsInputEndYear') }]}>
                      <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
              </Row>

              <Form.Item label={t('customerUsed')} name="customer_used">
                <Input />
              </Form.Item>

              <Form.Item
                label={t('images')}
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
              >
                <Upload listType="picture-card" multiple beforeUpload={() => false} accept="image/*">
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>{t('upload')}</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <div style={{ textAlign: "right" }}>
              <Space>
                <Button onClick={handleClose}>{t('cancel')}</Button>
                <Button type="primary" htmlType="submit">
                  {t('save')}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title={t('confirmDelete')}
        open={deleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText={t('yes')}
        cancelText={t('no')}
      >
        {t('confirmDeleteMessage')}
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
