import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import TicketValidation from './pages/TicketValidation';
import StatisticsPage from './pages/StatisticsPage';

// 管理员路由守卫
const AdminRoute = ({ children }) => {
    const { user, isAdmin } = useAuth();
    console.log('AdminRoute - 用户信息:', user);
    console.log('AdminRoute - 是否管理员:', isAdmin);
    return isAdmin ? children : <Navigate to="/" replace />;
};

// 用户路由守卫 - 确保管理员不会访问用户专属页面
const UserRoute = ({ children }) => {
    const { user, isAdmin } = useAuth();
    console.log('UserRoute - 用户信息:', user);
    console.log('UserRoute - 是否管理员:', isAdmin);
    return !isAdmin ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
    const { isAdmin, user } = useAuth();
    console.log('AppRoutes - 用户信息:', user);
    console.log('AppRoutes - 是否管理员:', isAdmin);

    return (
        <Routes>
            {/* 公共路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 受保护路由 */}
            <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />

                    {/* 活动列表页面对所有用户可见，但会根据角色显示不同内容 */}
                    <Route path="/events" element={<EventList />} />
                    <Route path="/events/:eventId" element={<EventDetail />} />

                    {/* 用户专属路由 */}
                    <Route path="/tickets" element={
                        <UserRoute>
                            <TicketList />
                        </UserRoute>
                    } />
                    <Route path="/tickets/:ticketId" element={
                        <UserRoute>
                            <TicketDetail />
                        </UserRoute>
                    } />

                    {/* 管理员专属路由 */}
                    <Route path="/validate" element={
                        <AdminRoute>
                            <TicketValidation />
                        </AdminRoute>
                    } />
                    <Route path="/statistics" element={
                        <AdminRoute>
                            <StatisticsPage />
                        </AdminRoute>
                    } />
                </Route>
            </Route>

            {/* 匹配任何其他路由，重定向到首页 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
};

export default App; 