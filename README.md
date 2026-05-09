# 用户管理系统 - User Management

基于 Next.js 14 + TypeScript + Tailwind CSS + Vercel Postgres 的用户管理 CRUD 应用

## 项目结构

```
user-management/
├── app/
│   ├── api/
│   │   └── users/
│   │       ├── route.ts          # GET all users, POST create user
│   │       ├── [id]/
│   │       │   └── route.ts      # GET, PUT, DELETE single user
│   │       └── import/
│   │           └── route.ts      # Import users from Excel
│   ├── users/
│   │   ├── new/
│   │   │   └── page.tsx          # New user creation page
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx      # Edit user page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # User list page
├── lib/
│   ├── db.ts                     # Database connection
│   ├── types.ts                  # Type definitions
│   └── excel.ts                  # Excel import/export utilities
├── sql/
│   └── schema.sql                # Database schema
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 功能特性

- ✅ 用户列表展示
- ✅ 新增用户
- ✅ 编辑用户
- ✅ 删除用户
- ✅ 用户状态管理
- ✅ 响应式设计
- ✅ Excel 导入导出功能

## 快速开始

### 1. 本地运行

```bash
# 克隆项目
git clone <your-repo-url>
cd user-management

# 安装依赖
npm install

# 设置环境变量
# 创建 .env.local 文件
cp .env.example .env.local
# 编辑 .env.local 添加数据库连接信息

# 运行开发服务器
npm run dev
```

### 2. 环境变量配置

创建 `.env.local` 文件：

```env
# Vercel Postgres 连接信息
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_prisma_url
POSTGRES_URL_NON_POOLING=your_non_pooling_url
POSTGRES_USER=your_user
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_database
```

### 3. 数据库设置

在 Vercel Postgres 中执行以下 SQL 创建表：

```sql
-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## Excel 导入导出

### 导出用户

点击「导出用户」按钮，将用户列表导出为 CSV 文件。

### 导入用户

1. 点击「导入用户」按钮
2. 下载导入模板参考格式
3. 上传 Excel 文件 (.xlsx, .xls) 或 CSV 文件
4. 查看导入结果

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 3
- **数据库**: Vercel Postgres
- **Excel 处理**: xlsx

## 部署

在 Vercel 上一键部署：

1. 登录 [Vercel](https://vercel.com)
2. 导入你的 GitHub 仓库
3. 在环境变量中配置 Vercel Postgres 连接信息
4. 点击 Deploy