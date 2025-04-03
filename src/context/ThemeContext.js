import React, { createContext, useState, useEffect, useContext } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    const toggleTheme = () => {
        setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {
                        colorPrimary: '#1677ff',
                        borderRadius: 6,
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 