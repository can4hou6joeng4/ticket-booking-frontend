import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Button, Typography, Spin, Empty, Tag, Modal, Form, Input, DatePicker, message, Popconfirm, Table, Tooltip, Space, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, ClockCircleOutlined, EnvironmentFilled, CalendarFilled, FieldTimeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const EventList = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    console.log('EventList - 用户信息:', user);
    console.log('EventList - 用户角色:', user?.role);
    console.log('EventList - 是否管理员:', isAdmin);

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('开始请求活动列表...');

            const response = await eventAPI.getEvents();
            console.log('获取活动列表响应:', response);

            if (response && response.status === 'success') {
                // 检查数据格式并提取活动列表
                const eventData = response.data || [];
                console.log('活动列表数据:', eventData);
                setEvents(eventData);
                if (eventData.length === 0) {
                    console.log('获取到的活动列表为空');
                }
            } else {
                const errorMsg = response?.message || t('common.error');
                setError(t('events.loadError') + ': ' + errorMsg);
                console.error('获取活动列表返回非成功状态:', response);
                message.error(t('events.loadError') + ': ' + errorMsg);
            }
        } catch (error) {
            console.error('获取活动列表发生异常:', error);
            setError(t('events.loadError') + ': ' + (error.response?.data?.message || error.message || '网络错误'));
            message.error(t('events.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        console.log('EventList组件挂载，开始获取活动数据');
        fetchEvents();
    }, [fetchEvents]);

    const handleCreateEvent = async (values) => {
        try {
            setSubmitting(true);
            const eventData = {
                ...values,
                date: values.date.toISOString(),
                endDate: values.endDate.toISOString(),
            };

            console.log('提交创建活动数据:', eventData);
            const response = await eventAPI.createEvent(eventData);
            console.log('创建活动响应:', response);

            // 检查响应是否成功
            if (response && (response.status === 'success' || (response.data && response.data.status === 'success'))) {
                message.success(t('events.createSuccess'));
                setCreateModalVisible(false);
                form.resetFields();
                fetchEvents();
            } else {
                const errorMsg = response?.message || response?.data?.message || t('events.createError');
                message.error(errorMsg);
            }
        } catch (error) {
            console.error('创建活动发生异常:', error);
            message.error(error.response?.data?.message || t('events.createError'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditEvent = async (values) => {
        try {
            setSubmitting(true);
            const eventData = {
                ...values,
                date: values.date.toISOString(),
                endDate: values.endDate.toISOString(),
            };

            console.log('提交编辑活动数据:', eventData);
            const response = await eventAPI.updateEvent(currentEvent.id, eventData);
            console.log('编辑活动响应:', response);

            // 检查响应是否成功
            if (response && (response.status === 'success' || (response.data && response.data.status === 'success'))) {
                message.success(t('events.updateSuccess'));
                setEditModalVisible(false);
                fetchEvents();
            } else {
                const errorMsg = response?.message || response?.data?.message || t('events.updateError');
                message.error(errorMsg);
            }
        } catch (error) {
            console.error('更新活动发生异常:', error);
            message.error(error.response?.data?.message || t('events.updateError'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            console.log('删除活动ID:', eventId);
            const response = await eventAPI.deleteEvent(eventId);
            console.log('删除活动响应:', response);

            // 检查响应是否成功
            if (response && (response.status === 'success' || (response.data && response.data.status === 'success'))) {
                message.success(t('events.deleteSuccess'));
                fetchEvents();
            } else {
                const errorMsg = response?.message || response?.data?.message || t('events.deleteError');
                message.error(errorMsg);
            }
        } catch (error) {
            console.error('删除活动发生异常:', error);
            message.error(error.response?.data?.message || t('events.deleteError'));
        }
    };

    const showEditModal = (event) => {
        setCurrentEvent(event);
        form.setFieldsValue({
            name: event.name,
            location: event.location,
            date: dayjs(event.date),
            endDate: event.endDate ? dayjs(event.endDate) : null,
        });
        setEditModalVisible(true);
    };

    const handleViewEvent = (eventId) => {
        navigate(`/events/${eventId}`);
    };

    // 管理员视图 - 表格列定义
    const columns = [
        {
            title: t('events.eventName'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: t('events.eventTimeRange'),
            key: 'timeRange',
            render: (_, record) => (
                <>
                    <div>{dayjs(record.date).format('YYYY-MM-DD HH:mm')}</div>
                    {record.endDate && (
                        <div>~ {dayjs(record.endDate).format('YYYY-MM-DD HH:mm')}</div>
                    )}
                </>
            ),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: t('events.eventLocation'),
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: t('events.ticketStatus'),
            key: 'tickets',
            render: (_, record) => (
                <Space>
                    <Tag color="blue">{t('events.ticketsSold')}: {record.totalTicketsPurchased || 0}</Tag>
                    <Tag color="green">{t('events.ticketsUsed')}: {record.totalTicketsEntered || 0}</Tag>
                </Space>
            ),
        },
        {
            title: t('events.actions'),
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t('events.viewDetails')}>
                        <Button
                            icon={<EyeOutlined />}
                            type="link"
                            onClick={() => handleViewEvent(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title={t('events.editEvent')}>
                        <Button
                            icon={<EditOutlined />}
                            type="link"
                            onClick={() => showEditModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title={t('events.deleteEvent')}>
                        <Popconfirm
                            title={t('events.deleteConfirm')}
                            description={t('events.deleteConfirmDesc')}
                            onConfirm={() => handleDeleteEvent(record.id)}
                            okText={t('common.confirm')}
                            cancelText={t('common.cancel')}
                        >
                            <Button icon={<DeleteOutlined />} type="link" danger />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // 渲染管理员视图
    const renderAdminView = () => (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2} style={{ fontSize: '24px', marginBottom: 0 }}>{t('events.title')}</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        form.resetFields();
                        setCreateModalVisible(true);
                    }}
                >
                    {t('events.createEvent')}
                </Button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
                    <Spin size="large" />
                </div>
            ) : events.length === 0 ? (
                <Empty description={t('events.emptyText')} />
            ) : (
                <Table
                    dataSource={events}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                />
            )}
        </>
    );

    // 渲染用户视图
    const renderUserView = () => (
        <>
            <div style={{ marginBottom: 16 }}>
                <Title level={2} style={{ fontSize: '24px', marginBottom: 0 }}>{t('events.title')}</Title>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
                    <Spin size="large" />
                </div>
            ) : events.length === 0 ? (
                <Empty description={t('events.emptyText')} />
            ) : (
                <Row gutter={[16, 16]}>
                    {events.map((event) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                            <Card
                                hoverable
                                style={{ height: '100%' }}
                                bodyStyle={{ padding: '16px 12px' }}
                                onClick={() => handleViewEvent(event.id)}
                                cover={
                                    <div
                                        style={{
                                            height: 100,
                                            background: 'linear-gradient(45deg, #1890ff, #8f41e9)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: 22,
                                            fontWeight: 'bold',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                fontSize: 32,
                                                opacity: 0.7
                                            }}
                                        >
                                            <CalendarFilled />
                                        </div>
                                        {event.name}
                                    </div>
                                }
                                actions={[
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewEvent(event.id);
                                        }}
                                    >
                                        {t('events.viewDetails')}
                                    </Button>
                                ]}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                        <div style={{ color: '#1890ff', fontSize: 18, marginTop: 2 }}>
                                            <FieldTimeOutlined />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{t('events.eventStartTime')}</div>
                                            <Text>{dayjs(event.date).format('YYYY-MM-DD HH:mm')}</Text>
                                        </div>
                                    </div>

                                    {event.endDate && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                            <div style={{ color: '#52c41a', fontSize: 18, marginTop: 2 }}>
                                                <ClockCircleOutlined />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{t('events.eventEndTime')}</div>
                                                <Text>{dayjs(event.endDate).format('YYYY-MM-DD HH:mm')}</Text>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                        <div style={{ color: '#ff4d4f', fontSize: 18, marginTop: 2 }}>
                                            <EnvironmentFilled />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{t('events.eventLocation')}</div>
                                            <Text>{event.location}</Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </>
    );

    return (
        <div>
            {console.log('EventList渲染 - 用户角色:', user?.role, '是否管理员:', isAdmin)}

            {error && (
                <Alert
                    message={t('events.loadError')}
                    description={
                        <div>
                            {error}
                            <Button
                                type="link"
                                icon={<ReloadOutlined />}
                                onClick={fetchEvents}
                                style={{ marginLeft: 8 }}
                            >
                                {t('events.refreshEvents')}
                            </Button>
                        </div>
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 12 }}
                />
            )}

            {isAdmin ? renderAdminView() : renderUserView()}

            {/* 创建活动表单 */}
            <Modal
                title={t('events.createEvent')}
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateEvent}
                >
                    <Form.Item
                        name="name"
                        label={t('events.eventName')}
                        rules={[{ required: true, message: t('events.eventName') }]}
                    >
                        <Input placeholder={t('events.eventName')} />
                    </Form.Item>
                    <Form.Item
                        name="location"
                        label={t('events.eventLocation')}
                        rules={[{ required: true, message: t('events.eventLocation') }]}
                    >
                        <Input placeholder={t('events.eventLocation')} />
                    </Form.Item>
                    <Form.Item
                        name="date"
                        label={t('events.eventTime')}
                        rules={[{ required: true, message: t('events.eventTime') }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="endDate"
                        label={t('events.eventEndTime')}
                        rules={[
                            {
                                required: true,
                                message: `${t('events.eventEndTime')}${t('common.required')}`
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || !getFieldValue('date')) {
                                        return Promise.resolve();
                                    }
                                    if (value.isBefore(getFieldValue('date'))) {
                                        return Promise.reject(new Error(t('events.endTimeError')));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                        dependencies={['date']}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            style={{ width: '100%' }}
                            placeholder={t('events.eventEndTime')}
                            disabledDate={(current) => {
                                const startDate = form.getFieldValue('date');
                                return startDate && current && current.isBefore(startDate, 'day');
                            }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={submitting} block>
                            {t('events.createEvent')}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 编辑活动表单 */}
            <Modal
                title={t('events.editEvent')}
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditEvent}
                >
                    <Form.Item
                        name="name"
                        label={t('events.eventName')}
                        rules={[{ required: true, message: t('events.eventName') }]}
                    >
                        <Input placeholder={t('events.eventName')} />
                    </Form.Item>
                    <Form.Item
                        name="location"
                        label={t('events.eventLocation')}
                        rules={[{ required: true, message: t('events.eventLocation') }]}
                    >
                        <Input placeholder={t('events.eventLocation')} />
                    </Form.Item>
                    <Form.Item
                        name="date"
                        label={t('events.eventTime')}
                        rules={[{ required: true, message: t('events.eventTime') }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="endDate"
                        label={t('events.eventEndTime')}
                        rules={[
                            {
                                required: true,
                                message: `${t('events.eventEndTime')}${t('common.required')}`
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || !getFieldValue('date')) {
                                        return Promise.resolve();
                                    }
                                    if (value.isBefore(getFieldValue('date'))) {
                                        return Promise.reject(new Error(t('events.endTimeError')));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                        dependencies={['date']}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            style={{ width: '100%' }}
                            placeholder={t('events.eventEndTime')}
                            disabledDate={(current) => {
                                const startDate = form.getFieldValue('date');
                                return startDate && current && current.isBefore(startDate, 'day');
                            }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={submitting} block>
                            {t('events.editEvent')}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EventList;