import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Spin, message, Descriptions, Statistic, Row, Col, Modal, Divider } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ArrowLeftOutlined, TagOutlined } from '@ant-design/icons';
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
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
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
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/events')}>
                返回活动列表
            </Button>

            <div style={{ marginTop: 24 }}>
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Card>
                            <div
                                style={{
                                    height: 180,
                                    background: 'linear-gradient(45deg, #1890ff, #8f41e9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: 36,
                                    fontWeight: 'bold',
                                    marginBottom: 24,
                                    borderRadius: 8
                                }}
                            >
                                {event.name}
                            </div>

                            <Descriptions bordered column={1}>
                                <Descriptions.Item label={t('events.eventTimeRange')}>
                                    <CalendarOutlined style={{ marginRight: 8 }} />
                                    {dayjs(event.date).format('YYYY-MM-DD HH:mm')}
                                    {event.endDate && (
                                        <div style={{ marginLeft: 24 }}>
                                            ~ {dayjs(event.endDate).format('YYYY-MM-DD HH:mm')}
                                        </div>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label={t('events.eventLocation')}>
                                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                                    {event.location}
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

                            <div style={{ marginTop: 24, textAlign: 'center' }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<TagOutlined />}
                                    onClick={() => setConfirmModalVisible(true)}
                                >
                                    立即购票
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal
                title={t('events.confirmPurchase', '确认购票')}
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
                    >
                        {t('events.confirmPurchase', '确认购票')}
                    </Button>,
                ]}
            >
                <p>{t('events.confirmPurchaseText', '您确定要购买')} <Text strong>{event.name}</Text> {t('events.confirmPurchaseTicket', '的门票吗？')}</p>
                <p>{t('events.eventTime')}: {dayjs(event.date).format('YYYY-MM-DD HH:mm')}
                    {event.endDate && (
                        <span> ~ {dayjs(event.endDate).format('YYYY-MM-DD HH:mm')}</span>
                    )}
                </p>
                <p>{t('events.eventLocation')}: {event.location}</p>
            </Modal>
        </div>
    );
};

export default EventDetail; 