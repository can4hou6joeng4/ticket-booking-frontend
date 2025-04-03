import React from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import styled from '@emotion/styled';

const StyledSwitch = styled(Switch)`
  margin: 0 8px;
  &.ant-switch-checked {
    background-color: ${props => props.theme.primary};
  }
`;

const ThemeSwitch = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <StyledSwitch
            checked={isDarkMode}
            onChange={toggleTheme}
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
        />
    );
};

export default ThemeSwitch; 