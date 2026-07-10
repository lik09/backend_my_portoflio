import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";
import DynamicIcon from "../../components/icon/DynamicIcon";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalizedField } from "../../utils/helper";

function ConnectMePage() {
  const { lang, t } = useLanguage();
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
      const res = await request("contact-me", "get", {});
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
    let url = "contact-me",
      method = "post";

    if (formRef.getFieldValue("id")) {
      url = `contact-me/${formRef.getFieldValue("id")}`;
      method = "put";
    }

    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request(url, method, body);
      if (res && !res.error) {
        showToast("success", res?.message || t('savedSuccessfully'));
        handleClose();
        fetchList();
      }
    } catch (err) {
      showToast("error", t('failedToSave'));
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
      const res = await request(`contact-me/${itemToDelete.id}`, "delete", {});
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
      title: t('name'),
      key: "name",
      render: (_, record) => getLocalizedField(record, "name", lang),
    },
    { title: t('connectionBy'), dataIndex: "connection", key: "connection" },
    {
      title: t('description'),
      key: "description",
      render: (_, record) => getLocalizedField(record, "description", lang),
    },
    {
      title: t('iconName'),
      dataIndex: "icon_name",
      key: "icon_name" ,
      render: (icon_name, record) => (
        <Space>
          <DynamicIcon iconImport={record.icon_import} iconName={icon_name} size={18} />
          {icon_name}
        </Space>
      ),
    },
    { title: t('iconImport'), dataIndex: "icon_import", key: "icon_import" },
    { 
      title: t('backgroundBox'), 
      dataIndex: "bg_box", 
      key: "bg_box" ,
      width:150 ,
      align: 'center',
      render: (bg_box) => (
        <Tag color={bg_box}>{bg_box}</Tag>
      ),
    },
    {
      title: t('status'),
      dataIndex: "status",
      key: "status",
      width:110,
      align: 'center',
      render: (status) => <Tag color={status === 1 ? "green" : "volcano"}>{status === 1 ? t('active') : t('inactive')}</Tag>,
    },
    {
      title: t('action'),
      key: "action",
      width:110,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button type="primary"  onClick={() => handleEditBtn(record)}> {t('edit')} <EditFilled /></Button>
          <Button danger onClick={() => handleDeleteClick(record)}>{t('delete')} <DeleteFilled /></Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t('connectMeInfo')}</h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> {t('add')}
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title={t('connectMeInfo')} footer={null} open={openModal} onCancel={handleClose}>
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Form.Item label={t('name')} name="name" rules={[{ required: true, message: t('plsInputNameEn') }]}>
            <Input />
          </Form.Item>

          <Form.Item label={t('nameKh')} name="name_kh" rules={[{ required: true, message: t('plsInputNameKh') }]}>
            <Input />
          </Form.Item>

          <Form.Item label={t('connectionBy')} name="connection" rules={[{ required: true, message: t('plsInputConnectionBy') }]} >
            <Input />
          </Form.Item>

          <Form.Item label={t('description')} name="description">
            <Input.TextArea style={{ height: 100 }} />
          </Form.Item>

          <Form.Item label={t('descriptionKh')} name="description_kh">
            <Input.TextArea style={{ height: 100 }} />
          </Form.Item>

          <Form.Item label={t('iconName')} name="icon_name"  >
            <Input />
          </Form.Item>
          <Form.Item label={t('iconImport')} name="icon_import" >
            <Input />
          </Form.Item>
          <Form.Item label={t('backgroundBox')} name="bg_box" >
            <Input />
          </Form.Item>

          <Form.Item label={t('status')} name="status" rules={[{ required: true, message: t('plsSelectStatus') }]}>
            <Select options={[{ label: t('active'), value: 1 }, { label: t('inactive'), value: 0 }]} />
          </Form.Item>
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
        scroll={{ x: 'max-content' }}  
      />
    </div>
  );
}

export default ConnectMePage;
