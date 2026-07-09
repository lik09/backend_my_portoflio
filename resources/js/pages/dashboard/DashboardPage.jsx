import { BookOutlined, DesktopOutlined, FileOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Empty, Row, Spin, Statistic, theme } from 'antd';
import { Column, Pie } from '@ant-design/plots';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineFundProjectionScreen } from 'react-icons/ai';
import { IoCodeSlash } from 'react-icons/io5';
import { PiStudent } from 'react-icons/pi';
import { request } from '../../utils/request';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedField } from '../../utils/helper';

// Keyed by skill_type.id (not the localized name) so colors stay stable
// regardless of UI language or any text-encoding differences in translated names.
// 1: Frontend, 2: Backend, 3: Tool & Other, 4: Mobile app, 10: Database, 11: Microsoft office
const SKILL_TYPE_COLOR_BY_ID = {
  1: '#3ac6f7',
  2: '#5a4fcf',
  3: '#eb2f96',
  4: '#fa8c16',
  10: '#52c41a',
  11: '#13c2c2',
};
const DEFAULT_SKILL_COLOR = '#3ac6f7';

// Keyed by project_type.id — សូមកែតម្លៃឲ្យត្រូវនឹង id ជាក់ស្តែងរបស់អ្នក
const PROJECT_TYPE_COLOR_BY_ID = {
  1: '#FF6B35',
  2: '#5AD8A6',
  3: '#5D7092',
  4: '#F6BD16',
  5: '#E8684A',
  6: '#6DC8EC',
};
const DEFAULT_PROJECT_COLOR = '#FF6B35';

const DashboardPage = () => {
  const { t, lang } = useLanguage();
  const [counts, setCounts] = useState({
    experience: 0,
    project: 0,
    skill: 0,
    school: 0,
    shortCourse: 0,
    contactInfo: 0,
  });
  const [skillList, setSkillList] = useState([]);
  const [circleProjectList, setCircleProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = theme.useToken();

  // --- dynamic width handling ---
  const chartWrapperRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const MIN_SLOT_WIDTH = 130;

  useEffect(() => {
    if (!chartWrapperRef.current) return;
    const el = chartWrapperRef.current;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const STAT_CARDS = [
    { key: 'experience', label: t('experience'), color: '#1677ff', Icon: AiOutlineFundProjectionScreen },
    { key: 'project', label: t('project'), color: '#52c41a', Icon: DesktopOutlined },
    { key: 'skill', label: t('skill'), color: '#722ed1', Icon: IoCodeSlash },
    { key: 'school', label: t('school'), color: '#fa8c16', Icon: PiStudent },
    { key: 'shortCourse', label: t('shortCourse'), color: '#eb2f96', Icon: BookOutlined },
    { key: 'contactInfo', label: t('contactInfo'), color: '#13c2c2', Icon: FileOutlined },
  ];

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
          experience: Array.isArray(exp) ? exp.length : (exp?.list?.length ?? 0),
          project: Array.isArray(pro) ? pro.length : (pro?.list?.length ?? 0),
          skill: Array.isArray(sk) ? sk.length : (sk?.list?.length ?? 0),
          school: Array.isArray(sch) ? sch.length : (sch?.list?.length ?? 0),
          shortCourse: Array.isArray(sc) ? sc.length : (sc?.list?.length ?? 0),
          contactInfo: Array.isArray(ci) ? ci.length : (ci?.list?.length ?? 0),
        });

        setSkillList(Array.isArray(sk) ? sk : (sk?.list ?? []));
        setCircleProjectList(Array.isArray(pro) ? pro : (pro?.list ?? []));
     
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
  console.log("circleProjectList updated:", circleProjectList);
}, [circleProjectList]);

  const skillChartData = useMemo(() => {
    const raw = skillList.map((skill) => ({
      name: getLocalizedField(skill, 'name', lang),
      pct_status: skill.pct_status,
      type: getLocalizedField(skill.skill_type, 'name', lang),
      typeId: skill.skill_type?.id,
    }));

    const seen = new Set();
    const deduped = raw.filter((item) => {
      const key = `${item.name}__${item.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Group bars by skill type so same-type bars render as one contiguous
    // cluster instead of being interleaved with other types.
    return deduped.sort((a, b) => (a.typeId ?? Infinity) - (b.typeId ?? Infinity));
  }, [skillList, lang]);

  const slotCount = useMemo(() => {
    const uniqueNames = new Set(skillChartData.map((d) => d.name));
    return uniqueNames.size || 1;
  }, [skillChartData]);

  const { skillTypes, skillTypeColors } = useMemo(() => {
    const colorByDisplayType = new Map();
    for (const d of skillChartData) {
      if (!colorByDisplayType.has(d.type)) {
        colorByDisplayType.set(d.type, SKILL_TYPE_COLOR_BY_ID[d.typeId] ?? DEFAULT_SKILL_COLOR);
      }
    }
    return {
      skillTypes: Array.from(colorByDisplayType.keys()),
      skillTypeColors: Array.from(colorByDisplayType.values()),
    };
  }, [skillChartData]);

  const neededWidth = slotCount * MIN_SLOT_WIDTH;
  const chartWidth = Math.max(containerWidth, neededWidth);


  // -------- Project pie chart data -------
  const { projectChartData, projectTypeColors } = useMemo(() => {
    const countByType = new Map(); // typeName -> { value, typeId }

    circleProjectList.forEach((project) => {
      const typeName = getLocalizedField(project.project_type, 'name', lang) || t('other');
      const typeId = project.project_type?.id;
      if (!countByType.has(typeName)) {
        countByType.set(typeName, { value: 0, typeId });
      }
      countByType.get(typeName).value += 1;
    });

    const data = Array.from(countByType.entries()).map(([type, info]) => ({
      type,
      value: info.value,
      typeId: info.typeId,
    }));

    const colors = data.map(
      (d) => PROJECT_TYPE_COLOR_BY_ID[d.typeId] ?? DEFAULT_PROJECT_COLOR
    );

    return { projectChartData: data, projectTypeColors: colors };
  }, [circleProjectList, lang, t]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}> {t('dashboard')} </h2>
      </div>

      <Divider orientation="left">{t('summary')}</Divider>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {STAT_CARDS.map(({ key, label, color, Icon }) => (
            <Col key={key} xs={24} sm={12} md={12} lg={8} xl={8}>
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
                      padding: '14px',
                      color: '#fff',
                      fontSize: 30,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Icon />
                  </div>
                  <span style={{ color: token.colorTextSecondary, fontSize: 18 }}>{label}</span>
                </div>
                <Statistic
                  value={counts[key]}
                  valueStyle={{ fontSize: 35, fontWeight: 700, color: token.colorText }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Divider orientation="left">{t('skill')}</Divider>

        <Card style={{ borderRadius: 10 }}>
          {skillChartData.length > 0 ? (
            <>
              {/* Custom legend — HTML/CSS ធម្មតា, គ្មានកាត់ label ដាច់ខាត */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px 24px',
                  justifyContent: 'center',
                  marginBottom: 16,
                  padding: '0 8px'
                }}
              >
                {skillTypes.map((type, idx) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: skillTypeColors[idx],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {type}
                    </span>
                  </div>
                ))}
              </div>

              <div ref={chartWrapperRef} style={{ overflowX: 'auto', width: '100%'}}>
                <div style={{ width: chartWidth }}>
                  <Column
                    data={skillChartData}
                    xField="name"
                    yField="pct_status"
                    colorField="type"
                    height={480}

                    scale={{
                      x: { padding: 0.1 },
                      y: { domain: [0, 100] },
                      color: { domain: skillTypes, range: skillTypeColors },
                    }}

                    style={{
                      maxWidth: 50,
                      radiusTopLeft: 4,
                      radiusTopRight: 4,
                    }}

                    axis={{
                      x: {
                        labelAutoRotate: false,
                        labelAutoHide: false,
                        style: { labelFontSize: 12 , labelFill: token.colorText},
                      },
                      y: {
                        grid: true,
                        gridLineDash: [0, 0],
                        style: { gridStroke: '#f0f0f0' },
                      },
                    }}

                    legend={false} // code default legend of ant-design/plots@2.6.8 ពីព្រោះវាកាត់ ធ្វើអោយការបង្ហាញមិនស្អាត

                    tooltip={{
                      items: [{ channel: 'y', name: 'ភាគរយ' }],
                    }}

                    label={{
                      text: 'pct_status',
                      position: 'top',
                      style: { fill: '#666', fontSize: 12, fontWeight: 500 },
                    }}

                    interaction={{
                      elementHighlight: false,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <Empty />
          )}
        </Card>

        <Divider orientation="left">{t('project')}</Divider>

        <Card style={{ borderRadius: 10 }}>
          {projectChartData.length > 0 ? (
            <Pie
              data={projectChartData}
              angleField="value"
              colorField="type"
              height={400}
              radius={0.75}
              scale={{
                color: { domain: projectChartData.map((d) => d.type), range: projectTypeColors },
              }}
              label={{
                text: (d) => `${d.type}\n${d.value}`,
                position: 'outside',
                style: {
                  fontSize: 12,
                  fill: token.colorText,  
                
                },
              }}
              legend={{
                color: {
                  position: 'right',
                  itemMarker: 'circle',
                  itemLabelFill: token.colorText ,  
                },
              }}
              tooltip={{
                items: [{ channel: 'y', name: t('project') }],
              }}
              interaction={{
                elementHighlight: false,
              }}
            />
          ) : (
            <Empty />
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default DashboardPage;