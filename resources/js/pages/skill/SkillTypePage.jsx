import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalizedField } from "../../utils/helper";

function SkillTypePage() {
  const { lang, t } = useLanguage();
  const [state, setState] = useState({ list: [], loading: false });
  const [openModal, setOpenModal] = useState(false);
  const [formRef] = Form.useForm();
  const [toast, setToast] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

  const showToast = (type, message) => setToast({ type, message });

  const fetchList = async () => {
    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request("skill_type", "get", {});
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
      name: values.name,
      name_kh: values.name_kh,
      status: values.status,
    };
    let url = "skill_type",
      method = "post";

    if (formRef.getFieldValue("id")) {
      url = `skill_type/${formRef.getFieldValue("id")}`;
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
      name: record.name,
      name_kh: record.name_kh,
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
      const res = await request(`skill_type/${itemToDelete.id}`, "delete", {});
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
    { title: "#", dataIndex: "no", key: "id", render: (_, __, index) => index + 1 ,width:80 , align:'center'},
    {
      title: t('name'),
      key: "name",
      render: (_, record) => getLocalizedField(record, "name", lang),
    },
    {
      title: t('status'),
      dataIndex: "status",
      key: "status",
      width:110 ,
      align:'center',
      render: (status) => <Tag color={status === 1 ? "green" : "volcano"}>{status === 1 ? t('active') : t('inactive')}</Tag>,
    },
    {
      title: t('action'),
      key: "action",
      width:110,
      align:'center',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEditBtn(record)}>{t('edit')} <EditFilled /></Button>
          <Button danger onClick={() => handleDeleteClick(record)}>{t('delete')} <DeleteFilled /></Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t('skillType')}</h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> {t('add')}
        </Button>
      </div>

      <Modal title={t('skillType')} footer={null} open={openModal} onCancel={handleClose}>
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item label={t('name')} name="name" rules={[{ required: true, message: t('plsInputName') }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('nameKh')} name="name_kh">
            <Input />
          </Form.Item>
          <Form.Item label={t('status')} name="status" rules={[{ required: true, message: t('plsSelectStatus') }]}>
            <Select options={[{ label: t('active'), value: 1 }, { label: t('inactive'), value: 0 }]} />
          </Form.Item>
          <Form.Item>
            <div style={{ textAlign: "right" }}>
              <Space>
                <Button onClick={handleClose}>{t('cancel')}</Button>
                <Button type="primary" htmlType="submit">{t('save')}</Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>

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

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <Table bordered columns={columns} dataSource={state.list} loading={state.loading} scroll={{ x: 'max-content' }} />
    </div>
  );
}

export default SkillTypePage;
