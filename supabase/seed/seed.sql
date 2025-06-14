-- Insert test categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('电子产品', 'electronics', '各类电子产品和数码设备', true),
('服装鞋帽', 'clothing', '时尚服装和鞋帽配饰', true),
('家居用品', 'home', '家居装饰和生活用品', true),
('图书音像', 'books', '图书、音像制品和文具', true),
('运动户外', 'sports', '运动器材和户外用品', true),
('美妆个护', 'beauty', '美妆护肤和个人护理', true);

-- Insert subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active) VALUES
('手机通讯', 'phones', '智能手机和通讯设备', 
    (SELECT id FROM categories WHERE slug = 'electronics'), true),
('电脑办公', 'computers', '电脑和办公设备', 
    (SELECT id FROM categories WHERE slug = 'electronics'), true),
('家用电器', 'appliances', '大小家电产品', 
    (SELECT id FROM categories WHERE slug = 'electronics'), true),
('男装', 'mens-clothing', '男士服装', 
    (SELECT id FROM categories WHERE slug = 'clothing'), true),
('女装', 'womens-clothing', '女士服装', 
    (SELECT id FROM categories WHERE slug = 'clothing'), true),
('鞋靴', 'shoes', '各类鞋靴', 
    (SELECT id FROM categories WHERE slug = 'clothing'), true);

-- Insert test brands
INSERT INTO brands (name, slug, description, is_active) VALUES
('Apple', 'apple', '苹果公司 - 创新科技产品', true),
('Samsung', 'samsung', '三星电子 - 全球领先的科技公司', true),
('Nike', 'nike', '耐克 - 全球知名运动品牌', true),
('Adidas', 'adidas', '阿迪达斯 - 德国运动品牌', true),
('Uniqlo', 'uniqlo', '优衣库 - 日本快时尚品牌', true),
('Xiaomi', 'xiaomi', '小米 - 中国科技公司', true);

-- Insert test products
INSERT INTO products (name, slug, description, short_description, sku, price, original_price, category_id, brand_id, stock_quantity, status, is_featured) VALUES
('iPhone 15 Pro', 'iphone-15-pro', 
    'Apple iPhone 15 Pro 采用钛金属设计，搭载 A17 Pro 芯片，支持 USB-C 接口，拥有强大的摄影系统和超长续航。', 
    '全新 iPhone 15 Pro，钛金属设计，A17 Pro 芯片', 
    'IPHONE15PRO128', 7999.00, 8999.00,
    (SELECT id FROM categories WHERE slug = 'phones'),
    (SELECT id FROM brands WHERE slug = 'apple'),
    50, 'active', true),

('Samsung Galaxy S24', 'samsung-galaxy-s24',
    'Samsung Galaxy S24 搭载最新的 Snapdragon 8 Gen 3 处理器，拥有出色的拍照能力和 AI 功能。',
    'Galaxy S24 旗舰手机，AI 摄影专家',
    'GALAXYS24256', 5999.00, 6999.00,
    (SELECT id FROM categories WHERE slug = 'phones'),
    (SELECT id FROM brands WHERE slug = 'samsung'),
    30, 'active', true),

('Nike Air Max 270', 'nike-air-max-270',
    'Nike Air Max 270 运动鞋，采用大容量 Air 气垫，提供出色的缓震效果和舒适体验。',
    'Nike 经典气垫运动鞋',
    'AIRMAX270BLK42', 899.00, 1299.00,
    (SELECT id FROM categories WHERE slug = 'shoes'),
    (SELECT id FROM brands WHERE slug = 'nike'),
    100, 'active', false),

('Adidas Ultraboost 22', 'adidas-ultraboost-22',
    'Adidas Ultraboost 22 跑步鞋，采用 Boost 中底技术，提供无与伦比的能量回弹。',
    'Adidas 专业跑步鞋',
    'ULTRABOOST22WHT41', 1299.00, 1599.00,
    (SELECT id FROM categories WHERE slug = 'shoes'),
    (SELECT id FROM brands WHERE slug = 'adidas'),
    80, 'active', true),

('Uniqlo 基础款 T 恤', 'uniqlo-basic-tee',
    'Uniqlo 经典基础款 T 恤，采用优质棉质面料，舒适透气，多色可选。',
    '经典基础款，舒适百搭',
    'UNIQLO-TEE-WHT-L', 59.00, 79.00,
    (SELECT id FROM categories WHERE slug = 'mens-clothing'),
    (SELECT id FROM brands WHERE slug = 'uniqlo'),
    200, 'active', false),

('小米 14', 'xiaomi-14',
    '小米 14 搭载骁龙 8 Gen 3 处理器，徕卡影像系统，支持 90W 有线快充。',
    '小米年度旗舰，徕卡影像',
    'MI14-256GB-BLK', 3999.00, 4299.00,
    (SELECT id FROM categories WHERE slug = 'phones'),
    (SELECT id FROM brands WHERE slug = 'xiaomi'),
    60, 'active', true);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
((SELECT id FROM products WHERE sku = 'IPHONE15PRO128'), 
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', 
    'iPhone 15 Pro 正面图', 0, true),
((SELECT id FROM products WHERE sku = 'IPHONE15PRO128'), 
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', 
    'iPhone 15 Pro 背面图', 1, false),

((SELECT id FROM products WHERE sku = 'GALAXYS24256'), 
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', 
    'Galaxy S24 正面图', 0, true),

((SELECT id FROM products WHERE sku = 'AIRMAX270BLK42'), 
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 
    'Nike Air Max 270 侧面图', 0, true),

((SELECT id FROM products WHERE sku = 'ULTRABOOST22WHT41'), 
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500', 
    'Adidas Ultraboost 22 正面图', 0, true),

((SELECT id FROM products WHERE sku = 'UNIQLO-TEE-WHT-L'), 
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 
    'Uniqlo T恤正面图', 0, true),

((SELECT id FROM products WHERE sku = 'MI14-256GB-BLK'), 
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', 
    '小米 14 正面图', 0, true);

-- Insert product attributes
INSERT INTO product_attributes (product_id, name, value, sort_order) VALUES
-- iPhone 15 Pro attributes
((SELECT id FROM products WHERE sku = 'IPHONE15PRO128'), '存储容量', '128GB', 0),
((SELECT id FROM products WHERE sku = 'IPHONE15PRO128'), '颜色', '深空黑色', 1),
((SELECT id FROM products WHERE sku = 'IPHONE15PRO128'), '屏幕尺寸', '6.1英寸', 2),
((SELECT id FROM products WHERE sku = 'IPHONE15PRO128'), '处理器', 'A17 Pro', 3),

-- Galaxy S24 attributes
((SELECT id FROM products WHERE sku = 'GALAXYS24256'), '存储容量', '256GB', 0),
((SELECT id FROM products WHERE sku = 'GALAXYS24256'), '颜色', '幻影黑', 1),
((SELECT id FROM products WHERE sku = 'GALAXYS24256'), '屏幕尺寸', '6.2英寸', 2),
((SELECT id FROM products WHERE sku = 'GALAXYS24256'), '处理器', 'Snapdragon 8 Gen 3', 3),

-- Nike Air Max 270 attributes
((SELECT id FROM products WHERE sku = 'AIRMAX270BLK42'), '尺码', '42', 0),
((SELECT id FROM products WHERE sku = 'AIRMAX270BLK42'), '颜色', '黑色', 1),
((SELECT id FROM products WHERE sku = 'AIRMAX270BLK42'), '材质', '网布+合成革', 2),

-- Adidas Ultraboost 22 attributes
((SELECT id FROM products WHERE sku = 'ULTRABOOST22WHT41'), '尺码', '41', 0),
((SELECT id FROM products WHERE sku = 'ULTRABOOST22WHT41'), '颜色', '白色', 1),
((SELECT id FROM products WHERE sku = 'ULTRABOOST22WHT41'), '技术', 'Boost 中底', 2),

-- Uniqlo T恤 attributes
((SELECT id FROM products WHERE sku = 'UNIQLO-TEE-WHT-L'), '尺码', 'L', 0),
((SELECT id FROM products WHERE sku = 'UNIQLO-TEE-WHT-L'), '颜色', '白色', 1),
((SELECT id FROM products WHERE sku = 'UNIQLO-TEE-WHT-L'), '材质', '100% 棉', 2),

-- 小米 14 attributes
((SELECT id FROM products WHERE sku = 'MI14-256GB-BLK'), '存储容量', '256GB', 0),
((SELECT id FROM products WHERE sku = 'MI14-256GB-BLK'), '颜色', '黑色', 1),
((SELECT id FROM products WHERE sku = 'MI14-256GB-BLK'), '屏幕尺寸', '6.36英寸', 2),
((SELECT id FROM products WHERE sku = 'MI14-256GB-BLK'), '处理器', '骁龙 8 Gen 3', 3);

-- Insert test coupons
INSERT INTO coupons (code, name, description, type, value, minimum_amount, usage_limit, starts_at, expires_at, is_active) VALUES
('WELCOME10', '新用户优惠券', '新用户专享10%折扣', 'percentage', 10.00, 100.00, 1000, NOW(), NOW() + INTERVAL '30 days', true),
('SAVE50', '满减优惠券', '满500减50元', 'fixed_amount', 50.00, 500.00, 500, NOW(), NOW() + INTERVAL '15 days', true),
('FREESHIP', '免运费券', '免运费优惠券', 'fixed_amount', 15.00, 0.00, 1000, NOW(), NOW() + INTERVAL '7 days', true);
