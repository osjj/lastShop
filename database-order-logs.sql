-- 订单状态日志表
-- 添加到现有数据库中

-- 创建订单状态日志表
CREATE TABLE IF NOT EXISTS public.order_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_order_status_logs_order_id ON order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_changed_by ON order_status_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_created_at ON order_status_logs(created_at);

-- 设置 RLS 策略
ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有日志
CREATE POLICY "Admins can view all order status logs" ON order_status_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 用户可以查看自己订单的状态日志
CREATE POLICY "Users can view own order status logs" ON order_status_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_status_logs.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- 系统可以创建状态日志
CREATE POLICY "System can create order status logs" ON order_status_logs
    FOR INSERT WITH CHECK (true);

-- 添加注释
COMMENT ON TABLE order_status_logs IS '订单状态变更日志表，记录所有状态变更历史';
COMMENT ON COLUMN order_status_logs.previous_status IS '变更前的订单状态';
COMMENT ON COLUMN order_status_logs.new_status IS '变更后的订单状态';
COMMENT ON COLUMN order_status_logs.changed_by IS '执行变更的用户ID（系统变更可为空）';
COMMENT ON COLUMN order_status_logs.notes IS '状态变更备注说明';

-- 在订单表中添加一些缺失的字段
DO $$
BEGIN
    -- 添加处理开始时间
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'processing_started_at') THEN
        ALTER TABLE orders ADD COLUMN processing_started_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- 添加发货时间
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipped_at') THEN
        ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- 添加送达时间
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivered_at') THEN
        ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- 添加支付确认时间
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_confirmed_at') THEN
        ALTER TABLE orders ADD COLUMN payment_confirmed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- 添加取消时间
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'cancelled_at') THEN
        ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- 添加取消原因
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'cancel_reason') THEN
        ALTER TABLE orders ADD COLUMN cancel_reason TEXT;
    END IF;
    
    -- 添加管理员备注
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'admin_notes') THEN
        ALTER TABLE orders ADD COLUMN admin_notes TEXT;
    END IF;
    
    -- 添加交易ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'transaction_id') THEN
        ALTER TABLE orders ADD COLUMN transaction_id VARCHAR(255);
    END IF;
END $$;