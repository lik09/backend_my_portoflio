import React, { useEffect, useRef, useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  MenuOutlined,
  MoonOutlined,
  PieChartOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { Button, Flex, Grid, Layout, Menu, Segmented, Switch, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AvatarDropdown from '../profile/AvatarDropdown';
import { AiOutlineFundProjectionScreen } from 'react-icons/ai';
import { PiStudent } from 'react-icons/pi';
import { IoCodeSlash } from 'react-icons/io5';
import { SiReaddotcv } from 'react-icons/si';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import SidebarConnectors from './SidebarConnectors'; 
import './MainLayout.css';
import logo_white from '../../assets/logo/logo_P_2.png';
import logo_back from '../../assets/logo/logo_back.jpg';


const { Header, Content, Footer, Sider } = Layout;
const { useBreakpoint } = Grid;

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

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [location.pathname, isMobile]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', isDark);
  }, [isDark]);

  const divider = `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`;

  const menuScrollRef = useRef(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0, visible: false });

  useEffect(() => {
    const updateIndicator = () => {
      const container = menuScrollRef.current;
      if (!container || collapsed) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }

      const target = container.querySelector('.ant-menu-item-selected');
      if (!target) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setIndicator({
        top: targetRect.top - containerRect.top + container.scrollTop,
        height: targetRect.height,
        visible: true,
      });
    };

    updateIndicator();

    const container = menuScrollRef.current;
    if (!container) return undefined;

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(container);

    return () => observer.disconnect();
  }, [location.pathname, collapsed]);

  const items = [
    getItem(t('dashboard'), '/', <PieChartOutlined />),
    getItem(t('home'), 'home', <SiReaddotcv />, [
      getItem(t('profileInfo'), '/home.profile'),
    ]),
    getItem(t('experience'), 'exp', <AiOutlineFundProjectionScreen />, [
      getItem(t('experienceInfo'), '/exp.experience-info'),
      getItem(t('experience'), '/exp.experience'),
    ]),
    getItem(t('education'), 'edu', <PiStudent />, [
      getItem(t('educationInfo'), '/edu.education-info'),
      getItem(t('educationType'), '/edu.education-type'),
      getItem(t('school'), '/edu.school'),
      getItem(t('shortCourse'), '/edu.short-course'),
    ]),
    getItem(t('project'), 'pro', <DesktopOutlined />, [
      getItem(t('projectInfo'), '/pro.project-info'),
      getItem(t('projectType'), '/pro.project-type'),
      getItem(t('project'), '/pro.project'),
    ]),
    getItem(t('skill'), 'sk', <IoCodeSlash />, [
      getItem(t('skillInfo'), '/sk.skill-info'),
      getItem(t('skillType'), '/sk.skill-type'),
      getItem(t('skill'), '/sk.skill'),
    ]),
    getItem(t('contact'), 'con', <FileOutlined />, [
      getItem(t('contactInfo'), '/con.contact-info'),
      getItem(t('talk'), '/con.talk'),
      getItem(t('connectMe'), '/con.contact-me'),
    ]),
    getItem(t('setting'), '/setting', <SettingOutlined />),
  ];

  const popupClassName = `custom-menu-popup${isDark ? ' custom-menu-popup-dark' : ''}`;
  const itemsWithPopupClass = items.map((item) =>
    item.children ? { ...item, popupClassName } : item
  );

  return (
    <Layout style={{ minHeight: '100vh'}}>
      <Sider
        collapsible
        trigger={null}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsedWidth={isMobile ? 0 : 80}
        width={240}
        className={`custom-sider${isDark ? ' custom-sider-dark' : ''}`}
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
          height: '100vh',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          zIndex: isMobile ? 1000 : undefined,
        }}
      >
        {/* Brand */}
        <div className="custom-menu-scroll" ref={menuScrollRef} style={{ position: 'relative' }}>
          <div
            style={{
              height: 124,
              display: 'flex',
              alignItems: 'center',
              justifyContent:'center',
              padding: 0 ,
              borderBottom: divider,
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'padding 0.2s',
              flexShrink: 0,
              position: 'sticky',
              top: 0,
              left: 0,
              backgroundColor: 'var(--sider-bg)',
              zIndex:10,
            }}
            onClick={() => navigate('/')}
          >
            <img
              src={isDark ? logo_back : logo_white}
              alt="logo.png"
              style={{ height: !collapsed ? '100%' : '60%', transition: 'height 0.2s ease' }}
            />
          </div>

          <Menu
            mode="inline"
            className="custom-menu"
            items={itemsWithPopupClass}
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['home', 'exp', 'edu', 'pro', 'sk', 'con']}
            onClick={({ key }) => navigate(key)}
            style={{ border: 'none', background: 'transparent', paddingTop: 8,zIndex:1 }}
          />

         
          {!collapsed && (
            <SidebarConnectors
              containerRef={menuScrollRef}
              deps={[location.pathname, collapsed, isDark, lang]}
              activeColor={'#5996FF'}
              defaultColor={'#BFC6C4'}
            />
          )}
        </div>
      </Sider>

      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 999,
          }}
        />
      )}

      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            borderBottom: divider,
            position: 'sticky',
            flexShrink: 0,
            top: 0,
            zIndex: 9,
          }}
        >
          <Flex align='center' justify='space-between' wrap="wrap" style={{ padding: '0px 18px', height: '100%', rowGap: 8 }}>
            <Flex align='center' gap={8}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setCollapsed((prev) => !prev)}
                style={{ fontSize: 18  }}
              />
              <h3 className="header-title" style={{ fontSize: 20, fontWeight: '600', margin: 0 }}> {t('myPortfolio')} </h3>
            </Flex>

            <Flex align='center' gap={12} wrap="wrap">
              <Segmented
                value={lang}
                options={[
                  { label: 'EN', value: 'en' },
                  { label: 'ខ្មែរ', value: 'km' },
                ]}
                onChange={(val) => setLang(val)}
              />

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

        <Content style={{ margin: isMobile ? '0 8px' : '0 16px'}}>
          <div
            style={{
              marginTop: 16,
              padding: isMobile ? 12 : 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          {t('createdBy')} Lik Dev. ©{new Date().getFullYear()}  ❤️🧑‍💻
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;