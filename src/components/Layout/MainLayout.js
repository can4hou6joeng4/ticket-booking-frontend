import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, message, Drawer } from 'antd';
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
  MenuOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  background: ${props => props.theme === 'dark' ? '#141414' : '#f5f5f5'};

  .ant-layout {
    background: ${props => props.theme === 'dark' ? '#141414' : '#f5f5f5'};
  }
`;

const StyledSider = styled(Sider)`
  background: ${props => props.theme === 'dark' ? '#1f1f1f' : '#fff'} !important;
  
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }
  
  .ant-menu {
    background: ${props => props.theme === 'dark' ? '#1f1f1f' : '#fff'};
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
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#303030' : '#f0f0f0'};
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
  background: ${props => props.theme === 'dark' ? '#1f1f1f' : '#fff'};
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
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
  margin: 12px 24px;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    margin: 8px 16px;
    padding: 12px 16px;
  }
  
  @media (max-width: 576px) {
    margin: 6px 10px;
    padding: 8px 10px;
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

const ThemeButton = styled(Button)`
  margin-right: 8px;
  &:hover {
    color: #1677ff;
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
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user && user.role === 'admin';

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // 即使退出失败，也导航到登录页面
      navigate('/login');
    }
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

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('个人中心'),
      onClick: () => navigate('/profile')
    },
    {
      key: 'language',
      icon: <TranslationOutlined />,
      label: t('语言'),
      children: [
        { key: 'zh-CN', label: '简体中文' },
        { key: 'en-US', label: 'English' },
        { key: 'zh-TW', label: '繁體中文' }
      ]
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('退出登录'),
      onClick: handleLogout
    }
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
      <StyledLayout theme={theme}>
        <StyledSider
          theme={theme}
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={256}
        >
          <LogoContainer theme={theme}>
            <Logo collapsed={collapsed}>
              {!collapsed ? t('home.title') : 'TMS'}
            </Logo>
          </LogoContainer>
          <Menu
            theme={theme}
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
            theme={theme}
            mode="inline"
            defaultSelectedKeys={['/']}
            selectedKeys={[location.pathname]}
            items={sidebarItems}
          />
        </MobileDrawer>

        <Layout>
          <StyledHeader theme={theme}>
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
            </HeaderLeft>

            <HeaderRight>
              <ThemeButton
                type="text"
                icon={theme === 'dark' ? <BulbFilled /> : <BulbOutlined />}
                onClick={toggleTheme}
              />
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: ({ key }) => {
                    if (key === 'language') return;
                    if (key.startsWith('zh-') || key.startsWith('en-')) {
                      handleLanguageChange(key);
                    }
                  }
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <UserInfo>
                  <UserAvatar icon={<UserOutlined />} />
                  <UserName>{user?.email?.split('@')[0] || t('未登录')}</UserName>
                  {isAdmin && <RoleTag>{t('管理员')}</RoleTag>}
                </UserInfo>
              </Dropdown>
            </HeaderRight>
          </StyledHeader>

          <StyledContent theme={theme}>
            <Outlet />
          </StyledContent>
        </Layout>
      </StyledLayout>
    </ConfigProvider>
  );
};

export default MainLayout; 