import React from 'react';
import { Layout, Menu, Dropdown, Space } from 'antd';
import { UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import ThemeSwitch from '../common/ThemeSwitch';
import styled from '@emotion/styled';
import { useTheme } from '../../context/ThemeContext';

const { Header: AntHeader } = Layout;

const StyledHeader = styled(AntHeader)`
  background: ${props => props.theme.headerBackground};
  border-bottom: 1px solid ${props => props.theme.borderColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Header = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme } = useTheme();

    const languageMenu = {
        items: [
            {
                key: 'zh-CN',
                label: '简体中文',
            },
            {
                key: 'zh-TW',
                label: '繁體中文',
            },
            {
                key: 'en-US',
                label: 'English',
            },
        ],
        onClick: ({ key }) => {
            i18n.changeLanguage(key);
        },
    };

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: t('layout.profile'),
            },
            {
                key: 'logout',
                label: t('layout.logout'),
            },
        ],
        onClick: ({ key }) => {
            if (key === 'logout') {
                logout();
                navigate('/login');
            } else if (key === 'profile') {
                navigate('/profile');
            }
        },
    };

    return (
        <StyledHeader theme={theme}>
            <div className="logo" />
            <HeaderRight>
                <ThemeSwitch />
                <Dropdown menu={languageMenu} placement="bottomRight">
                    <Space>
                        <GlobalOutlined />
                        {t('layout.language')}
                    </Space>
                </Dropdown>
                <Dropdown menu={userMenu} placement="bottomRight">
                    <Space>
                        <UserOutlined />
                        {user?.email}
                    </Space>
                </Dropdown>
            </HeaderRight>
        </StyledHeader>
    );
};

export default Header; 