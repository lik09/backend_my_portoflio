import React from "react";
import { Avatar, Dropdown, Flex, Typography } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { request } from "../../utils/request";
import { config } from "../../utils/config";

const AvatarDropdown = () => {
  const navigate = useNavigate();

  const _raw = localStorage.getItem("auth_user");
  const authUser = (_raw && _raw !== "undefined") ? JSON.parse(_raw) : {};
  const avatarSrc = authUser.profile_image
    ? config.image_path + authUser.profile_image
    : null;
  const displayName = authUser.name || authUser.username || "";

  const menuItems = [
    // { key: "/setting",  icon: <UserOutlined />,  label: "Profile" },
    { key: "/setting",  icon: <SettingOutlined />, label: "Setting" },
    { key: "logout",    icon: <LogoutOutlined />,  label: "Logout", danger: true },
  ];

  const handleMenuClick = async ({ key }) => {
    if (key === "logout") {
      await request("logout", "post");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      navigate("/login", { replace: true });
    } else {
      navigate(key);
    }
  };

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      placement="bottomRight"
      arrow
      trigger={["hover"]}
    >
      <Flex align="center" gap={8} style={{ cursor: "pointer" }}>
        <Avatar
          size="large"
          src={avatarSrc}
          icon={!avatarSrc ? <UserOutlined /> : undefined}
        />
        {displayName && (
          <Typography.Text strong style={{ maxWidth: 140 }} ellipsis={{ tooltip: displayName }}>
            {displayName}
          </Typography.Text>
        )}
      </Flex>
    </Dropdown>
  );
};

export default AvatarDropdown;
