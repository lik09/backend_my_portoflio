import React, { useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  MoonOutlined,
  PieChartOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { Flex, Layout, Menu, Segmented, Switch, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AvatarDropdown from '../profile/AvatarDropdown';
import { AiOutlineFundProjectionScreen } from 'react-icons/ai';
import { PiStudent } from 'react-icons/pi';
import { IoCodeSlash } from 'react-icons/io5';
import { SiReaddotcv } from 'react-icons/si';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import './MainLayout.css';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG, colorText },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();

  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const divider = `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`;

  const items = [
    getItem(t('dashboard'), '/', <PieChartOutlined />),
    getItem(t('home'), 'home', <SiReaddotcv />, [
      getItem(t('profileInfo'), '/home.profile'),
    ]),
    getItem(t('experience'), 'exp', <AiOutlineFundProjectionScreen />, [
      getItem(t('experienceInfo'), '/exp.experience_info'),
      getItem(t('experience'), '/exp.experience'),
    ]),
    getItem(t('education'), 'edu', <PiStudent />, [
      getItem(t('educationInfo'), '/edu.education_info'),
      getItem(t('educationType'), '/edu.education_type'),
      getItem(t('school'), '/edu.school'),
      getItem(t('shortCourse'), '/edu.short_course'),
    ]),
    getItem(t('project'), 'pro', <DesktopOutlined />, [
      getItem(t('projectInfo'), '/pro.project_info'),
      getItem(t('projectType'), '/pro.project_type'),
      getItem(t('project'), '/pro.project'),
    ]),
    getItem(t('skill'), 'sk', <IoCodeSlash />, [
      getItem(t('skillInfo'), '/sk.skill_info'),
      getItem(t('skillType'), '/sk.skill_type'),
      getItem(t('skill'), '/sk.skill'),
    ]),
    getItem(t('contact'), 'con', <FileOutlined />, [
      getItem(t('contactInfo'), '/con.contact_info'),
      getItem(t('talk'), '/con.talk'),
      getItem(t('connectMe'), '/con.contact_me'),
    ]),
    getItem(t('setting'), '/setting', <SettingOutlined />),
  ];

  // Collapsed-sidebar flyout submenus portal outside the Sider, so they
  // don't inherit `.custom-menu` / `.custom-sider-dark` — give them their
  // own class (styled in MainLayout.css) so they match the sidebar theme.
  const popupClassName = `custom-menu-popup${isDark ? ' custom-menu-popup-dark' : ''}`;
  const itemsWithPopupClass = items.map((item) =>
    item.children ? { ...item, popupClassName } : item
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        className={`custom-sider${isDark ? ' custom-sider-dark' : ''}`}
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: divider,
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'padding 0.2s',
            flexShrink: 0,
          }}
          onClick={() => navigate('/')}
        >
          <img
            src="/storage/general/logo.png"
            alt="logo"
            style={{ height: 36, width: 36, objectFit: 'contain', flexShrink: 0, borderRadius: 8 }}
          />
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', color: colorText }}>
              Portfolio
            </span>
          )}
        </div>

        {/* Scrollable menu region — sider itself stays sticky/fixed height */}
        <div className="custom-menu-scroll">
          <Menu
            mode="inline"
            className="custom-menu"
            items={itemsWithPopupClass}
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['home', 'exp', 'edu', 'pro', 'sk', 'con']}
            onClick={({ key }) => navigate(key)}
            style={{ border: 'none', background: 'transparent', paddingTop: 8 }}
          />
        </div>
      </Sider>

      <Layout style={{ height: '100vh', overflow: 'auto' }}>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            borderBottom: divider,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Flex align='center' justify='space-between' style={{ padding: '0px 18px', height: '100%' }}>
            <h3 style={{ fontSize: 20, fontWeight: '600', margin: 0 }}>My Portfolio</h3>

            <Flex align='center' gap={12}>
              {/* Language toggle */}
              <Segmented
                value={lang}
                options={[
                  { label: 'EN', value: 'en' },
                  { label: 'ខ្មែរ', value: 'km' },
                ]}
                onChange={(val) => setLang(val)}
              />

              {/* Dark / Light toggle */}
              <Switch
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                checked={isDark}
                onChange={toggleTheme}
              />

              <AvatarDropdown />
            </Flex>
          </Flex>
        </Header>

        <Content style={{ margin: '0 16px' }}>
          <div
            style={{
              marginTop: 16,
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* This is where child routes render */}
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          LIk Dev. ©{new Date().getFullYear()} Created by ❤️🧑‍💻
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;