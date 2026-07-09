import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalizedField } from "../../utils/helper";

function TalkPage() {
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
      const res = await request("talk", "get", {});
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
      title: values.title, 
      title_kh: values.title_kh, 
      description: values.description,
      description_kh: values.description_kh,  
      status: values.status 
    };
    let url = "talk",
      method = "post";

    if (formRef.getFieldValue("id")) {
      url = `talk/${formRef.getFieldValue("id")}`;
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
      ...record
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
      const res = await request(`talk/${itemToDelete.id}`, "delete", {});
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
    { title: "#", dataIndex: "no", key: "id", render: (_, __, index) => index + 1 ,width:80, align: 'center' },
    {
      title: t('title'),
      key: "title",
      render: (_, record) => getLocalizedField(record, "title", lang),
    },
    {
      title: t('description'),
      key: "description",
      render: (_, record) => getLocalizedField(record, "description", lang),
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
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t('talkInfo')}</h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> {t('add')}
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title={t('talkInfo')} footer={null} open={openModal} onCancel={handleClose}>
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Form.Item label={t('title')} name="title" rules={[{ required: true, message: t('plsInputTitleEn') }]}>
            <Input />
          </Form.Item>

          <Form.Item label={t('titleKh')} name="title_kh" rules={[{ required: true, message: t('plsInputTitleKh') }]}>
            <Input />
          </Form.Item>

          <Form.Item label={t('description')} name="description">
            <Input.TextArea style={{ height: 100 }} />
          </Form.Item>

          <Form.Item label={t('descriptionKh')} name="description_kh">
            <Input.TextArea style={{ height: 100 }} />
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
      <Table bordered columns={columns} dataSource={state.list} loading={state.loading} scroll={{ x: 'max-content' }} />
    </div>
  );
}

export default TalkPage;
