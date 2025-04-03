import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const Login = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 如果用户已登录，重定向到首页
        if (user) {
            console.log('用户已登录，自动跳转到首页', user);
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async (values) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Login - 开始登录过程，提交的数据:', values);

            const result = await login(values);
            console.log('Login - 登录结果:', result);

            // 登录成功，直接导航到首页
            message.success('登录成功！');
            navigate('/');
        } catch (error) {
            console.error('Login - 登录过程中发生异常:', error);
            setError(error.friendlyMessage || error.message || '登录失败，请稍后重试');
            message.error('登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
        }}>
            <Card style={{ width: 400, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ marginBottom: 8 }}>票务系统登录</Title>
                    <p style={{ color: '#8c8c8c' }}>管理您的活动和票券</p>
                </div>

                {error && (
                    <Alert
                        message="登录失败"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={handleLogin}
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: '请输入您的邮箱' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="邮箱" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入您的密码' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            登录
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <span>没有账号？</span>
                        <Link to="/register">立即注册</Link>
                    </div>
                </Form>

                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#8c8c8c' }}>
                    用户登录信息：<br />
                    普通用户 - user@example.com / password<br />
                    管理员 - admin@example.com / password
                </div>
            </Card>
        </div>
    );
};

export default Login; 