import axios from 'axios';

// 创建axios实例
const api = axios.create({
    baseURL: '/api',  // 使用相对路径，将通过 proxy 转发到后端
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true  // 允许跨域请求携带凭证
});

// 请求拦截器添加token和日志
api.interceptors.request.use(
    (config) => {
        // 构建完整的请求URL用于日志
        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.log(`请求发送 [${config.method?.toUpperCase()}]: ${fullUrl}`, {
            headers: config.headers,
            data: config.data,
            params: config.params,
        });

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('已附加认证令牌到请求');
        }

        return config;
    },
    (error) => {
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器处理错误和日志
api.interceptors.response.use(
    (response) => {
        const fullUrl = `${response.config.baseURL || ''}${response.config.url || ''}`;
        console.log(`请求成功 [${response.config.method?.toUpperCase()}]: ${fullUrl}`, {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
        });

        // 直接返回整个响应数据，让具体的API处理逻辑来处理数据
        return response.data;
    },
    (error) => {
        let errorMsg = '未知错误';
        let requestInfo = '未知请求';

        if (error.config) {
            const fullUrl = `${error.config.baseURL || ''}${error.config.url || ''}`;
            requestInfo = `[${error.config.method?.toUpperCase()}] ${fullUrl}`;
        }

        if (error.response) {
            errorMsg = `服务器响应错误 (${error.response.status}): ${error.response.statusText || ''}`;
            console.error(`请求失败 ${requestInfo}`, {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers,
            });

            if (error.response.status === 401) {
                console.log('认证失败，正在登出...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } else if (error.request) {
            errorMsg = '未收到服务器响应，服务器可能未运行或网络问题';
            console.error(`请求无响应 ${requestInfo}`, { request: error.request });
        } else {
            errorMsg = `请求配置错误: ${error.message}`;
            console.error(`请求错误 ${requestInfo}`, { message: error.message, error });
        }

        error.friendlyMessage = errorMsg;
        return Promise.reject(error);
    }
);

// 身份验证相关API
export const authAPI = {
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            console.log('登录响应原始数据:', response);

            if (response.status === 'success' && response.data) {
                const { token, user } = response.data;
                if (token && user) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('用户信息已保存到本地存储');
                    return response;
                }
            }

            // 如果响应不符合预期格式，抛出错误
            throw new Error(response.message || '登录失败：服务器响应格式不正确');
        } catch (error) {
            console.error('登录API错误:', error);
            if (error.response?.data?.message) {
                error.friendlyMessage = error.response.data.message;
            }
            throw error;
        }
    },
    register: (userData) => api.post('/auth/register', userData),
    profile: () => api.post('/auth/me'),
    logout: async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { status: 'success' };
        } catch (error) {
            console.error('登出失败:', error);
            // 即使后端请求失败，也要清除本地存储
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
    }
};

// 活动相关API
export const eventAPI = {
    getEvents: async () => {
        try {
            const response = await api.get('/event');
            console.log('原始活动列表数据:', response);
            // 后端直接返回标准格式 {status, message, data}
            return response;
        } catch (error) {
            console.error('获取活动列表错误:', error);
            throw error;
        }
    },
    getEvent: async (id) => {
        try {
            const response = await api.get(`/event/${id}`);
            console.log(`获取活动 ${id} 详情:`, response);
            return response;
        } catch (error) {
            console.error(`获取活动 ${id} 详情失败:`, error);
            throw error;
        }
    },
    createEvent: (eventData) => api.post('/event', eventData),
    updateEvent: (id, eventData) => api.put(`/event/${id}`, eventData),
    deleteEvent: (id) => api.delete(`/event/${id}`),
};

// 票务相关API
export const ticketAPI = {
    getTickets: async () => {
        try {
            const response = await api.get('/ticket');
            console.log('原始票券列表数据:', response);
            return response;
        } catch (error) {
            console.error('获取票券列表错误:', error);
            throw error;
        }
    },
    getTicket: async (id) => {
        try {
            const response = await api.get(`/ticket/${id}`);
            console.log(`获取票券 ${id} 详情:`, response);

            // 确保返回标准格式的响应
            if (response && response.status === 'success') {
                // 检查票券数据是否完整
                const ticketData = response.data;
                if (!ticketData) {
                    console.error('票券数据缺失');
                    throw new Error('票券数据不完整');
                }
                return response;
            } else {
                console.error(`获取票券 ${id} 失败:`, response?.message || '未知错误');
                throw new Error(response?.message || '获取票券详情失败');
            }
        } catch (error) {
            console.error(`获取票券 ${id} 详情失败:`, error);
            throw error;
        }
    },
    buyTicket: (ticketData) => api.post('/ticket', ticketData),
    validateTicket: (validationData) => api.post('/ticket/validate', validationData),
};

// 统计相关API
export const statisticsAPI = {
    getDashboardStats: async () => {
        try {
            const response = await api.get('/statistics/dashboard');
            console.log('原始统计数据:', response);
            return response;
        } catch (error) {
            console.error('获取仪表盘统计数据失败:', error);
            // 如果获取失败，返回模拟数据用于测试
            console.warn('返回模拟数据');
            return {
                status: 'success',
                message: '获取成功(模拟数据)',
                data: {
                    eventCount: 12,
                    ticketCount: 36,
                    validationCount: 21
                }
            };
        }
    }
};

export default api; 