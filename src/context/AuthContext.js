import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { message } from 'antd';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 页面加载时检查本地存储中的用户信息
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('解析存储的用户数据失败', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // 登录方法
    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await authAPI.login(credentials);
            console.log('AuthContext login 响应:', response);

            if (response.status === 'success' && response.data) {
                const { user } = response.data;
                setUser(user);
                console.log('用户状态已设置:', user);
            }

            return response;
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // 注册方法
    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await authAPI.register(userData);

            if (response.status === 'success' && response.data.user) {
                setUser(response.data.user);
            }

            return response;
        } catch (error) {
            console.error('注册失败:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // 登出方法
    const logout = () => {
        authAPI.logout(); // 这会清除本地存储
        setUser(null);
        message.success('已退出登录');
    };

    const contextValue = {
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'manager'
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 自定义钩子以便于使用 AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
}; 