import React, { useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Flex, Layout, Menu, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";   // <-- import Outlet
import AvatarDropdown from '../profile/AvatarDropdown';
import { AiOutlineFundProjectionScreen } from 'react-icons/ai';
import { PiStudent } from 'react-icons/pi';
import { IoCodeSlash } from 'react-icons/io5';
import { SiReaddotcv } from 'react-icons/si';


const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const items = [
  getItem('Dashboard', '/', <PieChartOutlined />),
  getItem('Home', '/home',<SiReaddotcv /> ,[
    getItem('Profile Info', '/home.profile'),
  ]),
  getItem('Experience', 'exp', <AiOutlineFundProjectionScreen />, [
    getItem('Experience Info', '/exp.experience_info'),
    getItem('Experience', '/exp.experience'),
  ]),
  
  getItem('Education', 'edu', <PiStudent />, [
    getItem('Education Info', '/edu.education_info'),
    getItem('Education Type', '/edu.education_type'),
    getItem('School', '/edu.school'),
    getItem('Short Course', '/edu.short_course'),
  ]),
  getItem('Project', 'pro', <DesktopOutlined />, [
    getItem('Project Info', '/pro.project_info'),
    getItem('Type Project', '/pro.project_type'),
    getItem('Project', '/pro.project'), 
    
  ]),
  getItem('Skill', 'sk', <IoCodeSlash />, [
    getItem('Skill Info', '/sk.skill_info'),
    getItem('Skill Type', '/sk.skill_type'),
    getItem('Skill', '/sk.skill'), 
  ]),
  getItem('Contact', '/contact', <FileOutlined />,[
    getItem('Contact Info', '/con.contact_info'),
    getItem('Talk', '/con.talk'),
    getItem('Connect Me', '/con.contact_me'),
  ]),
  getItem('Setting', '/setting', <SettingOutlined />),
  
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)} style={{backgroundColor:'#fff'}}>
        <div style={{cursor: 'pointer'}} onClick={ 
          () => navigate('/')
          }>
          <img src="/storage/general/logo.png" alt=""  style={{height:"80px",width:"200px"}}/>
        </div>
        {/* <div className="demo-logo-vertical" style={{ marginTop:100 }} /> */}
        
        <Menu 
          theme="light" 
          // defaultSelectedKeys={['/']} 
          mode="inline" 
          items={items} 
          selectedKeys={[location.pathname]}
          onClick={({key}) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Flex align='center' justify='space-between' style={{padding:'0px 18px',height:'60px'}}>
            <h3 style={{fontSize:20 ,fontWeight:'600' }}>My Portoflio</h3>
            <AvatarDropdown />

          </Flex>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          {/* <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'User' }, { title: 'Bill' }]} /> */}
          <div
            style={{
              marginTop:16,
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
