import React, { useEffect, useState } from "react";
import { App, Button, Form, Input, Radio, Space, Spin, Tabs, Upload } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { request } from "../../utils/request";
import { useLanguage } from "../../context/LanguageContext";
import { config } from "../../utils/config";

function safeParseUser() {
  const raw = localStorage.getItem("auth_user");
  return raw && raw !== "undefined" ? JSON.parse(raw) : {};
}

function ProfileTab({ t }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [userData, setUserData] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await request("me", "get");
      if (res && res.user) {
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        setUserData(res.user);
      } else {
        const cached = safeParseUser();
        if (Object.keys(cached).length > 0) {
          setUserData(cached);
        } else {
          setFetchError(true);
        }
      }
    };
    load();
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (values.name) formData.append("name", values.name);
      if (values.username) formData.append("username", values.username);
      if (values.email) formData.append("email", values.email);
      const fileList = values.profile_image;
      if (fileList && fileList[0] && fileList[0].originFileObj) {
        formData.append("profile_image", fileList[0].originFileObj);
      }

      const res = await request("update-profile", "post", formData, true);
      if (res && res.user && !res.error) {
        message.success(res.message || "Profile updated successfully");
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        setUserData(res.user);
      } else {
        message.error(res?.message || "Failed to update profile");
      }
    } catch {
      message.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!userData && !fetchError) {
    return <Spin style={{ display: "block", margin: "40px auto" }} />;
  }

  if (fetchError) {
    return <p style={{ color: "red" }}>Could not load profile. Please re-login.</p>;
  }

  const initialFileList = userData.profile_image
    ? [{ uid: "-1", name: "avatar", status: "done", url: config.image_path + userData.profile_image }]
    : [];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        username: userData.username || "",
        name: userData.name || "",
        email: userData.email || "",
        profile_image: initialFileList,
      }}
      style={{ maxWidth: 480 }}
    >
      <Form.Item
        label="Profile Image"
        name="profile_image"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload
          listType="picture-circle"
          beforeUpload={() => false}
          maxCount={1}
          accept="image/*"
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please input your username" }]}
      >
        <Input prefix={<UserOutlined />} />
      </Form.Item>

      <Form.Item
        label={t("name")}
        name="name"
        rules={[{ required: true, message: "Please input your name" }]}
      >
        <Input prefix={<UserOutlined />} />
      </Form.Item>

      <Form.Item
        label={t("email")}
        name="email"
        rules={[
          { required: true, message: "Please input your email" },
          { type: "email", message: "Please enter a valid email" },
        ]}
      >
        <Input prefix={<UserOutlined />} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {t("save")}
        </Button>
      </Form.Item>
    </Form>
  );
}

function PasswordTab({ t }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await request("change-password", "put", {
        current_password: values.current_password,
        new_password: values.new_password,
        new_password_confirmation: values.confirm_password,
      });
      if (res && !res.error) {
        message.success(res.message || "Password changed successfully");
        form.resetFields();
      } else {
        message.error(res?.message || "Failed to change password");
      }
    } catch {
      message.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 480 }}>
      <Form.Item
        label={t("currentPassword")}
        name="current_password"
        rules={[{ required: true, message: "Please input your current password" }]}
      >
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Item
        label={t("newPassword")}
        name="new_password"
        rules={[
          { required: true, message: "Please input a new password" },
          { min: 8, message: "Password must be at least 8 characters" },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Item
        label={t("confirmPassword")}
        name="confirm_password"
        dependencies={["new_password"]}
        rules={[
          { required: true, message: "Please confirm your new password" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("new_password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match"));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {t("save")}
        </Button>
      </Form.Item>
    </Form>
  );
}

function LanguageTab({ t }) {
  const { message } = App.useApp();
  const { lang, setLang } = useLanguage();
  const [selected, setSelected] = useState(lang);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await request("update-language", "put", { language: selected });
      if (res && !res.error) {
        setLang(selected);
        const authUser = safeParseUser();
        localStorage.setItem("auth_user", JSON.stringify({ ...authUser, language: selected }));
        message.success(res.message || "Language updated");
      } else {
        message.error(res?.message || "Failed to update language");
      }
    } catch {
      message.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={24} style={{ maxWidth: 480 }}>
      <div>
        <div style={{ marginBottom: 12, fontWeight: 500 }}>{t("selectLanguage")}</div>
        <Radio.Group value={selected} onChange={(e) => setSelected(e.target.value)}>
          <Space direction="vertical">
            <Radio value="en">
              <span style={{ fontSize: 15 }}>🇺🇸 English</span>
            </Radio>
            <Radio value="km">
              <span style={{ fontSize: 15 }}>🇰🇭 ខ្មែរ (Khmer)</span>
            </Radio>
          </Space>
        </Radio.Group>
      </div>
      <Button
        type="primary"
        icon={<GlobalOutlined />}
        onClick={handleSubmit}
        loading={loading}
        disabled={selected === lang}
      >
        {t("save")}
      </Button>
    </Space>
  );
}

function SettingPage() {
  const { t } = useLanguage();

  const tabItems = [
    {
      key: "profile",
      label: <span><UserOutlined /> {t("updateProfile")}</span>,
      children: <ProfileTab t={t} />,
    },
    {
      key: "password",
      label: <span><LockOutlined /> {t("changePassword")}</span>,
      children: <PasswordTab t={t} />,
    },
    {
      key: "language",
      label: <span><GlobalOutlined /> {t("changeLanguage")}</span>,
      children: <LanguageTab t={t} />,
    },
  ];

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>{t("setting")}</h3>
      <Tabs defaultActiveKey="profile" items={tabItems} />
    </div>
  );
}

export default SettingPage;
