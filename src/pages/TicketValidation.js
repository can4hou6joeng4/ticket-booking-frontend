import React, { useState } from 'react';
import { Card, Button, Typography, Result, Input, Form, Spin, message, Descriptions, Tag } from 'antd';
import { QrcodeOutlined, CheckCircleOutlined, UserOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { ticketAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TicketValidation = () => {
    const [loading, setLoading] = useState(false);
    const [validationSuccess, setValidationSuccess] = useState(false);
    const [ticketInfo, setTicketInfo] = useState(null);
    const [form] = Form.useForm();

    const handleManualValidation = async (values) => {
        try {
            setLoading(true);
            const validationData = {
                ticketId: parseInt(values.ticketId),
                ownerId: parseInt(values.ownerId),
            };

            const response = await ticketAPI.validateTicket(validationData);
            console.log('验票响应:', response);

            if (response.data.status === 'success') {
                setTicketInfo(response.data.data);
                setValidationSuccess(true);
                message.success('票券验证成功！');
            } else {
                message.error(response.data.message || '票券验证失败');
            }
        } catch (error) {
            console.error('验票失败:', error);
            // 如果票券已使用，应该显示适当的错误信息
            if (error.response?.data?.message?.includes('已入场') ||
                error.response?.data?.message?.includes('already') ||
                error.response?.data?.message?.includes('used') ||
                error.response?.data?.message?.includes('entered')) {
                message.error('此票券已被使用，不能重复验证');
            } else {
                message.error(error.response?.data?.message || '票券验证失败，请检查票券ID和用户ID是否正确');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetValidation = () => {
        setValidationSuccess(false);
        setTicketInfo(null);
        form.resetFields();
    };

    const renderSuccessDetails = () => {
        if (!ticketInfo || !ticketInfo.event) {
            return null;
        }

        return (
            <Descriptions bordered column={1} style={{ marginTop: 24 }}>
                <Descriptions.Item label="票券ID">{ticketInfo.id}</Descriptions.Item>
                <Descriptions.Item label="用户ID">{ticketInfo.userId}</Descriptions.Item>
                <Descriptions.Item label="活动名称">{ticketInfo.event.name}</Descriptions.Item>
                <Descriptions.Item label="活动时间">
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    {dayjs(ticketInfo.event.date).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="活动地点">
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    {ticketInfo.event.location}
                </Descriptions.Item>
                <Descriptions.Item label="票券状态">
                    <Tag color="green" icon={<CheckCircleOutlined />}>已验证入场</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="验证时间">
                    {dayjs().format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
            </Descriptions>
        );
    };

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>票券验证</Title>

            {validationSuccess ? (
                <Result
                    status="success"
                    title="票券验证成功！"
                    subTitle={`票号: #${ticketInfo.id} | 活动: ${ticketInfo.event.name}`}
                    extra={[
                        <Button type="primary" key="continue" onClick={resetValidation}>
                            继续验票
                        </Button>
                    ]}
                >
                    {renderSuccessDetails()}
                </Result>
            ) : (
                <Card>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <QrcodeOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                        <Title level={3}>手动验票</Title>
                        <Text type="secondary">请输入票券ID和用户ID进行验证</Text>
                    </div>

                    <Spin spinning={loading}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleManualValidation}
                        >
                            <Form.Item
                                name="ticketId"
                                label="票券ID"
                                rules={[
                                    { required: true, message: '请输入票券ID' },
                                    { pattern: /^\d+$/, message: '请输入有效的票券ID（数字）' }
                                ]}
                            >
                                <Input prefix={<QrcodeOutlined />} placeholder="请输入票券ID" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="ownerId"
                                label="用户ID"
                                rules={[
                                    { required: true, message: '请输入用户ID' },
                                    { pattern: /^\d+$/, message: '请输入有效的用户ID（数字）' }
                                ]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="请输入用户ID" size="large" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<CheckCircleOutlined />}
                                    size="large"
                                    block
                                    loading={loading}
                                >
                                    验证票券
                                </Button>
                            </Form.Item>
                        </Form>
                    </Spin>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Text type="secondary">
                            注意：请确保输入的票券ID和用户ID正确无误
                        </Text>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default TicketValidation; 