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
import { useLanguage } from "../../context/LanguageContext";
import { getLocalizedField } from "../../utils/helper";

function SchoolPage() {
  const { lang, t } = useLanguage();
  const [state, setState] = useState({ list: [], eduTypeList: [], loading: false });
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
    fetchEduTypeList();
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
      const res = await request("school", "get", {});
      if (res && !res.error) {
        setState({ list: res.list, loading: false, eduTypeList: state.eduTypeList });
      }
    } catch (err) {
      console.error(err);
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  const fetchEduTypeList = async () => {
    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request("education_type", "get", {});
      if (res && !res.error) {
        setState((pre) => ({
          ...pre,
          eduTypeList: res.list,
          loading: false,
        }));
        console.log("fetchEduTypeList: ",res);
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
      formData.append("name_school", values.name_school || "");
      formData.append("name_school_kh", values.name_school_kh || "");
      formData.append("edu_type_id", values.edu_type_id || "");
      formData.append("location", values.location || "");
      formData.append("location_kh", values.location_kh || "");
      formData.append("status", values.status ? 1 : 0);


      // Arrays (append properly as [] fields)
      if (Array.isArray(values.description_study)) {
        values.description_study.forEach((item) => {
          formData.append("description_study[]", item);
        });
      }
      if (Array.isArray(values.description_study_kh)) {
        values.description_study_kh.forEach((item) => {
          formData.append("description_study_kh[]", item);
        });
      }

      // Logo file
      if (values.logo_school && values.logo_school[0]?.originFileObj) {
        formData.append("logo_school", values.logo_school[0].originFileObj);
      }

      // Multiple images
      if (values.images?.length > 0) {
        values.images.forEach((file) => {
          if (file.originFileObj) formData.append("images[]", file.originFileObj);
        });
      }
      

      const id = formRef.getFieldValue("id");
      let endpoint = "school";
      let method = "post";

      if (id) {
        endpoint = `school/${id}`;
        formData.append("_method", "PUT"); // Laravel update
      }

      console.log("Sending request to:", `${config.base_url_api}/${endpoint}`);

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
    setLogoFileList(toFileList(record.logo_school));
    setImageFileList(toFileList(record.images));
  
    formRef.setFieldsValue({
      ...record,
      description_study: Array.isArray(record.description_study)
        ? record.description_study
        : [],
      description_study_kh: Array.isArray(record.description_study_kh)
        ? record.description_study_kh
        : [],
      edu_type_id: Number(record.edu_type_id?.id ?? undefined),
      logo_school: toFileList(record.logo_school),
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
      const res = await request(`school/${itemToDelete.id}`, "delete", {});
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
    { title: "#", dataIndex: "no", key: "id", render: (_, __, index) => index + 1 ,width:80 ,align:'center'},
    {
      title: t('logoSchool'),
      dataIndex: "logo_school",
      key: "logo_school",
      width:140,
      align:'center',
      render: (logo) =>
        logo ? (
          <Image.PreviewGroup>
            <Image
              src={`${config.image_path}${logo}`}
              alt="school logo"
              style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
            />
          </Image.PreviewGroup>
        ) : (
          <span>{t('noLogo')}</span>
        ),
    },
    {
      title: t('nameSchool'),
      key: "name_school",
      render: (_, record) => getLocalizedField(record, "name_school", lang),
    },
    {
      title: t('educationType'),
      dataIndex: "edu_type_id",
      key: "edu_type_id",
      render: (edu_type) => <Tag color="yellow">{edu_type.name}</Tag>,
    },
    {
      title: t('descriptionStudy'),
      key: "description_study",
      width: 300,
      render: (_, record) => {
        const arr = getLocalizedField(record, "description_study", lang);
        return (
          <Space wrap>
            {arr?.map((item, idx) => (
              <Tag color="blue" key={idx}>
                {item}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t('location'),
      key: "location",
      render: (_, record) => getLocalizedField(record, "location", lang),
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
                  alt="school"
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t('schoolInfo')}</h3>
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
        title={t('schoolInfo')}
        footer={null}
        open={openModal}
        onCancel={handleClose}
        width={950}
      >
        <Form form={formRef} layout="vertical" onFinish={onFinish} initialValues={{ status: 1 }}>
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('nameSchool')}
                name="name_school"
                rules={[{ required: true, message: t('plsInputNameSchoolEn') }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('nameSchoolKh')}
                name="name_school_kh"
                rules={[{ required: true, message: t('plsInputNameSchoolKh') }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('educationType')}
                name="edu_type_id"
                rules={[{ required: true, message: t('plsSelectEducationType') }]}
              >
                <Select
                  options={state.eduTypeList?.map((type) => ({
                    label: type.name,
                    value: type.id,
                  }))}
                />
              </Form.Item>

              <Form.Item label={t('descriptionStudyEn')} name="description_study">
                <Select mode="tags" style={{ width: "100%" }} placeholder={t('typeAndPressEnter')} />
              </Form.Item>

              <Form.Item label={t('descriptionStudyKh')} name="description_study_kh">
                <Select mode="tags" style={{ width: "100%" }} placeholder={t('typeAndPressEnter')} />
              </Form.Item>

              <Form.Item label={t('location')} name="location">
                <Input placeholder="Ex: Phnom Penh" />
              </Form.Item>

              <Form.Item label={t('locationKh')} name="location_kh">
                <Input placeholder="Ex: ភ្នំពេញ" />
              </Form.Item>

              <Form.Item
                label={t('logo')}
                name="logo_school"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
              >
                <Upload listType="picture-card" beforeUpload={() => false} maxCount={1} accept="image/*">
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>{t('upload')}</div>
                  </div>
                </Upload>
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

export default SchoolPage;
