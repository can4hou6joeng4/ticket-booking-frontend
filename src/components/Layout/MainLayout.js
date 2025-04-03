import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Space, message, Drawer } from 'antd';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  HomeOutlined,
  CalendarOutlined,
  TagOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  QrcodeOutlined,
  BarChartOutlined,
  SettingOutlined,
  TranslationOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import zhTW from 'antd/lib/locale/zh_TW';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// 样式定义
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f5f5f5;
`;

const StyledSider = styled(Sider)`
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  background: #fff;
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 0;
  }
  
  .ant-menu {
    border-right: none;
  }
`;

const LogoContainer = styled.div`
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
`;

const Logo = styled.div`
  color: #1677ff;
  font-size: ${props => (props.collapsed ? '20px' : '18px')};
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
`;

const StyledHeader = styled(Header)`
  background: #fff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const DateDisplay = styled(Text)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 992px) {
    gap: 8px;
  }
`;

const MobileMenuButton = styled(Button)`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const DesktopMenuButton = styled(Button)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledContent = styled(Content)`
  margin: 24px;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    margin: 16px;
    padding: 16px;
  }
  
  @media (max-width: 576px) {
    margin: 10px;
    padding: 10px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 8px;
  height: 48px;
  border-radius: 4px;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
  
  @media (max-width: 576px) {
    padding: 0 4px;
    height: 40px;
  }
`;

const UserAvatar = styled(Avatar)`
  background: #1677ff;
`;

const UserName = styled(Text)`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: 992px) {
    max-width: 80px;
  }
  
  @media (max-width: 576px) {
    display: none;
  }
`;

const RoleTag = styled.span`
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
  color: #1677ff;
  background: rgba(22, 119, 255, 0.1);
  
  @media (max-width: 576px) {
    display: none;
  }
`;

// 语言和Antd的LocaleProvider映射
const antdLocales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'zh-TW': zhTW
};

// 设备检测函数
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user && user.role === 'admin';
  const [currentTime, setCurrentTime] = useState(new Date());

  // i18n国际化钩子
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  // 响应式断点检测
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 自动折叠侧边栏
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString(language, {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 语言选项
  const languages = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'en-US', label: 'English' }
  ];

  const handleLanguageChange = (value) => {
    i18n.changeLanguage(value);
    setLanguage(value);
    localStorage.setItem('i18nextLng', value);
    message.success(`${t('common.success')}: ${languages.find(l => l.value === value).label}`);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerOpen(false);
  };

  // 处理导航
  const handleNavigation = useCallback((path) => {
    navigate(path);
    closeMobileDrawer();
  }, [navigate]);

  const userMenu = [
    {
      key: 'language',
      label: t('layout.language'),
      icon: <TranslationOutlined />,
      children: languages.map(lang => ({
        key: `lang-${lang.value}`,
        label: lang.label,
        onClick: () => handleLanguageChange(lang.value),
      })),
    },
    {
      key: 'logout',
      label: t('layout.logout'),
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  // 管理员侧边栏菜单
  const adminSidebarItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: t('layout.home'),
      onClick: () => handleNavigation('/'),
    },
    {
      key: '/events',
      icon: <AppstoreOutlined />,
      label: t('layout.events'),
      onClick: () => handleNavigation('/events'),
    },
    {
      key: '/validate',
      icon: <QrcodeOutlined />,
      label: t('layout.validation'),
      onClick: () => handleNavigation('/validate'),
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: t('layout.statistics'),
      onClick: () => handleNavigation('/statistics'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('layout.settings'),
      onClick: () => handleNavigation('/settings'),
    },
  ];

  // 用户侧边栏菜单
  const userSidebarItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: t('layout.home'),
      onClick: () => handleNavigation('/'),
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: t('layout.events'),
      onClick: () => handleNavigation('/events'),
    },
    {
      key: '/tickets',
      icon: <TagOutlined />,
      label: t('layout.tickets'),
      onClick: () => handleNavigation('/tickets'),
    },
  ];

  const sidebarItems = isAdmin ? adminSidebarItems : userSidebarItems;

  return (
    <ConfigProvider locale={antdLocales[language]}>
      <StyledLayout>
        <StyledSider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={256}
        >
          <LogoContainer>
            <Logo collapsed={collapsed}>
              {!collapsed ? t('home.title') : 'TMS'}
            </Logo>
          </LogoContainer>
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={['/']}
            selectedKeys={[location.pathname]}
            items={sidebarItems}
          />
        </StyledSider>

        <MobileDrawer
          title={t('home.title')}
          placement="left"
          closable={true}
          onClose={closeMobileDrawer}
          open={mobileDrawerOpen}
          width={250}
        >
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={['/']}
            selectedKeys={[location.pathname]}
            items={sidebarItems}
          />
        </MobileDrawer>

        <Layout>
          <StyledHeader>
            <HeaderLeft>
              <MobileMenuButton
                type="text"
                icon={<MenuOutlined />}
                onClick={toggleMobileDrawer}
              />
              <DesktopMenuButton
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
              <DateDisplay type="secondary" style={{ marginLeft: 16 }}>
                {formatDate(currentTime)}
              </DateDisplay>
            </HeaderLeft>

            <HeaderRight>
              <Dropdown
                menu={{ items: userMenu }}
                placement="bottomRight"
                arrow
              >
                <UserInfo>
                  <UserAvatar icon={<UserOutlined />} />
                  <Space direction="vertical" size={0} style={{ lineHeight: 1.2 }}>
                    <UserName strong>{user?.email?.split('@')[0]}</UserName>
                    <RoleTag>{isAdmin ? t('home.adminConsole') : t('home.userPlatform')}</RoleTag>
                  </Space>
                </UserInfo>
              </Dropdown>
            </HeaderRight>
          </StyledHeader>

          <StyledContent>
            <Outlet />
          </StyledContent>
        </Layout>
      </StyledLayout>
    </ConfigProvider>
  );
};

export default MainLayout; 