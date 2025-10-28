import React from "react";
import { Avatar, Menu, Dropdown } from "antd";
import { UserAddOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function getItem(label, key, icon, danger = false) {
  return { key, icon, label, danger };
}

const AvatarDropdown = () => {
  const navigate = useNavigate();

  const menuItems = [
    getItem("Profile", "/profile", <UserOutlined />),
    getItem("Setting", "/setting", <SettingOutlined />),
    getItem("Logout", "logout", <LogoutOutlined />, true), // highlighted in red
  ];

  const handleMenuClick = (e) => {
    if (e.key === "logout") {
      console.log("Perform Logout");
    } else {
      navigate(e.key); // works for /profile and /setting
    }
  };

  const menu = <Menu onClick={handleMenuClick} items={menuItems} />;

  return (
    <Dropdown overlay={menu} placement="bottomRight" arrow trigger={['hover']}>
      <Avatar size="large" icon={<UserAddOutlined />} style={{ cursor: "pointer" }} />
    </Dropdown>
  );
};

export default AvatarDropdown;
