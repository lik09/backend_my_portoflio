import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, Tag } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalizedField } from "../../utils/helper";
import { useHorizontalWheelScroll } from "../../hooks/useHorizontalWheelScroll";
import { useDragToScroll } from "../../hooks/useDragToScroll";

function ExperiencePage() {
  const { lang, t } = useLanguage();
  const [state, setState] = useState({ list: [], loading: false });
  const [openModal, setOpenModal] = useState(false);
  const [formRef] = Form.useForm();
  const [toast, setToast] = useState(null);
  const tableWrapperRef = useRef(null);
  useHorizontalWheelScroll(tableWrapperRef, { selector: '.ant-table-content' });
  const dragHandlers = useDragToScroll(tableWrapperRef, { selector: '.ant-table-content' });

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
      const res = await request("experiences", "get", {});
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
      title: values.title,
      title_kh: values.title_kh,
      icon: values.icon,
      company_name: values.company_name,
      company_name_kh: values.company_name_kh,
      description: values.description,
      description_kh: values.description_kh,
      location: values.location,
      location_kh: values.location_kh,
      emp_type: values.emp_type,
      emp_type_kh: values.emp_type_kh,
      start_year: values.start_year,
      end_year: values.end_year,
      technologies: values.technologies,
      key_achievements: values.key_achievements,
      key_achievements_kh: values.key_achievements_kh,
      status: values.status,
    };
    let url = "experiences",
      method = "post";

    if (formRef.getFieldValue("id")) {
      url = `experiences/${formRef.getFieldValue("id")}`;
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
      title: record.title,
      title_kh: record.title_kh,
      icon: record.icon,
      company_name: record.company_name,
      company_name_kh: record.company_name_kh,
      description: record.description,
      description_kh: record.description_kh,
      location: record.location,
      location_kh: record.location_kh,
      emp_type: record.emp_type,
      emp_type_kh: record.emp_type_kh,
      start_year: record.start_year,
      end_year: record.end_year,
      technologies: record.technologies,
      key_achievements: record.key_achievements,
      key_achievements_kh: record.key_achievements_kh,
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
      const res = await request(`experiences/${itemToDelete.id}`, "delete", {});
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
      title: t('title'),
      key: "title",
      render: (_, record) => getLocalizedField(record, "title", lang),
    },
    { title: t('icon'), dataIndex: "icon", key: "icon" },
    {
      title: t('companyName'),
      key: "company_name",
      render: (_, record) => getLocalizedField(record, "company_name", lang),
    },
    { title: t('description'), dataIndex: "description", key: "description" },
    {
      title: t('location'),
      key: "location",
      render: (_, record) => getLocalizedField(record, "location", lang),
    },
    {
      title: t('jobType'),
      key: "emp_type",
      render: (_, record) => getLocalizedField(record, "emp_type", lang),
    },

    {
      title: t('keyAchievements'),
      key: "key_achievements",
      render: (_, record) => {
        const keyAchieList = getLocalizedField(record, "key_achievements", lang);
        return Array.isArray(keyAchieList) && keyAchieList.length > 0 ? (
        <Space size={[0, 8]} wrap>
          {keyAchieList.map((keyAchie, index) => (
            <Tag color="blue" key={index}>
              {keyAchie}
            </Tag>
          ))}
        </Space>
        ) : (
          <Tag color="default">{t('keyAchievements')}</Tag>
        );
      },
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
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t('experience')}</h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> {t('add')}
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title={t('experience')} footer={null} open={openModal} onCancel={handleClose} width={900} >
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1 }}>
          <Row gutter={20}>
            {/* col 1 */}
            <Col xs={24} md={12}>
              <Form.Item label={t('title')} name="title" rules={[{ required: true, message: t('plsInputTitle') }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('titleKh')} name="title_kh">
                <Input />
              </Form.Item>

              <Form.Item label={t('companyName')} name="company_name" rules={[{ required: true, message: t('plsInputCompanyName') }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('companyNameKh')} name="company_name_kh">
                <Input />
              </Form.Item>

              <Form.Item label={t('location')} name="location" rules={[{ required: true, message: t('plsInputLocation') }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('locationKh')} name="location_kh">
                <Input />
              </Form.Item>

              <Form.Item label={t('employeeType')} name="emp_type" rules={[{ required: true, message: t('plsInputEmployeeType') }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('employeeTypeKh')} name="emp_type_kh">
                <Input />
              </Form.Item>

              <Form.Item label={t('description')} name="description">
                <Input.TextArea style={{ height: 100 }} />
              </Form.Item>
              <Form.Item label={t('descriptionKh')} name="description_kh">
                <Input.TextArea style={{ height: 100 }} />
              </Form.Item>


            </Col>

            {/* col 2 */}
            <Col xs={24} md={12}>
              <Row gutter={20}>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('startYear')} name="start_year" rules={[{ required: true, message: t('plsInputStartYear') }]}>
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item label={t('endYear')} name="end_year" rules={[{ required: true, message: t('plsInputEndYear') }]}>
                      <Input />
                    </Form.Item>
                  </Col>
              </Row>

              {/* technologies */}
              <Form.Item
                label={t('technologies')}
                name="technologies"
                rules={[{ required: false, message: "Please add at least one technology" }]}
              >
                <Select
                  mode="tags"
                  style={{ width: "100%" }}
                  placeholder={t('typeTechnologyPlaceholder')}
                />
              </Form.Item>

              <Form.Item
                label={t('keyAchievements')}
                name="key_achievements"
              >
                <Select mode="tags" style={{ width: "100%" }} placeholder={t('keyAchievementsPlaceholder')} />
              </Form.Item>
              <Form.Item
                label={t('keyAchievementsKh')}
                name="key_achievements_kh"
              >
                <Select mode="tags" style={{ width: "100%" }} placeholder={t('keyAchievementsKhPlaceholder')} />
              </Form.Item>

              <Form.Item label={t('logo')} name="icon" rules={[{ required: false, message: t('plsInputEndYear') }]}>
                <Input />
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
      <div
        ref={tableWrapperRef}
        style={{ cursor: 'grab', userSelect: 'none', touchAction: 'pan-y' }}
        {...dragHandlers}
      >
        <Table  bordered columns={columns} dataSource={state.list} loading={state.loading} scroll={{ x: 'max-content' }}  />
      </div>
    </div>
  );
}

export default ExperiencePage;
