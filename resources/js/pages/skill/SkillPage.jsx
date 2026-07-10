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

function SkillPage() {
  const { lang, t } = useLanguage();
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
      const res = await request("skill-type", "get", {});
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
    setImageFileList(toFileList(record.images));
  
    formRef.setFieldsValue({
      ...record,

      skill_type_id: Number(record.skill_type_id ?? undefined),
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
    { title: "#", dataIndex: "no", key: "id", render: (_, __, index) => index + 1 , width:80 ,align: 'center',},
    
    {
      title: t('nameSkill'),
      key: "name",
      width:260,
      render: (_, record) => getLocalizedField(record, "name", lang),
    },
    {
      title: t('skillType'),
      dataIndex: "skill_type",
      key: "skill_type",
      width:180,
      align: 'center',
      render: (skill_type) => <Tag color="yellow">{skill_type?.name}</Tag>
    },
    {
      title: t('description'),
      key: "description",
      width: 300,
      render: (_, record) => getLocalizedField(record, "description", lang),
    },
    {
      title: t('imageLogo'),
      dataIndex: "images",
      key: "images",
      width:120,
      align: 'center',
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
          <span>{t('noLogo')}</span>
        ),
    },
    {
      title: t('percentageStatus'),
      dataIndex: "pct_status",
      key: "pct_status",
      width:160,
      align: 'center',
      render: (pct_status) => (
        <Tag color="green">
          {pct_status} %
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
      align: 'center',
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
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t('skillInfo')}</h3>
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
        title={t('skillInfo')}
        footer={null}
        open={openModal}
        onCancel={handleClose}
        width={950}
      >
        <Form form={formRef} layout="vertical" onFinish={onFinish} initialValues={{ status: 1 }}>
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('nameSkill')}
                name="name"
                rules={[{ required: true, message: t('plsInputNameSkillEn') }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('nameSkillKh')}
                name="name_kh"
                rules={[{ required: true, message: t('plsInputNameSkillKh') }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t('skillType')}
                name="skill_type_id"
                rules={[{ required: true, message: t('plsSelectSkillType') }]}
              >
                <Select
                  options={state.skillTypeList?.map((type) => ({
                    label: type.name,
                    value: type.id,
                  }))}
                />
              </Form.Item>

              <Form.Item label={t('description')} name="description">
                <Input.TextArea style={{ height: "100px" }} />
              </Form.Item>

              <Form.Item label={t('descriptionKh')} name="description_kh">
                <Input.TextArea style={{ height: "100px" }} />
              </Form.Item>

              <Form.Item label={t('percentageStatus')} name="pct_status">
                <Input />
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
                label={t('imageLogo')}
                name="images"
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

export default SkillPage;
