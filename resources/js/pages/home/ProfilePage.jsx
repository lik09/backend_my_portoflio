import React, { useEffect, useState } from "react";
import { Button, Form, Image, Input, Modal, Select, Space, Table, Tag, Upload } from "antd";
import { MdOutlineAdd } from "react-icons/md";
import { DeleteFilled, EditFilled, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import * as FaIcons from "react-icons/fa";
import { request } from "../../utils/request";
import Toast from "../../components/message/Toast";
import { config } from "../../utils/config";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalizedField } from "../../utils/helper";
import ReactDOM from 'react-dom/client';
import { FiDownload, FiPrinter } from 'react-icons/fi';


function ProfilePage() {
  const { lang , t } = useLanguage();
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
      formData.append("fullname_kh", values.fullname_kh || "");
      formData.append("bio", values.bio || "");
      formData.append("bio_kh", values.bio_kh || "");
      formData.append("status", values.status);
      formData.append("permission_download_cv", values.permission_download_cv);

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


      const res = await request(endpoint, method, formData,true, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
      permission_download_cv: record.permission_download_cv,
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

  const handleViewCv = async (id) => {
    const win = window.open('', '_blank');
    try {
      const res = await request(`profiles/${id}/preview-cv`, 'get', {});
      if (!res || res.error || !res.content) throw new Error('Failed to load CV');

      const byteChars = atob(res.content);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);

      const displayName = res.filename || 'cv.pdf';
      const file = new File([new Uint8Array(byteNumbers)], displayName, { type: res.mime || 'application/pdf' });
      const url = URL.createObjectURL(file);

      if (win) {
        win.document.title = displayName;
        win.document.body.style.margin = '0';
        win.document.body.style.overflow = 'hidden';
        win.document.body.style.fontFamily = 'sans-serif';

        const header = win.document.createElement('div');
        header.style.cssText = `
          display: flex; align-items: center; justify-content: space-between;
          height: 48px; padding: 0 16px;
          background: #323639; color: #e8eaed; font-size: 14px;
        `;

        const nameSpan = win.document.createElement('span');
        nameSpan.textContent = displayName;

        const btnGroup = win.document.createElement('div');
        btnGroup.style.cssText = 'display: flex; gap: 16px;';

        // Container element ទទេសម្រាប់ mount React component ចូល
        const downloadContainer = win.document.createElement('a');
        downloadContainer.href = url;
        downloadContainer.download = displayName;
        downloadContainer.style.cssText = 'display: flex; align-items: center; gap: 6px; color: #8ab4f8; text-decoration: none; cursor: pointer;';

        const printContainer = win.document.createElement('button');
        printContainer.style.cssText = 'display: flex; align-items: center; gap: 6px; background: none; border: none; color: #8ab4f8; cursor: pointer; font-size: 14px;';
        printContainer.onclick = () => {
          const iframeEl = win.document.getElementById('pdf-frame');
          iframeEl.contentWindow.print();
        };

        btnGroup.appendChild(downloadContainer);
        btnGroup.appendChild(printContainer);
        header.appendChild(nameSpan);
        header.appendChild(btnGroup);
        win.document.body.appendChild(header);

        // ✅ Render react-icons ចូល container ដោយប្រើ ReactDOM.createRoot
        const downloadRoot = ReactDOM.createRoot(downloadContainer);
        downloadRoot.render(
          <>
            <FiDownload size={14} />
            <span>Download</span>
          </>
        );

        const printRoot = ReactDOM.createRoot(printContainer);
        printRoot.render(
          <>
            <FiPrinter size={14} />
            <span>Print</span>
          </>
        );

        const iframe = win.document.createElement('iframe');
        iframe.id = 'pdf-frame';
        iframe.src = url + '#toolbar=0';
        iframe.style.border = 'none';
        iframe.style.width = '100vw';
        iframe.style.height = 'calc(100vh - 48px)';
        win.document.body.appendChild(iframe);

        win.addEventListener('beforeunload', () => {
          URL.revokeObjectURL(url);
          downloadRoot.unmount();  // cleanup React root ពេលបិទ tab
          printRoot.unmount();
        });
      }
    } catch (err) {
      if (win) win.close();
      showToast('error', t('failedToLoadCv'));
    }
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
    { title: "#", dataIndex: "no", key: "id", render: (_, __, index) => index + 1 ,width: 80 , align:'center'},
    {
      title: t('fullName'),
      key: "fullname",
      render: (_, record) => getLocalizedField(record, "fullname", lang),
    },
    {
      title: t('bio'),
      key: "bio",
      width:300,
      render: (_, record) => getLocalizedField(record, "bio", lang),
    },
    {
      title: t('connectWithMe'),
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
          <Tag color="default"> {t('noSocialLink')} </Tag>
        ),
    },
    {
      title: t("photoCover"),
      dataIndex: "photo_cover",
      key: "photo_cover",
      width:140,
      align:'center',
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
          <span> {t('noPhoto')} </span>
        ),
    },
    {
      title: t("cv"),
      dataIndex: "cv",
      key: "cv",
      width:110,
      align:'center',
      render: (cv, record) =>
        cv ? (
          <Button type="link" style={{ padding: 0 }} onClick={() => handleViewCv(record.id)}>
            {t('viewPdf')}
          </Button>
        ) : (
          <Tag color="default">{t('noCv')}</Tag>
        ),
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
      width:110,
      align:'center',
      render: (status) => <Tag color={status === 1 ? "green" : "volcano"}>{status === 1 ? t('active') : t('inactive')}</Tag>,
    },
    {
      title: t("action"),
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
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}> {t('profileInfo')} </h3>
        <Button type="primary" style={{ fontSize: 16, fontWeight: 600 }} onClick={handleNew}>
          <MdOutlineAdd /> {t('add')}
        </Button>
      </div>

      {/* Form Modal */}
      <Modal title= {t('profileInfo')} footer={null} open={openModal} onCancel={handleClose} width={700}>
        <Form form={formRef} layout="vertical" onFinish={handleSave} initialValues={{ status: 1, permission_download_cv: 1 }}>
          <Form.Item label={t("fullNameEn")} name="fullname" rules={[{ required: true, message: t('plsInputFullNameEn') }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('fullNameKh')} name="fullname_kh">
            <Input />
          </Form.Item>

          <Form.Item label={t("bioEn")} name="bio" rules={[{ required: true, message: t('plsInputBioEn') }]}>
            <Input.TextArea style={{ height: 100 }} />
          </Form.Item>
          <Form.Item label={t("bioKh")} name="bio_kh">
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
                      rules={[{ required: true, message: t('requiredIcon') }]}
                    >
                      <Input placeholder={t('iconClass')} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "link"]}
                      fieldKey={[fieldKey, "link"]}
                      rules={[{ required: true, message: t('requiredLink') }]}
                    >
                      <Input placeholder= {t('linkUrl')} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    {t('addSociallink')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* CV Upload */}
          <Form.Item
            label={t('cv')}
            name="cv"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: t('plsUplaodCv') }]}
          >
            <Upload beforeUpload={() => false} accept=".pdf" maxCount={1}>
              <Button icon={<PlusOutlined />}> {t('uploadCv')} </Button>
            </Upload>
          </Form.Item>

          {/* Photo Cover Upload */}
          <Form.Item
            label={t('photoCover')}
            name="photo_cover"
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

          <Form.Item label={t('status')} name="status" rules={[{ required: true, message: t('plsSelectStatus') }]}>
            <Select options={[{ label: t('active'), value: 1 }, { label: t('inactive'), value: 0 }]} />
          </Form.Item>

          <Form.Item label={t('permissionDownloadCv')} name="permission_download_cv" rules={[{ required: true, message: t('plsSelectPermissionDownloadCv') }]}>
            <Select options={[{ label: t('allowed'), value: 1 }, { label: t('notAllowed'), value: 0 }]} />
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: "right" }}>
              <Space>
                <Button onClick={handleClose}>{t('cancel')} </Button>
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
        scroll={{ x: 'max-content' }} 
      />
    </div>
  );
}

export default ProfilePage;
