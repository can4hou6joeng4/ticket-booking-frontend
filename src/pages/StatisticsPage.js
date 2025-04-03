import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Row, Col, Statistic } from 'antd';
import {
    CalendarOutlined,
    TagOutlined,
    QrcodeOutlined
} from '@ant-design/icons';
import { statisticsAPI } from '../services/api';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  padding: 20px;
`;

const StyledCard = styled(Card)`
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const StyledStatistic = styled(Statistic)`
  .ant-statistic-title {
    font-size: 16px;
  }
  .ant-statistic-content {
    font-size: 24px;
    color: #1677ff;
  }
`;

const StatisticsPage = () => {
    const [statistics, setStatistics] = useState({
        eventCount: 0,
        ticketCount: 0,
        validationCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await statisticsAPI.getDashboardStats();

                if (response.data.status === 'success' && response.data.data) {
                    setStatistics({
                        eventCount: response.data.data.eventCount || 0,
                        ticketCount: response.data.data.ticketCount || 0,
                        validationCount: response.data.data.validationCount || 0
                    });
                } else {
                    setError(response.message || '获取统计数据失败');
                }
            } catch (error) {
                console.error('获取统计数据失败:', error);
                setError(error.message || '获取统计数据失败');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    return (
        <StyledContainer>
            <h1 style={{ marginBottom: '20px' }}>系统统计</h1>

            {error && (
                <Alert
                    message="错误"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '20px' }}
                />
            )}

            <Spin spinning={loading}>
                <StyledCard title="基础数据统计">
                    <Row gutter={16}>
                        <Col span={8}>
                            <StyledStatistic
                                title="活动总数"
                                value={statistics.eventCount}
                                prefix={<CalendarOutlined />}
                            />
                        </Col>
                        <Col span={8}>
                            <StyledStatistic
                                title="票券总数"
                                value={statistics.ticketCount}
                                prefix={<TagOutlined />}
                            />
                        </Col>
                        <Col span={8}>
                            <StyledStatistic
                                title="已验证票券"
                                value={statistics.validationCount}
                                prefix={<QrcodeOutlined />}
                            />
                        </Col>
                    </Row>
                </StyledCard>
            </Spin>
        </StyledContainer>
    );
};

export default StatisticsPage;
