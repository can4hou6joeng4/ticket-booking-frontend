import React, { useState, useEffect } from 'react';
import { Card, message, Typography, Row, Col } from 'antd';
import {
  CalendarOutlined,
  TagOutlined,
  QrcodeOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  GlobalOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from '@emotion/styled';
import { statisticsAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

// 样式定义
const PageContainer = styled.div`
  min-height: 100%;
`;

const WelcomeCard = styled.div`
  display: flex;
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  justify-content: space-between;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    padding: 20px;
    flex-direction: column;
  }
  
  @media (max-width: 576px) {
    padding: 16px;
  }
`;

const WelcomeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #1677ff;
`;

const WelcomeContent = styled.div`
  h1 {
    color: #1f1f1f;
    margin-bottom: 4px;
    font-size: 20px;
    font-weight: 500;
    
    @media (max-width: 768px) {
      font-size: 18px;
    }
    
    @media (max-width: 576px) {
      font-size: 16px;
    }
  }
  p {
    color: #666;
    margin: 0;
    font-size: 14px;
  }
`;

const StatsBar = styled.div`
  display: flex;
  gap: 48px;
  
  @media (max-width: 768px) {
    margin-top: 16px;
    width: 100%;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  
  .label {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 28px;
    font-weight: 600;
    color: #1f1f1f;
    line-height: 1.2;
  }
  
  @media (max-width: 768px) {
    align-items: flex-start;
    
    .value {
      font-size: 24px;
    }
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const StatCard = styled.div`
  background: ${props => props.background || '#fff'};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  .title {
    color: rgba(255, 255, 255, 0.85);
    font-size: 1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    
    .icon {
      margin-right: 8px;
      font-size: 1.2rem;
    }
  }
  
  .value {
    color: white;
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
    
    @media (max-width: 576px) {
      font-size: 1.6rem;
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
  }
  
  @media (max-width: 576px) {
    padding: 1.2rem;
  }
`;

const FeatureCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .ant-card-body {
    padding: 24px;
    
    @media (max-width: 576px) {
      padding: 16px;
    }
  }
  
  .feature-icon {
    font-size: 32px;
    margin-bottom: 16px;
    
    @media (max-width: 768px) {
      font-size: 28px;
      margin-bottom: 12px;
    }
    
    @media (max-width: 576px) {
      font-size: 24px;
      margin-bottom: 8px;
    }
  }
`;

const ResponsiveTitle = styled(Title)`
  @media (max-width: 768px) {
    font-size: 18px !important;
    margin-bottom: 12px !important;
  }
  
  @media (max-width: 576px) {
    font-size: 16px !important;
    margin-bottom: 8px !important;
  }
`;

const ResponsiveRow = styled(Row)`
  @media (max-width: 768px) {
    margin-left: -8px !important;
    margin-right: -8px !important;
  }
  
  @media (max-width: 576px) {
    margin-left: -4px !important;
    margin-right: -4px !important;
  }
`;

const ResponsiveCol = styled(Col)`
  @media (max-width: 576px) {
    margin-bottom: 16px;
  }
`;

const QuickActionBar = styled.div`
  display: none;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: #f5f7fa;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
  }
`;

const QuickActionButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  
  .icon {
    font-size: 24px;
    color: #1677ff;
    margin-bottom: 4px;
  }
  
  .text {
    font-size: 12px;
    text-align: center;
  }
  
  &:active {
    opacity: 0.7;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user && user.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    eventCount: 0,
    ticketCount: 0,
    validationCount: 0
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticsAPI.getDashboardStats();
      console.log('Home组件收到统计数据(原始):', response);

      // 判断响应格式并解析数据
      if (response && response.status === 'success') {
        // 获取从后端返回的统计数据
        const statsData = {
          eventCount: 0,
          ticketCount: 0,
          validationCount: 0
        };

        // 直接从响应体中提取数据
        if (response.data && typeof response.data === 'object') {
          statsData.eventCount = response.data.eventCount || 0;
          statsData.ticketCount = response.data.ticketCount || 0;
          statsData.validationCount = response.data.validationCount || 0;
        }

        console.log('解析后的统计数据:', statsData);
        setStatistics(statsData);
      } else {
        console.error('响应格式不正确:', response);
        message.error('获取统计数据失败：' + (response?.message || '未知错误'));
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: t('home.statistics.eventCount'),
      value: (statistics.eventCount || 0).toLocaleString(),
      icon: <CalendarOutlined />,
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: t('home.statistics.ticketCount'),
      value: (statistics.ticketCount || 0).toLocaleString(),
      icon: <TagOutlined />,
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      title: t('home.statistics.validationCount'),
      value: (statistics.validationCount || 0).toLocaleString(),
      icon: <QrcodeOutlined />,
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  const featuresAdmin = [
    {
      title: t('home.features.eventManagement'),
      icon: <AppstoreOutlined style={{ color: '#1677ff' }} />,
      description: t('home.features.eventManagementDesc'),
      onClick: () => navigate('/events')
    },
    {
      title: t('home.features.ticketValidation'),
      icon: <QrcodeOutlined style={{ color: '#52c41a' }} />,
      description: t('home.features.ticketValidationDesc'),
      onClick: () => navigate('/validate')
    },
    {
      title: t('home.features.stats'),
      icon: <BarChartOutlined style={{ color: '#722ed1' }} />,
      description: t('home.features.statsDesc'),
      onClick: () => navigate('/statistics')
    }
  ];

  const featuresUser = [
    {
      title: t('home.features.browseEvents'),
      icon: <CalendarOutlined style={{ color: '#1677ff' }} />,
      description: t('home.features.browseEventsDesc'),
      onClick: () => navigate('/events')
    },
    {
      title: t('home.features.myTickets'),
      icon: <TagOutlined style={{ color: '#52c41a' }} />,
      description: t('home.features.myTicketsDesc'),
      onClick: () => navigate('/tickets')
    }
  ];

  const features = isAdmin ? featuresAdmin : featuresUser;

  const systemFeatures = [
    {
      title: t('home.systemFeatures.security'),
      icon: <SafetyCertificateOutlined style={{ color: '#1677ff' }} />,
      description: t('home.systemFeatures.securityDesc')
    },
    {
      title: t('home.systemFeatures.collaboration'),
      icon: <TeamOutlined style={{ color: '#52c41a' }} />,
      description: t('home.systemFeatures.collaborationDesc')
    },
    {
      title: t('home.systemFeatures.global'),
      icon: <GlobalOutlined style={{ color: '#722ed1' }} />,
      description: t('home.systemFeatures.globalDesc')
    }
  ];

  return (
    <PageContainer>
      <WelcomeCard>
        <WelcomeLeft>
          <Avatar>
            {user?.email?.split('@')[0]?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <WelcomeContent>
            <h1>{t('home.welcomeMessage', { name: user?.email?.split('@')[0] || 'User' })}</h1>
            <p>{t('home.weatherInfo')}</p>
          </WelcomeContent>
        </WelcomeLeft>
        <StatsBar>
          <StatItem>
            <div className="label">{t('home.stats.eventCount')}</div>
            <div className="value">{statistics.eventCount || 0}</div>
          </StatItem>
          <StatItem>
            <div className="label">{t('home.stats.pendingValidation')}</div>
            <div className="value">{statistics.validationCount || 0}/{statistics.ticketCount || 0}</div>
          </StatItem>
        </StatsBar>
      </WelcomeCard>

      {/* 移动端快捷操作区 - 仅在小屏幕上显示 */}
      <QuickActionBar>
        <Row gutter={[8, 8]} style={{ width: '100%' }}>
          {features.slice(0, 3).map((feature, index) => (
            <Col span={8} key={index}>
              <QuickActionButton onClick={feature.onClick}>
                <div className="icon">{feature.icon}</div>
                <div className="text">{feature.title}</div>
              </QuickActionButton>
            </Col>
          ))}
        </Row>
      </QuickActionBar>

      {/* 统计数据 */}
      <StatsContainer>
        {stats.map((stat, index) => (
          <StatCard key={index} background={stat.background}>
            <div className="title">
              <span className="icon">{stat.icon}</span>
              {stat.title}
            </div>
            {loading ? (
              <div style={{ height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingOutlined style={{ fontSize: '1.5rem', color: 'white' }} />
              </div>
            ) : (
              <p className="value">{stat.value}</p>
            )}
          </StatCard>
        ))}
      </StatsContainer>

      {/* 功能卡片 */}
      <ResponsiveTitle level={4} style={{ marginBottom: 16 }}>
        {isAdmin ? t('home.features.admin') : t('home.features.user')}
      </ResponsiveTitle>
      <ResponsiveRow gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {features.map((feature, index) => (
          <ResponsiveCol xs={24} sm={12} md={8} key={index}>
            <FeatureCard onClick={feature.onClick} hoverable>
              <div className="feature-icon">{feature.icon}</div>
              <ResponsiveTitle level={4}>{feature.title}</ResponsiveTitle>
              <Text type="secondary">{feature.description}</Text>
            </FeatureCard>
          </ResponsiveCol>
        ))}
      </ResponsiveRow>

      {/* 系统特点 */}
      <ResponsiveTitle level={4} style={{ marginBottom: 16 }}>
        {t('home.systemFeatures.title')}
      </ResponsiveTitle>
      <ResponsiveRow gutter={[16, 16]}>
        {systemFeatures.map((feature, index) => (
          <ResponsiveCol xs={24} sm={12} md={8} key={index}>
            <FeatureCard hoverable>
              <div className="feature-icon">{feature.icon}</div>
              <ResponsiveTitle level={4}>{feature.title}</ResponsiveTitle>
              <Text type="secondary">{feature.description}</Text>
            </FeatureCard>
          </ResponsiveCol>
        ))}
      </ResponsiveRow>
    </PageContainer>
  );
};

export default Home; 