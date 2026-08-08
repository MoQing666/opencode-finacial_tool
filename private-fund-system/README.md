# 私募基金管理系统

## 项目简介

私募基金管理系统是一套专为私募基金公司设计的投前投后市场信息一体化平台。系统采用Electron桌面应用架构，支持本地部署，确保数据安全。

## 核心功能

### 投前管理
- 项目筛选与评估
- 尽职调查管理
- 项目估值分析
- 投资决策管理

### 投后管理
- 项目监控与跟踪
- 绩效评估与分析
- 风险预警与管理
- 退出计划管理

### 市场信息
- 实时行情数据
- 行业分析报告
- 研报管理
- 数据大屏展示

### Wind数据接口
- 股票数据查询
- 债券数据查询
- 基金数据查询
- 指数数据查询
- 证券搜索

### AI智能助手
- 投资项目分析
- 财务数据解读
- 市场趋势分析
- 报告自动生成

### 系统管理
- 用户权限管理
- 系统日志审计
- 系统配置管理

## 技术架构

### 前端技术
- **框架**: Vue 3 + Vite
- **UI组件**: Element Plus
- **图表**: ECharts
- **状态管理**: Pinia
- **路由**: Vue Router

### 后端技术
- **运行环境**: Electron + Node.js
- **Web框架**: Express
- **数据库**: PostgreSQL
- **ORM**: Sequelize
- **实时通信**: Socket.IO

### AI模型
- **本地模型**: LLaMA 2 (node-llama-cpp)
- **功能**: 智能分析、报告生成、投资建议

### 外部接口
- **Wind API**: REST + WebSocket
- **数据类型**: 股票、债券、基金、指数

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-org/private-fund-system.git
cd private-fund-system
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库、Wind API等参数
```

4. **初始化数据库**
```bash
npm run db:init
```

5. **下载LLaMA模型**
```bash
# 下载 LLaMA 2 7B Chat 模型到 models 目录
# 模型文件: llama-2-7b-chat.Q4_K_M.gguf
```

6. **启动开发环境**
```bash
npm run dev
```

7. **构建生产版本**
```bash
npm run build
```

## 项目结构

```
private-fund-system/
├── src/
│   ├── main/                    # Electron主进程
│   │   ├── index.js            # 主入口文件
│   │   ├── database.js         # 数据库配置和模型
│   │   ├── llama.js            # LLaMA模型集成
│   │   ├── wind.js             # Wind API集成
│   │   ├── auth.js             # 认证和权限
│   │   ├── routes/             # API路由
│   │   │   ├── auth.js         # 认证路由
│   │   │   ├── projects.js     # 项目路由
│   │   │   ├── market.js       # 市场路由
│   │   │   ├── wind.js         # Wind数据路由
│   │   │   ├── ai.js           # AI路由
│   │   │   ├── dashboard.js    # 数据大屏路由
│   │   │   └── users.js        # 用户路由
│   │   └── utils/              # 工具函数
│   │       └── logger.js       # 日志工具
│   └── renderer/               # Vue前端
│       ├── index.html          # HTML入口
│       ├── main.js             # Vue入口
│       ├── App.vue             # 根组件
│       ├── router/             # 路由配置
│       │   └── index.js
│       ├── stores/             # 状态管理
│       │   └── user.js
│       ├── services/           # API服务
│       │   └── api.js
│       ├── components/         # 公共组件
│       │   ├── Layout.vue
│       │   ├── DueDiligencePanel.vue
│       │   ├── ValuationPanel.vue
│       │   ├── DecisionPanel.vue
│       │   ├── PostInvestmentPanel.vue
│       │   ├── MarketOverview.vue
│       │   ├── StockList.vue
│       │   ├── BondList.vue
│       │   ├── FundList.vue
│       │   └── IndexList.vue
│       ├── pages/              # 页面组件
│       │   ├── Login.vue
│       │   ├── Dashboard.vue
│       │   ├── Projects.vue
│       │   ├── ProjectDetail.vue
│       │   ├── PreInvestment.vue
│       │   ├── PostInvestment.vue
│       │   ├── Market.vue
│       │   ├── WindData.vue
│       │   ├── AIAssistant.vue
│       │   ├── Users.vue
│       │   ├── Settings.vue
│       │   └── Logs.vue
│       ├── styles/             # 样式文件
│       │   └── main.scss
│       └── assets/             # 静态资源
├── config/                     # 配置文件
│   ├── database.js
│   └── default.json
├── database/                   # 数据库脚本
├── models/                     # LLaMA模型文件
├── docs/                       # 文档
├── package.json
├── vite.config.js
├── .env.example
└── README.md
```

## 配置说明

### 数据库配置
在 `.env` 文件中配置数据库连接信息：
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=private_fund_dev
DB_USER=postgres
DB_PASS=your_password
```

### Wind API配置
1. 申请Wind API密钥
2. 在 `.env` 文件中配置：
```env
WIND_API_KEY=your_api_key
WIND_API_SECRET=your_api_secret
```

### LLaMA模型配置
1. 下载LLaMA 2 7B Chat GGUF格式模型
2. 放置到 `models/` 目录
3. 在 `.env` 文件中配置模型路径：
```env
LLAMA_MODEL_PATH=./models/llama-2-7b-chat.Q4_K_M.gguf
LLAMA_CONTEXT_SIZE=4096
LLAMA_GPU_LAYERS=0
```

## 用户角色

系统支持以下用户角色：
- **admin**: 管理员，拥有所有权限
- **manager**: 经理，可管理项目和用户
- **analyst**: 分析师，可查看和分析数据
- **viewer**: 查看者，只读权限

## 默认账户

首次运行时，系统会创建默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

**请在生产环境中立即修改默认密码！**

## 开发指南

### 添加新页面
1. 在 `src/renderer/pages/` 创建新页面组件
2. 在 `src/renderer/router/index.js` 添加路由配置
3. 在 `src/renderer/components/Layout.vue` 添加菜单项

### 添加新API
1. 在 `src/main/routes/` 创建新的路由文件
2. 在 `src/main/index.js` 注册路由
3. 在 `src/renderer/services/api.js` 添加前端API调用

### 数据库迁移
```bash
npm run db:migrate
```

## 部署说明

### 打包应用
```bash
npm run build
```

打包后的文件在 `dist/` 目录。

### 生产环境配置
1. 设置 `NODE_ENV=production`
2. 配置生产数据库
3. 配置Wind API密钥
4. 下载并配置LLaMA模型

## 常见问题

### Q: 如何获取Wind API密钥？
A: 请联系Wind万得客服或访问Wind官网申请API接口权限。

### Q: LLaMA模型在哪里下载？
A: 可以从Hugging Face下载LLaMA 2 7B Chat的GGUF格式模型。

### Q: 如何支持远程登录？
A: 系统已内置JWT认证机制，支持远程访问。只需配置服务器IP和端口即可。

### Q: 数据库如何备份？
A: 使用PostgreSQL的pg_dump工具进行数据库备份。

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。
