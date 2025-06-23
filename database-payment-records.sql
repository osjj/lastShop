-- 支付记录表
-- 添加到现有数据库中

-- 创建支付记录表
CREATE TABLE IF NOT EXISTS public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('alipay', 'wechat', 'bank_transfer', 'cash_on_delivery')),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    transaction_id VARCHAR(255), -- 第三方支付平台交易ID
    gateway_response JSONB, -- 支付网关响应数据
    confirmed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_payment_records_order_id ON payment_records(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_method ON payment_records(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_records_transaction_id ON payment_records(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON payment_records(created_at);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_payment_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_payment_records_updated_at
    BEFORE UPDATE ON payment_records
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_records_updated_at();

-- 设置 RLS 策略
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的支付记录
CREATE POLICY "Users can view own payment records" ON payment_records
    FOR SELECT USING (auth.uid() = user_id);

-- 管理员可以查看所有支付记录
CREATE POLICY "Admins can view all payment records" ON payment_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 系统可以创建支付记录
CREATE POLICY "System can create payment records" ON payment_records
    FOR INSERT WITH CHECK (true);

-- 系统可以更新支付记录
CREATE POLICY "System can update payment records" ON payment_records
    FOR UPDATE USING (true);

-- 添加支付方式到订单表的注释
COMMENT ON TABLE payment_records IS '支付记录表，记录所有支付交易的详细信息';
COMMENT ON COLUMN payment_records.payment_method IS '支付方式：alipay(支付宝), wechat(微信), bank_transfer(银行转账), cash_on_delivery(货到付款)';
COMMENT ON COLUMN payment_records.status IS '支付状态：pending(待支付), completed(已完成), failed(失败), cancelled(已取消), refunded(已退款)';
COMMENT ON COLUMN payment_records.transaction_id IS '第三方支付平台的交易ID';
COMMENT ON COLUMN payment_records.gateway_response IS '支付网关返回的完整响应数据，用于调试和对账';