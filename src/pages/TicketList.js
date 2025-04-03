import React, { useState, useEffect, useCallback } from 'react';
import { Card, List, Spin, Empty, Badge, Typography, Button, Tag, message, Alert, Tabs, Statistic, Row, Col } from 'antd';
import { TagOutlined, CalendarOutlined, EnvironmentOutlined, QrcodeOutlined, ClockCircleOutlined, IdcardOutlined, CheckCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../services/api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';

const { Title, Text } = Typography;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #1890ff11 0%, #1890ff05 100%);
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #1890ff22;

  h2 {
    margin-bottom: 0;
  }
`;

const TabContainer = styled.div`
  .ant-tabs-nav {
    margin-bottom: 24px;
  }
  
  .ant-tabs-tab {
    padding: 12px 24px;
    font-size: 16px;
  }

  .ant-tabs-tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const StyledCard = styled(Card)`
  transition: all 0.3s ease;
  border-radius: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
  }

  .ant-card-body {
    padding: 20px 24px;
  }
`;

const StyledEmpty = styled(Empty)`
  padding: 48px 0;
  
  .ant-empty-image {
    height: 160px;
  }

  .ant-empty-description {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

const TicketList = () => {
    const { t } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ticketAPI.getTickets();
            console.log('Tickets API response:', response);

            if (response && response.status === 'success') {
                const ticketData = response.data || [];
                console.log('票券数据:', ticketData);
                setTickets(ticketData);
            } else {
                const errorMsg = response?.message || t('common.error');
                console.error('获取票券失败:', errorMsg);
                setError(t('tickets.loadError') + ': ' + errorMsg);
                message.error(t('tickets.loadError'));
            }
        } catch (error) {
            console.error('获取票券列表失败', error);
            setError(t('tickets.loadError') + ': ' + (error.response?.data?.message || t('common.error')));
            message.error(t('tickets.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const getStatusBadge = (entered) => {
        if (entered) {
            return <Badge status="success" text={<Tag color="green">{t('tickets.status.used')}</Tag>} />;
        }
        return <Badge status="processing" text={<Tag color="blue">{t('tickets.status.unused')}</Tag>} />;
    };

    const handleViewTicket = (ticketId) => {
        navigate(`/tickets/${ticketId}`);
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('YYYY-MM-DD HH:mm');
    };

    const renderStatistics = () => {
        const totalTickets = tickets.length;
        const usedTickets = tickets.filter(ticket => ticket.entered).length;
        const unusedTickets = totalTickets - usedTickets;

        return (
            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Statistic
                        title={t('tickets.stats.total')}
                        value={totalTickets}
                        prefix={<IdcardOutlined />}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={t('tickets.stats.unused')}
                        value={unusedTickets}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<TagOutlined />}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={t('tickets.stats.used')}
                        value={usedTickets}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<CheckCircleOutlined />}
                    />
                </Col>
            </Row>
        );
    };

    const renderTicketList = (ticketList) => {
        if (ticketList.length === 0) {
            return (
                <StyledEmpty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div>
                            <p>{t('tickets.empty')}</p>
                            <Button type="primary" size="large" icon={<ShoppingOutlined />} onClick={() => navigate('/events')}>
                                {t('tickets.browseEvents')}
                            </Button>
                        </div>
                    }
                />
            );
        }

        return (
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 3,
                    xl: 3,
                    xxl: 4,
                }}
                dataSource={ticketList}
                renderItem={(ticket) => (
                    <List.Item>
                        <StyledCard
                            hoverable
                            onClick={() => handleViewTicket(ticket.id)}
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong style={{ fontSize: '16px' }}>{ticket.event?.name || t('tickets.unknownEvent')}</Text>
                                    {getStatusBadge(ticket.entered)}
                                </div>
                            }
                            actions={[
                                <Button
                                    type="primary"
                                    icon={<QrcodeOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewTicket(ticket.id);
                                    }}
                                    disabled={ticket.entered}
                                    style={{ width: '90%' }}
                                >
                                    {ticket.entered ? t('tickets.ticketUsed') : t('tickets.viewTicketCode')}
                                </Button>
                            ]}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <TagOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                    <Text type="secondary">{t('tickets.ticketId')}:</Text>
                                    <Text strong copyable style={{ marginLeft: 8 }}>{ticket.id}</Text>
                                </div>
                                <div>
                                    <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                    <Text type="secondary">{t('tickets.eventTime')}:</Text>
                                    <Text strong style={{ marginLeft: 8 }}>{ticket.event?.date ? formatDate(ticket.event.date) : t('tickets.unknownTime')}</Text>
                                </div>
                                <div>
                                    <EnvironmentOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                                    <Text type="secondary">{t('tickets.eventLocation')}:</Text>
                                    <Text strong style={{ marginLeft: 8 }}>{ticket.event?.location || t('tickets.unknownLocation')}</Text>
                                </div>
                                <div>
                                    <ClockCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                                    <Text type="secondary">{t('tickets.purchaseTime')}:</Text>
                                    <Text strong style={{ marginLeft: 8 }}>{ticket.createdAt ? formatDate(ticket.createdAt) : t('tickets.unknown')}</Text>
                                </div>
                                {ticket.entered && ticket.updatedAt && (
                                    <div>
                                        <ClockCircleOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                                        <Text type="secondary">{t('tickets.usedTime')}:</Text>
                                        <Text strong style={{ marginLeft: 8 }}>{formatDate(ticket.updatedAt)}</Text>
                                    </div>
                                )}
                            </div>
                        </StyledCard>
                    </List.Item>
                )}
            />
        );
    };

    const items = [
        {
            key: 'all',
            label: (
                <span>
                    <IdcardOutlined />
                    {t('tickets.tabs.all')}
                    <Tag style={{ marginLeft: 8 }}>{tickets.length}</Tag>
                </span>
            ),
            children: loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {renderStatistics()}
                    {renderTicketList(tickets)}
                </>
            ),
        },
        {
            key: 'unused',
            label: (
                <span>
                    <TagOutlined />
                    {t('tickets.tabs.unused')}
                    <Tag color="blue" style={{ marginLeft: 8 }}>{tickets.filter(ticket => !ticket.entered).length}</Tag>
                </span>
            ),
            children: loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                    <Spin size="large" />
                </div>
            ) : (
                renderTicketList(tickets.filter(ticket => !ticket.entered))
            ),
        },
        {
            key: 'used',
            label: (
                <span>
                    <CheckCircleOutlined />
                    {t('tickets.tabs.used')}
                    <Tag color="green" style={{ marginLeft: 8 }}>{tickets.filter(ticket => ticket.entered).length}</Tag>
                </span>
            ),
            children: loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                    <Spin size="large" />
                </div>
            ) : (
                renderTicketList(tickets.filter(ticket => ticket.entered))
            ),
        },
    ];

    return (
        <div>
            <PageHeader>
                <Title level={2}>{t('tickets.title')}</Title>
            </PageHeader>

            {error && (
                <Alert
                    message={t('tickets.loadError')}
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            <TabContainer>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    size="large"
                />
            </TabContainer>
        </div>
    );
};

export default TicketList; 