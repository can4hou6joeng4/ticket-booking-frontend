import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Spin, message, Descriptions, Statistic, Row, Col, Modal, Divider } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ArrowLeftOutlined, TagOutlined } from '@ant-design/icons';
import { eventAPI, ticketAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const EventDetail = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buyingTicket, setBuyingTicket] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

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

            const response = await ticketAPI.buyTicket(ticketData);
            if (response.data.status === 'success') {
                message.success('购票成功！');
                setConfirmModalVisible(false);
                navigate('/tickets');
            }
        } catch (error) {
            message.error(error.response?.data?.message || '购票失败，请稍后再试');
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
                                <Descriptions.Item label="活动时间">
                                    <CalendarOutlined style={{ marginRight: 8 }} />
                                    {dayjs(event.date).format('YYYY-MM-DD HH:mm')}
                                </Descriptions.Item>
                                <Descriptions.Item label="活动地点">
                                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                                    {event.location}
                                </Descriptions.Item>
                            </Descriptions>

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
                title="确认购票"
                open={confirmModalVisible}
                onCancel={() => setConfirmModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setConfirmModalVisible(false)}>
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={buyingTicket}
                        onClick={handleBuyTicket}
                    >
                        确认购票
                    </Button>,
                ]}
            >
                <p>您确定要购买 <Text strong>{event.name}</Text> 的门票吗？</p>
                <p>活动时间: {dayjs(event.date).format('YYYY-MM-DD HH:mm')}</p>
                <p>活动地点: {event.location}</p>
            </Modal>
        </div>
    );
};

export default EventDetail; 