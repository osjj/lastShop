import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// POST /api/payments - 创建支付订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod, amount } = body;

    // Validate required fields
    if (!orderId || !paymentMethod || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAYMENT_DATA',
            message: '支付数据不完整',
          },
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录',
          },
        },
        { status: 401 }
      );
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, status, payment_status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: '订单不存在',
          },
        },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ORDER_ALREADY_PAID',
            message: '订单已支付',
          },
        },
        { status: 400 }
      );
    }

    // Verify amount matches order total
    if (parseFloat(amount) !== parseFloat(order.total_amount)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AMOUNT_MISMATCH',
            message: '支付金额与订单金额不符',
          },
        },
        { status: 400 }
      );
    }

    // Handle different payment methods
    let paymentData = {};
    
    switch (paymentMethod) {
      case 'alipay':
        // 支付宝支付集成
        paymentData = await handleAlipayPayment(orderId, amount);
        break;
      case 'wechat':
        // 微信支付集成
        paymentData = await handleWechatPayment(orderId, amount);
        break;
      case 'bank_transfer':
        // 银行转账 - 生成转账信息
        paymentData = await handleBankTransferPayment(orderId, amount);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNSUPPORTED_PAYMENT_METHOD',
              message: '不支持的支付方式',
            },
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: paymentData,
      message: '支付订单创建成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in payments API:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '服务器内部错误',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// 支付宝支付处理
async function handleAlipayPayment(orderId: string, amount: string) {
  // 这里集成支付宝SDK
  // 示例实现
  return {
    paymentMethod: 'alipay',
    orderId,
    amount,
    qrCode: `https://qr.alipay.com/pay?order_id=${orderId}&amount=${amount}`,
    expireTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15分钟后过期
    instructions: [
      '请使用支付宝扫描二维码完成支付',
      '支付完成后，系统将自动确认订单',
      '如有问题，请联系客服'
    ]
  };
}

// 微信支付处理
async function handleWechatPayment(orderId: string, amount: string) {
  // 这里集成微信支付SDK
  // 示例实现
  return {
    paymentMethod: 'wechat',
    orderId,
    amount,
    qrCode: `https://pay.weixin.qq.com/pay?order_id=${orderId}&amount=${amount}`,
    expireTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15分钟后过期
    instructions: [
      '请使用微信扫描二维码完成支付',
      '支付完成后，系统将自动确认订单',
      '如有问题，请联系客服'
    ]
  };
}

// 银行转账处理
async function handleBankTransferPayment(orderId: string, amount: string) {
  return {
    paymentMethod: 'bank_transfer',
    orderId,
    amount,
    bankInfo: {
      bankName: '中国工商银行',
      accountName: 'ShopNext 电商有限公司',
      accountNumber: '6222 0202 0000 1234 567',
      branchName: '工商银行北京分行营业部',
      swift: 'ICBKCNBJ',
    },
    instructions: [
      '请在转账备注中填写订单号',
      '转账金额必须与订单总金额完全一致',
      '我们将在收到转账后1-2个工作日内确认并发货',
      '如有疑问，请联系客服：400-123-4567'
    ],
    expireTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天后过期
  };
}