import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// POST /api/payments/confirm - 确认支付
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod, transactionId, amount } = body;

    // Validate required fields
    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAYMENT_DATA',
            message: '支付确认数据不完整',
          },
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get current user (for manual confirmation) or verify webhook signature
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // For webhook calls, we would verify the signature instead of user auth
    // For now, we'll allow both authenticated users and webhook calls

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
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

    // Verify amount if provided
    if (amount && parseFloat(amount) !== parseFloat(order.total_amount)) {
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

    // Update order payment status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'paid', // 支付成功后状态变为已支付
        updated_at: new Date().toISOString(),
        payment_confirmed_at: new Date().toISOString(),
        transaction_id: transactionId || null,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order payment status:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_ORDER_ERROR',
            message: '更新订单支付状态失败',
            details: updateError,
          },
        },
        { status: 500 }
      );
    }

    // Create payment record for tracking
    const { error: paymentRecordError } = await supabase
      .from('payment_records')
      .insert({
        order_id: orderId,
        user_id: order.user_id,
        payment_method: paymentMethod,
        amount: order.total_amount,
        status: 'completed',
        transaction_id: transactionId || null,
        confirmed_at: new Date().toISOString(),
      });

    if (paymentRecordError) {
      console.error('Error creating payment record:', paymentRecordError);
      // Don't fail the request if payment record creation fails
    }

    // TODO: Send confirmation email to user
    // TODO: Trigger order processing workflow
    // TODO: Send notification to admin

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        paymentStatus: 'paid',
        confirmedAt: new Date().toISOString(),
      },
      message: '支付确认成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in payment confirmation API:', error);
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