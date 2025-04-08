# 票务预订系统前端

这是一个基于React和Ant Design开发的现代化票务预订系统前端项目。系统提供直观的用户界面，支持票务预订、管理和验证等功能，采用响应式设计确保在各种设备上的最佳体验。

## 🚀 功能特性

- **用户管理**
  - 用户注册与登录
  - 个人信息管理
  - 权限控制（管理员/普通用户）
  - 安全登出机制（前后端同步）
  - 多语言支持（中文简体、中文繁体、英文）

- **活动管理**
  - 活动列表展示
  - 活动详情查看
  - 活动创建与编辑（管理员）
  - 活动状态管理

- **票务功能**
  - 在线票券购买
  - 票券管理与查看
  - 电子票券（二维码）
  - 票券验证（管理员）

- **系统特性**
  - 响应式设计
  - 深色/浅色主题切换
  - 国际化支持（i18n）
  - 用户友好的界面
  - 安全的身份验证
  - 实时状态更新

## 🛠️ 技术栈

<div align="center">

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **核心框架** | ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) | 18.2.0 | 用户界面库 |
| **UI框架** | ![Ant Design](https://img.shields.io/badge/Ant%20Design-5-0170FE?style=flat&logo=ant-design) | 5.0.0 | UI组件库 |
| **路由** | ![React Router](https://img.shields.io/badge/React%20Router-6-CA4245?style=flat&logo=react-router) | 6.0.0 | 路由管理 |
| **状态管理** | ![React Context](https://img.shields.io/badge/Context-18-61DAFB?style=flat&logo=react) | 18.2.0 | 状态管理 |
| **HTTP客户端** | ![Axios](https://img.shields.io/badge/Axios-1.6-5A29E4?style=flat&logo=axios) | 1.6.0 | 网络请求 |
| **国际化** | ![i18next](https://img.shields.io/badge/i18next-23-26A69A?style=flat&logo=i18next) | 23.0.0 | 多语言支持 |
| **样式解决方案** | ![Emotion](https://img.shields.io/badge/Emotion-11-DB7093?style=flat&logo=emotion) | 11.0.0 | CSS-in-JS |
| **日期处理** | ![Day.js](https://img.shields.io/badge/Day.js-1.11-FF5F4C?style=flat&logo=day.js) | 1.11.0 | 日期时间处理 |

</div>

## 📋 系统要求

- Node.js 16.0+
- npm 8.0+ 或 yarn 1.22+
- 现代浏览器（Chrome, Firefox, Safari, Edge）
- 内存: 2GB+
- 磁盘空间: 1GB+

## 🔧 安装说明

1. 克隆项目：
```bash
git clone https://github.com/your-username/ticket-booking-project-v1.git
cd ticket-booking-project-v1/frontend
```

2. 安装依赖：
```bash
npm install
# 或
yarn install
```

3. 配置环境变量：
```bash
cp .env.example .env
# 编辑.env文件，设置必要的环境变量
```

4. 启动开发服务器：
```bash
npm start
# 或
yarn start
```

## 📁 项目结构

```
.
├── public/                    # 静态资源
├── src/
│   ├── assets/               # 图片、字体等资源
│   │   ├── common/          # 通用组件
│   │   └── layout/          # 布局组件
│   ├── context/             # React Context
│   ├── hooks/               # 自定义Hooks
│   ├── i18n/                # 国际化配置
│   │   └── locales/        # 语言文件
│   ├── pages/              # 页面组件
│   ├── services/           # API服务
│   ├── styles/             # 全局样式
│   ├── utils/              # 工具函数
│   ├── App.js             # 应用主组件
│   └── index.js           # 应用入口
├── .env                    # 环境变量
├── .eslintrc.js           # ESLint配置
├── .prettierrc            # Prettier配置
├── package.json           # 项目配置
└── README.md              # 项目文档
```

## 🔒 环境变量

主要环境变量配置：
- `REACT_APP_API_URL`: API基础URL
- `REACT_APP_ENV`: 运行环境
- `REACT_APP_I18N_DEBUG`: 国际化调试模式
- `REACT_APP_GA_ID`: Google Analytics ID

## 🚀 开发指南

1. 启动开发服务器：
```bash
npm start
```

2. 运行测试：
```bash
npm test
```

3. 构建生产版本：
```bash
npm run build
```

4. 代码格式化：
```bash
npm run format
```

## 🖥️ 浏览器支持

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 88

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📝 TODO 列表

### 功能增强
- ✔ 添加黑暗模式支持
- [ ] 实现票券分享功能
- [ ] 添加支付集成
- [ ] 实现活动收藏功能
- [ ] 添加用户评价系统

### UI/UX改进
- [ ] 优化移动端体验
- [ ] 添加更多动画效果
- ✔ 改进标签页切换时数据刷新功能
- [ ] 改进加载状态展示
- ✔ 根据用户角色显示/隐藏活动统计信息
- [ ] 优化表单验证反馈
- [ ] 添加引导教程

### 性能优化
- [ ] 实现组件懒加载
- [ ] 优化图片加载
- [ ] 添加性能监控
- [ ] 优化打包大小
- [ ] 实现PWA支持

### 开发体验
- [ ] 添加单元测试
- [ ] 完善开发文档
- [ ] 添加Storybook
- [ ] 优化构建流程
- [ ] 添加自动化测试 