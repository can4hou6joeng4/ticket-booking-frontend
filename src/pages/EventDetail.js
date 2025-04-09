import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Spin, message, Descriptions, Statistic, Row, Col, Modal, Divider } from 'antd';
import { ArrowLeftOutlined, TagOutlined, FieldTimeOutlined, ClockCircleOutlined, EnvironmentFilled, CalendarFilled } from '@ant-design/icons';
import { eventAPI, ticketAPI } from '../services/api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const EventDetail = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buyingTicket, setBuyingTicket] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const { t } = useTranslation();
    const [isManager, setIsManager] = useState(false);

    useEffect(() => {
        // 从本地存储获取用户信息并判断角色
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setIsManager(user.role === 'manager');
            } catch (error) {
                console.error('解析用户信息失败:', error);
                setIsManager(false);
            }
        }
    }, []);

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                setLoading(true);
                const data = await eventAPI.getEvent(eventId);
                setEvent(data.data);
            } catch (error) {
                console.error('获取活动详情失败:', error);
                message.error('获取活动详情失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetail();
    }, [eventId]);

    const handleBuyTicket = async () => {
        try {
            setBuyingTicket(true);
            const ticketData = {
                eventId: parseInt(eventId),
            };

            console.log('发送购票请求:', ticketData);
            const response = await ticketAPI.buyTicket(ticketData);
            console.log('购票响应:', response);

            // 检查响应是否成功且包含票券ID
            if (response && response.status === 'success') {
                let ticketId;

                // 尝试从不同位置获取票券ID
                if (response.data && response.data.id) {
                    ticketId = response.data.id;
                } else if (response.id) {
                    ticketId = response.id;
                }

                message.success(t('events.purchaseSuccess', '购票成功！'));
                setConfirmModalVisible(false);

                // 如果有票券ID，跳转到票券详情页
                if (ticketId) {
                    console.log('跳转到票券详情页:', ticketId);
                    navigate(`/tickets/${ticketId}`);
                } else {
                    // 如果没有获取到票券ID，跳转到票券列表页
                    console.log('未获取到票券ID，跳转到票券列表页');
                    navigate('/tickets');
                }
            } else {
                const errorMsg = response?.message || t('events.purchaseError', '购票失败，请稍后再试');
                message.error(errorMsg);
            }
        } catch (error) {
            console.error('购票过程中发生异常:', error);
            message.error(error.response?.data?.message || t('events.purchaseError', '购票失败，请稍后再试'));
        } finally {
            setBuyingTicket(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!event) {
        return (
            <div>
                <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/events')}>
                    返回活动列表
                </Button>
                <div style={{ textAlign: 'center', marginTop: 50 }}>
                    <Title level={4}>活动不存在或已被删除</Title>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 16 }}
                gutter={[16, 16]}
            >
                <Col>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/events')}
                    >
                        返回活动列表
                    </Button>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        size="middle"
                        onClick={() => setConfirmModalVisible(true)}
                        style={{
                            background: 'linear-gradient(45deg, #1890ff, #722ed1)',
                            borderColor: '#1890ff',
                            boxShadow: '0 2px 6px rgba(24, 144, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        }}
                    >
                        立即购票
                    </Button>
                </Col>
            </Row>

            <div style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card bodyStyle={{ padding: '16px' }}>
                            <div
                                style={{
                                    height: 150,
                                    background: 'linear-gradient(45deg, #1890ff, #8f41e9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                    marginBottom: 16,
                                    borderRadius: 8,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        fontSize: 40,
                                        opacity: 0.5,
                                        color: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <CalendarFilled />
                                </div>
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 16,
                                        left: 16,
                                        fontSize: 24,
                                        opacity: 0.3,
                                        color: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <EnvironmentFilled />
                                </div>
                                {event.name}
                            </div>

                            <Descriptions bordered column={1}>
                                <Descriptions.Item
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarFilled style={{ color: '#1890ff', marginRight: 8 }} />
                                            <span>{t('events.eventTimeRange')}</span>
                                        </div>
                                    }
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                                        <FieldTimeOutlined style={{ color: '#1890ff', fontSize: 18, marginRight: 12 }} />
                                        <span style={{ fontWeight: 'bold', marginRight: 8 }}>{t('events.eventStartTime')}:</span>
                                        {dayjs(event.date).format('YYYY-MM-DD HH:mm')}
                                    </div>
                                    {event.endDate && (
                                        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                                            <ClockCircleOutlined style={{ color: '#52c41a', fontSize: 18, marginRight: 12 }} />
                                            <span style={{ fontWeight: 'bold', marginRight: 8 }}>{t('events.eventEndTime')}:</span>
                                            {dayjs(event.endDate).format('YYYY-MM-DD HH:mm')}
                                        </div>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <EnvironmentFilled style={{ color: '#ff4d4f', marginRight: 8 }} />
                                            <span>{t('events.eventLocation')}</span>
                                        </div>
                                    }
                                >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <EnvironmentFilled style={{ color: '#ff4d4f', fontSize: 18, marginRight: 12 }} />
                                        <span style={{ fontWeight: 'bold', marginRight: 8 }}>{t('events.eventLocation')}:</span>
                                        {event.location}
                                    </div>
                                </Descriptions.Item>
                            </Descriptions>

                            {isManager && (
                                <>
                                    <Divider />
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <Statistic
                                                title="已售出票数"
                                                value={event.totalTicketsPurchased}
                                                prefix={<TagOutlined />}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic
                                                title="已入场人数"
                                                value={event.totalTicketsEntered}
                                                prefix={<TagOutlined />}
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TagOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                        <span>{t('events.confirmPurchase', '确认购票')}</span>
                    </div>
                }
                open={confirmModalVisible}
                onCancel={() => setConfirmModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setConfirmModalVisible(false)}>
                        {t('common.cancel', '取消')}
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={buyingTicket}
                        onClick={handleBuyTicket}
                        style={{
                            background: 'linear-gradient(45deg, #1890ff, #722ed1)',
                            borderColor: '#1890ff',
                            boxShadow: '0 2px 6px rgba(24, 144, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        }}
                    >
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TagOutlined style={{ fontSize: 14 }} />
                        </div>
                        {t('events.confirmPurchase', '确认购票')}
                    </Button>,
                ]}
            >
                <p>{t('events.confirmPurchaseText', '您确定要购买')} <Text strong style={{ color: '#1890ff' }}>{event.name}</Text> {t('events.confirmPurchaseTicket', '的门票吗？')}</p>

                <div style={{ margin: '16px 0', border: '1px dashed #d9d9d9', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ color: '#1890ff', fontSize: 18, marginRight: 12, display: 'flex', alignItems: 'center' }}>
                            <FieldTimeOutlined />
                        </div>
                        <span style={{ fontWeight: 'bold', marginRight: 8 }}>{t('events.eventStartTime')}:</span>
                        <span>{dayjs(event.date).format('YYYY-MM-DD HH:mm')}</span>
                    </div>

                    {event.endDate && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ color: '#52c41a', fontSize: 18, marginRight: 12, display: 'flex', alignItems: 'center' }}>
                                <ClockCircleOutlined />
                            </div>
                            <span style={{ fontWeight: 'bold', marginRight: 8 }}>{t('events.eventEndTime')}:</span>
                            <span>{dayjs(event.endDate).format('YYYY-MM-DD HH:mm')}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ color: '#ff4d4f', fontSize: 18, marginRight: 12, display: 'flex', alignItems: 'center' }}>
                            <EnvironmentFilled />
                        </div>
                        <span style={{ fontWeight: 'bold', marginRight: 8 }}>{t('events.eventLocation')}:</span>
                        <span>{event.location}</span>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EventDetail; 