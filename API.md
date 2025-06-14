# API 接口文档

## 概述

ShopNext 采用 RESTful API 设计规范，基于 Next.js API Routes 和 Supabase 构建。所有 API 接口都支持 JSON 格式的请求和响应。

## 基础信息

- **Base URL**: `http://localhost:3000/api` (开发环境)
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)
- **API 版本**: v1

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP 状态码
- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突
- `422` - 数据验证失败
- `500` - 服务器内部错误

## 认证接口

### 用户注册
```http
POST /api/auth/register
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "张",
  "lastName": "三",
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "张",
      "lastName": "三",
      "role": "customer",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "session": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresAt": "2024-01-01T01:00:00.000Z"
    }
  }
}
```

### 用户登录
```http
POST /api/auth/login
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 用户登出
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### 刷新令牌
```http
POST /api/auth/refresh
```

**请求体**:
```json
{
  "refreshToken": "refresh_token"
}
```

### 密码重置
```http
POST /api/auth/reset-password
```

**请求体**:
```json
{
  "email": "user@example.com"
}
```

## 用户接口

### 获取用户信息
```http
GET /api/users/profile
Authorization: Bearer {token}
```

### 更新用户信息
```http
PUT /api/users/profile
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "firstName": "张",
  "lastName": "三",
  "phone": "13800138000",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 获取用户地址列表
```http
GET /api/users/addresses
Authorization: Bearer {token}
```

### 添加用户地址
```http
POST /api/users/addresses
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "address": "某某街道123号",
  "postalCode": "100000",
  "isDefault": true
}
```

## 商品接口

### 获取商品列表
```http
GET /api/products?page=1&limit=20&category=electronics&sort=price_asc&search=手机
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `category`: 分类 ID 或 slug
- `sort`: 排序方式 (`price_asc`, `price_desc`, `name_asc`, `name_desc`, `created_desc`)
- `search`: 搜索关键词
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `inStock`: 是否有库存 (true/false)

**响应**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "description": "最新款 iPhone",
        "price": 7999.00,
        "originalPrice": 8999.00,
        "images": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "category": {
          "id": "uuid",
          "name": "手机",
          "slug": "phones"
        },
        "brand": "Apple",
        "stock": 100,
        "rating": 4.8,
        "reviewCount": 256,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 获取商品详情
```http
GET /api/products/{id}
```

### 获取商品评价
```http
GET /api/products/{id}/reviews?page=1&limit=10
```

### 添加商品评价
```http
POST /api/products/{id}/reviews
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "rating": 5,
  "comment": "商品很好，推荐购买！",
  "images": [
    "https://example.com/review1.jpg"
  ]
}
```

## 分类接口

### 获取分类列表
```http
GET /api/categories
```

**响应**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "电子产品",
        "slug": "electronics",
        "description": "各类电子产品",
        "image": "https://example.com/category.jpg",
        "parentId": null,
        "children": [
          {
            "id": "uuid",
            "name": "手机",
            "slug": "phones",
            "parentId": "parent_uuid"
          }
        ],
        "productCount": 150
      }
    ]
  }
}
```

## 购物车接口

### 获取购物车
```http
GET /api/cart
Authorization: Bearer {token}
```

### 添加商品到购物车
```http
POST /api/cart/items
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "productId": "uuid",
  "quantity": 2,
  "variantId": "uuid" // 可选，商品变体 ID
}
```

### 更新购物车商品数量
```http
PUT /api/cart/items/{itemId}
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "quantity": 3
}
```

### 删除购物车商品
```http
DELETE /api/cart/items/{itemId}
Authorization: Bearer {token}
```

### 清空购物车
```http
DELETE /api/cart
Authorization: Bearer {token}
```

## 订单接口

### 创建订单
```http
POST /api/orders
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "price": 7999.00
    }
  ],
  "shippingAddress": {
    "name": "张三",
    "phone": "13800138000",
    "address": "北京市朝阳区某某街道123号"
  },
  "paymentMethod": "stripe",
  "couponCode": "DISCOUNT10"
}
```

### 获取订单列表
```http
GET /api/orders?page=1&limit=10&status=pending
Authorization: Bearer {token}
```

**查询参数**:
- `status`: 订单状态 (`pending`, `paid`, `shipped`, `delivered`, `cancelled`)

### 获取订单详情
```http
GET /api/orders/{id}
Authorization: Bearer {token}
```

### 取消订单
```http
POST /api/orders/{id}/cancel
Authorization: Bearer {token}
```

## 支付接口

### 创建支付意图
```http
POST /api/payments/create-intent
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "orderId": "uuid",
  "paymentMethod": "stripe"
}
```

### 确认支付
```http
POST /api/payments/confirm
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "paymentIntentId": "pi_xxx",
  "orderId": "uuid"
}
```

## 管理员接口

### 商品管理

#### 创建商品
```http
POST /api/admin/products
Authorization: Bearer {admin_token}
```

#### 更新商品
```http
PUT /api/admin/products/{id}
Authorization: Bearer {admin_token}
```

#### 删除商品
```http
DELETE /api/admin/products/{id}
Authorization: Bearer {admin_token}
```

### 订单管理

#### 更新订单状态
```http
PUT /api/admin/orders/{id}/status
Authorization: Bearer {admin_token}
```

**请求体**:
```json
{
  "status": "shipped",
  "trackingNumber": "SF1234567890"
}
```

### 用户管理

#### 获取用户列表
```http
GET /api/admin/users?page=1&limit=20&role=customer
Authorization: Bearer {admin_token}
```

#### 更新用户状态
```http
PUT /api/admin/users/{id}/status
Authorization: Bearer {admin_token}
```

**请求体**:
```json
{
  "status": "active" // active, suspended, banned
}
```

## 文件上传接口

### 上传图片
```http
POST /api/upload/images
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求体**:
```
file: [图片文件]
folder: products // 可选，指定文件夹
```

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://supabase.co/storage/v1/object/public/images/products/uuid.jpg",
    "path": "products/uuid.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

## 错误代码

| 错误代码 | 描述 | HTTP 状态码 |
|---------|------|------------|
| `VALIDATION_ERROR` | 数据验证失败 | 422 |
| `UNAUTHORIZED` | 未认证 | 401 |
| `FORBIDDEN` | 权限不足 | 403 |
| `NOT_FOUND` | 资源不存在 | 404 |
| `DUPLICATE_EMAIL` | 邮箱已存在 | 409 |
| `INVALID_CREDENTIALS` | 登录凭据无效 | 401 |
| `INSUFFICIENT_STOCK` | 库存不足 | 400 |
| `PAYMENT_FAILED` | 支付失败 | 400 |
| `ORDER_NOT_CANCELLABLE` | 订单无法取消 | 400 |
| `INTERNAL_ERROR` | 服务器内部错误 | 500 |

## 限流规则

- **认证接口**: 每分钟最多 10 次请求
- **商品查询**: 每分钟最多 100 次请求
- **订单操作**: 每分钟最多 20 次请求
- **文件上传**: 每分钟最多 5 次请求

## 测试环境

### 测试账户
- **普通用户**: test@example.com / password123
- **管理员**: admin@example.com / admin123

### 测试支付
使用 Stripe 测试卡号：
- **成功**: 4242424242424242
- **失败**: 4000000000000002

## SDK 和工具

### JavaScript/TypeScript SDK
```bash
npm install @shopnext/api-client
```

```typescript
import { ShopNextClient } from '@shopnext/api-client';

const client = new ShopNextClient({
  baseURL: 'http://localhost:3000/api',
  apiKey: 'your-api-key'
});

// 获取商品列表
const products = await client.products.list({
  page: 1,
  limit: 20
});
```

### Postman 集合
导入 Postman 集合文件: [ShopNext API.postman_collection.json](./docs/postman/ShopNext%20API.postman_collection.json)

## 更新日志

### v1.0.0 (2024-01-01)
- 初始 API 版本发布
- 支持用户认证、商品管理、订单处理
- 集成 Stripe 支付

---

如有疑问，请查看 [FAQ](./docs/api-faq.md) 或联系开发团队。
