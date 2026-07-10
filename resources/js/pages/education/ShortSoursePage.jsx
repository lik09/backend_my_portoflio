import React, { useEffect, useState } from "react";
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, Tag } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalizedField } from "../../utils/helper";

function ShortSoursePage() {
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
      const res = await request("short-course", "get", {});
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
    let url = "short-course",
      method = "post";

    if (formRef.getFieldValue("id")) {
      url = `short-course/${formRef.getFieldValue("id")}`;
      method = "put";
    }

    setState((pre) => ({ ...pre, loading: true }));
    try {
      const res = await request(url, method, body);
      if (res && !res.error) {
        showToast("success", res.message || t('savedSuccessfully'));
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
      const res = await request(`short-course/${itemToDelete.id}`, "delete", {});
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
    { title: "#", dataIndex: "no", key: "id", render: (_, __, index) => index + 1,width:80 ,align:'center' },
    {
      title: t('courseName'),
      key: "course_name",
      width:180,
      render: (_, record) => getLocalizedField(record, "course_name", lang),
    },
    {
      title: t('teacherName'),
      key: "teacher_name",
      width:180,
      align:'center',
      render: (_, record) => getLocalizedField(record, "teacher_name", lang),
    },
    {
      title: t('description'),
      key: "description",
      width:300,
      render: (_, record) => getLocalizedField(record, "description", lang),
    },
    { 
      title: t('timeStudy'), 
      dataIndex: "time_study", 
      key: "time_study", 
      width:180,
      align:'center',
    },
    { title: t('typeStudy'),
      dataIndex: "mode",
      key: "mode" ,
      width:140,
      align:'center',
      render: (mode) => (
        <Tag color= "blue">
          {mode}
        </Tag>
      )
    },
    {
      title: t('status'),
      dataIndex: "status",
      key: "status",
      width:110,
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
          <Button type="primary"  onClick={() => handleEditBtn(record)}> {t('edit')} <EditFilled /></Button>
          <Button danger onClick={() => handleDeleteClick(record)}>{t('delete')} <DeleteFilled /></Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t('shortCourseInfo')}</h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> {t('add')}
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title={t('shortCourseInfo')} footer={null} open={openModal} onCancel={handleClose} width={900} >
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Row gutter={20}>
            <Col xs={24} md={12}>
                <Form.Item label={t('courseName')} name="course_name" rules={[{ required: true, message: t('plsInputCourseNameEn') }]}>
                  <Input />
                </Form.Item>

                <Form.Item label={t('courseNameKh')} name="course_name_kh" rules={[{ required: true, message: t('plsInputCourseNameKh') }]}>
                  <Input />
                </Form.Item>

                <Form.Item label={t('teacherName')} name="teacher_name" rules={[{ required: true, message: t('plsInputTeacherNameEn') }]}>
                  <Input />
                </Form.Item>

                <Form.Item label={t('teacherNameKh')} name="teacher_name_kh" rules={[{ required: true, message: t('plsInputTeacherNameKh') }]}>
                  <Input />
                </Form.Item>

                <Form.Item label={t('description')} name="description">
                  <Input.TextArea style={{ height: 100 }} />
                </Form.Item>

                <Form.Item label={t('descriptionKh')} name="description_kh">
                  <Input.TextArea style={{ height: 100 }} />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item label={t('timeStudy')} name="time_study" >
                  <Input />
                </Form.Item>

                <Form.Item label={t('typeStudy')} name="mode" rules={[{ required: true, message: t('plsSelectTypeStudy') }]}>
                  <Select options={[{ label: t('online'), value: 'online' } ,{ label: t('direct'), value: 'direct' }]} />
                </Form.Item>

                <Form.Item label={t('status')} name="status" rules={[{ required: true, message: t('plsSelectStatus') }]}>
                  <Select options={[{ label: t('active'), value: 1 }, { label: t('inactive'), value: 0 }]} />
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
      <Table bordered columns={columns} dataSource={state.list} loading={state.loading} scroll={{ x: 'max-content' }} />
    </div>
  );
}

export default ShortSoursePage;
