import React, { useState, useEffect, useCallback } from 'react';
import { Card, List, Spin, Empty, Badge, Typography, Button, Tag, message, Alert, Tabs } from 'antd';
import { TagOutlined, CalendarOutlined, EnvironmentOutlined, QrcodeOutlined, ClockCircleOutlined, CheckCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../services/api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';

const { Text } = Typography;

const TabContainer = styled.div`
  .ant-tabs-nav {
    margin-bottom: 16px;
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
    padding: 16px 24px;
    min-height: 48px;
  }

  .ant-card-body {
    padding: 20px 24px;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 20px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .anticon {
    font-size: 16px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
  }
`;

const StyledEmpty = styled(Empty)`
  padding: 32px 0;
  
  .ant-empty-image {
    height: 120px;
  }

  .ant-empty-description {
    font-size: 14px;
    margin-bottom: 16px;
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

            if (response && response.status === 'success') {
                setTickets(response.data || []);
            } else {
                const errorMsg = response?.message || t('common.error');
                setError(t('tickets.loadError') + ': ' + errorMsg);
                message.error(t('tickets.loadError'));
            }
        } catch (error) {
            setError(t('tickets.loadError') + ': ' + (error.response?.data?.message || t('common.error')));
            message.error(t('tickets.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        fetchTickets(); // 切换标签时重新获取数据
    };

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

    const renderTicketList = (ticketList) => {
        if (ticketList.length === 0) {
            return (
                <StyledEmpty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div>
                            <p>{t('tickets.empty')}</p>
                            <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/events')}>
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
                    sm: 2,
                    md: 3,
                    lg: 3,
                    xl: 4,
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
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                                    <ClockCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
                                    <Text type="secondary">{t('tickets.purchaseTime')}:</Text>
                                    <Text strong style={{ marginLeft: 8 }}>{formatDate(ticket.createdAt)}</Text>
                                </div>
                                {ticket.entered && ticket.updatedAt && (
                                    <div>
                                        <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                        <Text type="secondary">{t('tickets.usedTime')}:</Text>
                                        <Text strong style={{ marginLeft: 8 }}>{formatDate(ticket.updatedAt)}</Text>
                                    </div>
                                )}
                                {!ticket.entered && (
                                    <StyledButton
                                        type="primary"
                                        icon={<QrcodeOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewTicket(ticket.id);
                                        }}
                                        block
                                    >
                                        {t('tickets.viewTicketCode')}
                                    </StyledButton>
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
                    <TagOutlined />
                    {t('tickets.tabs.all')}
                    <Tag style={{ marginLeft: 8 }}>{tickets.length}</Tag>
                </span>
            ),
            children: renderTicketList(tickets),
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
            children: renderTicketList(tickets.filter(ticket => !ticket.entered)),
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
            children: renderTicketList(tickets.filter(ticket => ticket.entered)),
        },
    ];

    if (loading) {
        return <Spin size="large" />;
    }

    if (error) {
        return <Alert type="error" message={error} />;
    }

    return (
        <TabContainer>
            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={items}
                size="middle"
            />
        </TabContainer>
    );
};

export default TicketList; 