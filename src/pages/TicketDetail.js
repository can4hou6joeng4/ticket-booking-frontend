import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Spin, message, Tag, Image, Descriptions, Alert } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ArrowLeftOutlined, QrcodeOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { ticketAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TicketDetail = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qrCode, setQrCode] = useState(null);

    useEffect(() => {
        const fetchTicketDetail = async () => {
            try {
                setLoading(true);
                const response = await ticketAPI.getTicket(ticketId);
                console.log('票券详情数据:', response);

                if (response && response.status === 'success' && response.data) {
                    // 确保 ticket 和 ticket.event 都存在
                    const ticketData = response.data;
                    if (!ticketData.event) {
                        console.error('票券数据中缺少事件信息:', ticketData);
                        ticketData.event = {
                            name: '未知活动',
                            date: new Date().toISOString(),
                            location: '未知地点'
                        };
                    }
                    setTicket(ticketData);

                    // 设置二维码（如果存在）
                    if (ticketData.qrcode) {
                        setQrCode(`data:image/png;base64,${ticketData.qrcode}`);
                    }
                } else {
                    throw new Error('获取票券详情失败: ' + (response?.message || '未知错误'));
                }
            } catch (error) {
                console.error('获取票券详情失败:', error);
                message.error('获取票券详情失败，请稍后重试');
                navigate('/tickets');
            } finally {
                setLoading(false);
            }
        };

        fetchTicketDetail();
    }, [ticketId, navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div>
                <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/tickets')}>
                    返回票券列表
                </Button>
                <div style={{ textAlign: 'center', marginTop: 50 }}>
                    <Title level={4}>票券不存在或已被删除</Title>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/tickets')}>
                返回票券列表
            </Button>

            <Card
                style={{ marginTop: 24, borderRadius: 8 }}
                title={
                    <div style={{
                        fontSize: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span>电子票 #{ticket.id}</span>
                        {ticket.entered ?
                            <Tag color="green" icon={<CheckCircleOutlined />}>已入场</Tag> :
                            <Tag color="blue" icon={<ClockCircleOutlined />}>未使用</Tag>
                        }
                    </div>
                }
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div
                        style={{
                            padding: '16px 0',
                            backgroundColor: 'rgba(24, 144, 255, 0.1)',
                            borderRadius: 8,
                            marginBottom: 24
                        }}
                    >
                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                            {ticket.event?.name || '未知活动'}
                        </Title>
                    </div>

                    {ticket.entered ? (
                        <Alert
                            message="票券已使用"
                            description="此票券已被验证入场，无法再次使用"
                            type="success"
                            showIcon
                            icon={<CheckCircleOutlined />}
                            style={{ marginBottom: 24 }}
                        />
                    ) : (
                        <div style={{ maxWidth: 260, margin: '0 auto', marginBottom: 24 }}>
                            {qrCode && (
                                <Image
                                    src={qrCode}
                                    alt="电子票二维码"
                                    preview={false}
                                    style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}
                                />
                            )}
                            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                <QrcodeOutlined /> 入场时请出示此二维码
                            </Text>
                        </div>
                    )}

                    <Descriptions bordered column={1} style={{ marginTop: 32 }}>
                        <Descriptions.Item label="活动名称">{ticket.event?.name || '未知活动'}</Descriptions.Item>
                        <Descriptions.Item label="活动时间">
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            {ticket.event?.date ? dayjs(ticket.event.date).format('YYYY-MM-DD HH:mm') : '未知时间'}
                        </Descriptions.Item>
                        <Descriptions.Item label="活动地点">
                            <EnvironmentOutlined style={{ marginRight: 8 }} />
                            {ticket.event?.location || '未知地点'}
                        </Descriptions.Item>
                        <Descriptions.Item label="票券状态">
                            {ticket.entered ? (
                                <Tag color="green" icon={<CheckCircleOutlined />}>已入场</Tag>
                            ) : (
                                <Tag color="blue" icon={<ClockCircleOutlined />}>未使用</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="购票时间">
                            {dayjs(ticket.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Descriptions.Item>
                        {ticket.entered && (
                            <Descriptions.Item label="入场时间">
                                {dayjs(ticket.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </div>
            </Card>
        </div>
    );
};

export default TicketDetail; 