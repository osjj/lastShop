# Supabase 数据库设置指南

## 概述

本指南将帮助您在 Supabase 项目中设置 ShopNext 电商平台的数据库结构。

## 前提条件

1. 已创建 Supabase 项目
2. 已获取项目的 URL 和 API 密钥
3. 有权限访问 Supabase SQL Editor

## 设置步骤

### 第一步：更新环境变量

1. 在项目根目录找到 `.env.local` 文件
2. 更新以下变量为您的 Supabase 项目信息：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 第二步：执行数据库脚本

按以下顺序在 Supabase SQL Editor 中执行脚本：

#### 1. 创建表结构
```bash
# 文件：database-setup.sql
```
在 Supabase Dashboard 中：
1. 进入 SQL Editor
2. 创建新查询
3. 复制 `database-setup.sql` 的内容
4. 点击 "Run" 执行

#### 2. 创建索引和函数
```bash
# 文件：database-indexes-functions.sql
```
执行步骤同上，使用 `database-indexes-functions.sql` 文件内容

#### 3. 设置行级安全策略
```bash
# 文件：database-rls-policies.sql
```
执行步骤同上，使用 `database-rls-policies.sql` 文件内容

#### 4. 插入种子数据（可选）
```bash
# 文件：database-seed-data.sql
```
执行步骤同上，使用 `database-seed-data.sql` 文件内容

### 第三步：验证设置

1. 在 Supabase Dashboard 的 Table Editor 中检查是否所有表都已创建
2. 确认以下表存在：
   - user_profiles
   - categories
   - brands
   - products
   - product_images
   - product_attributes
   - user_addresses
   - cart_items
   - orders
   - order_items
   - product_reviews
   - coupons

### 第四步：配置认证

1. 在 Supabase Dashboard 中进入 Authentication 设置
2. 配置以下设置：
   - 启用邮箱认证
   - 设置站点 URL: `http://localhost:3000`
   - 添加重定向 URL: `http://localhost:3000/api/auth/callback`

## 数据库结构说明

### 核心表

#### user_profiles
扩展用户信息表，存储用户的详细信息
- 与 auth.users 表关联
- 包含姓名、电话、头像等信息
- 支持角色和状态管理

#### categories
商品分类表，支持层级分类
- 支持父子分类关系
- 包含 SEO 相关字段
- 支持排序和状态管理

#### products
商品主表，存储商品核心信息
- 关联分类和品牌
- 支持库存管理
- 包含价格、状态等信息
- 支持全文搜索

#### orders
订单表，存储订单信息
- 支持多种订单状态
- 包含支付和物流信息
- 存储地址信息（JSON 格式）

### 安全策略

所有表都启用了行级安全 (RLS)：
- 用户只能访问自己的数据
- 管理员可以管理所有数据
- 公开数据（如商品、分类）对所有人可见

### 索引优化

为常用查询字段创建了索引：
- 外键字段
- 状态字段
- 搜索相关字段
- 时间字段

## 常见问题

### Q: 执行脚本时出现权限错误
A: 确保您使用的是 service_role 密钥，或者在 Supabase Dashboard 中以管理员身份执行

### Q: 表已存在错误
A: 脚本使用了 `IF NOT EXISTS` 和 `ON CONFLICT` 来避免重复创建，可以安全重复执行

### Q: 如何重置数据库
A: 在 Supabase Dashboard 的 Settings > Database 中可以重置整个数据库

### Q: 如何备份数据
A: 在 Supabase Dashboard 的 Settings > Database 中可以创建备份

## 下一步

数据库设置完成后：
1. 重启 Next.js 开发服务器
2. 测试用户注册和登录功能
3. 检查数据是否正确存储在数据库中

## 支持

如果遇到问题：
1. 检查 Supabase Dashboard 的 Logs 页面
2. 查看浏览器控制台的错误信息
3. 确认环境变量配置正确
