# 开发环境搭建指南

## 系统要求

### 必需软件
- **Node.js**: 18.17.0 或更高版本 (推荐使用 LTS 版本)
- **npm**: 9.0.0 或更高版本 (或 yarn 1.22.0+, pnpm 8.0.0+)
- **Git**: 2.30.0 或更高版本

### 推荐软件
- **VS Code**: 最新版本 + 推荐扩展
- **Chrome/Edge**: 最新版本 (用于开发调试)

## 环境配置

### 1. Node.js 安装

#### Windows
```bash
# 使用 Chocolatey
choco install nodejs

# 或下载官方安装包
# https://nodejs.org/zh-cn/download/
```

#### macOS
```bash
# 使用 Homebrew
brew install node

# 或使用 nvm (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

#### Linux (Ubuntu/Debian)
```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或使用 nvm (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

### 2. 验证安装
```bash
node --version    # 应显示 v18.17.0 或更高
npm --version     # 应显示 9.0.0 或更高
git --version     # 应显示 2.30.0 或更高
```

## 项目初始化

### 1. 克隆项目
```bash
git clone <repository-url>
cd shop
```

### 2. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm (推荐，更快更节省空间)
pnpm install
```

### 3. 环境变量配置

复制环境变量模板：
```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入必要的配置：

```env
# Next.js 配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ShopNext

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 数据库配置 (可选，用于直连)
DATABASE_URL=your_database_connection_string

# 认证配置
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# 支付配置 (开发阶段可留空)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# 邮件服务配置 (开发阶段可留空)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# 文件上传配置
NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# 开发模式配置
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 注册/登录账户
3. 创建新项目
4. 记录项目 URL 和 API 密钥

### 2. 数据库初始化

运行数据库迁移脚本：
```bash
# 安装 Supabase CLI
npm install -g @supabase/cli

# 登录 Supabase
supabase login

# 链接到你的项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push
```

### 3. 认证配置

在 Supabase 控制台中配置：
- 启用邮箱认证
- 配置重定向 URL: `http://localhost:3000/auth/callback`
- 设置站点 URL: `http://localhost:3000`

## VS Code 配置

### 推荐扩展
创建 `.vscode/extensions.json`：
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "yzhang.markdown-all-in-one"
  ]
}
```

### 工作区设置
创建 `.vscode/settings.json`：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 开发服务器

### 启动开发服务器
```bash
# 使用 npm
npm run dev

# 使用 yarn
yarn dev

# 使用 pnpm
pnpm dev
```

服务器将在 `http://localhost:3000` 启动

### 可用脚本
```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check

# 运行测试
npm run test

# 运行测试 (监听模式)
npm run test:watch

# E2E 测试
npm run test:e2e

# 生成组件
npm run generate:component

# 数据库迁移
npm run db:migrate

# 数据库重置
npm run db:reset
```

## 开发工作流

### 1. 功能开发流程
```bash
# 1. 创建功能分支
git checkout -b feature/your-feature-name

# 2. 开发功能
# 编写代码...

# 3. 运行测试
npm run test
npm run lint

# 4. 提交代码
git add .
git commit -m "feat: add your feature description"

# 5. 推送分支
git push origin feature/your-feature-name

# 6. 创建 Pull Request
```

### 2. 代码规范检查
```bash
# 检查代码规范
npm run lint

# 自动修复可修复的问题
npm run lint:fix

# 检查代码格式
npm run format:check

# 自动格式化代码
npm run format
```

### 3. 测试流程
```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test -- components/Button.test.tsx

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

## 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 杀死进程
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### 2. 依赖安装失败
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

#### 3. TypeScript 错误
```bash
# 重启 TypeScript 服务
# 在 VS Code 中: Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# 或删除 .next 目录
rm -rf .next
npm run dev
```

#### 4. Supabase 连接问题
- 检查环境变量是否正确配置
- 确认 Supabase 项目状态正常
- 检查网络连接和防火墙设置

### 获取帮助

如果遇到问题，可以：
1. 查看项目 [Issues](https://github.com/your-repo/issues)
2. 阅读 [Next.js 文档](https://nextjs.org/docs)
3. 查看 [Supabase 文档](https://supabase.com/docs)
4. 联系项目维护者

## 性能优化建议

### 开发环境优化
```bash
# 使用 pnpm 替代 npm (更快的包管理器)
npm install -g pnpm

# 启用 Next.js 快速刷新
# 已在 next.config.js 中配置

# 使用 SWC 编译器 (Next.js 12+ 默认启用)
# 比 Babel 快 17 倍
```

### 编辑器优化
- 安装推荐的 VS Code 扩展
- 启用 TypeScript 严格模式
- 配置 ESLint 和 Prettier 自动修复

## 下一步

环境搭建完成后，请参考：
- [API 文档](./API.md) - 了解 API 接口设计
- [数据库文档](./DATABASE.md) - 了解数据库结构
- [组件文档](./docs/components.md) - 了解组件使用方法

开始开发愉快！🚀
