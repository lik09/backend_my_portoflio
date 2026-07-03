import { BookOutlined, DesktopOutlined, FileOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Row, Spin, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';
import { AiOutlineFundProjectionScreen } from 'react-icons/ai';
import { IoCodeSlash } from 'react-icons/io5';
import { PiStudent } from 'react-icons/pi';
import { request } from '../../utils/request';

const STAT_CARDS = [
  { key: 'experience',   label: 'Experience',    color: '#1677ff', Icon: AiOutlineFundProjectionScreen },
  { key: 'project',      label: 'Project',       color: '#52c41a', Icon: DesktopOutlined },
  { key: 'skill',        label: 'Skill',         color: '#722ed1', Icon: IoCodeSlash },
  { key: 'school',       label: 'School',        color: '#fa8c16', Icon: PiStudent },
  { key: 'shortCourse',  label: 'Short Course',  color: '#eb2f96', Icon: BookOutlined },
  { key: 'contactInfo',  label: 'Contact Info',  color: '#13c2c2', Icon: FileOutlined },
];

const DashboardPage = () => {
  const [counts, setCounts] = useState({
    experience: 0,
    project: 0,
    skill: 0,
    school: 0,
    shortCourse: 0,
    contactInfo: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [exp, pro, sk, sch, sc, ci] = await Promise.all([
          request('experiences', 'get'),
          request('project', 'get'),
          request('skill', 'get'),
          request('school', 'get'),
          request('short_course', 'get'),
          request('contact_info', 'get'),
        ]);

        setCounts({
          experience:  Array.isArray(exp)       ? exp.length       : (exp?.list?.length  ?? 0),
          project:     Array.isArray(pro)       ? pro.length       : (pro?.list?.length  ?? 0),
          skill:       Array.isArray(sk)        ? sk.length        : (sk?.list?.length   ?? 0),
          school:      Array.isArray(sch)       ? sch.length       : (sch?.list?.length  ?? 0),
          shortCourse: Array.isArray(sc)        ? sc.length        : (sc?.list?.length   ?? 0),
          contactInfo: Array.isArray(ci)        ? ci.length        : (ci?.list?.length   ?? 0),
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard</h2>
        {/* <p style={{ color: '#888', margin: '4px 0 0' }}>Overview of your portfolio content</p> */}
      </div>

      <Divider orientation="left">Summary</Divider>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {STAT_CARDS.map(({ key, label, color, Icon }) => (
            <Col key={key} xs={24} sm={12} md={8} lg={8} xl={4}>
              <Card
                hoverable
                style={{ borderRadius: 10, height: '100%' }}
                styles={{ body: { padding: '16px 20px' } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      background: color,
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: 20,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Icon />
                  </div>
                  <span style={{ color: '#888', fontSize: 13 }}>{label}</span>
                </div>
                <Statistic
                  value={counts[key]}
                  valueStyle={{ fontSize: 28, fontWeight: 700, color: '#222' }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
};

export default DashboardPage;
