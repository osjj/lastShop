import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// POST /api/orders/[id]/cancel - 取消订单
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { reason } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ORDER_ID',
            message: '订单ID无效',
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

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(id, stock_quantity)
        )
      `)
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

    // Check if order can be cancelled
    if (order.status !== 'pending' && order.status !== 'paid') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ORDER_NOT_CANCELLABLE',
            message: '订单状态不允许取消',
          },
        },
        { status: 400 }
      );
    }

    // Check if order is already paid and handle refund
    const needsRefund = order.payment_status === 'paid';

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: needsRefund ? 'refunded' : order.payment_status,
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason || '用户取消',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_ORDER_ERROR',
            message: '取消订单失败',
            details: updateError,
          },
        },
        { status: 500 }
      );
    }

    // Restore product stock
    for (const item of order.items) {
      if (item.product) {
        const newStock = item.product.stock_quantity + item.quantity;
        await supabase
          .from('products')
          .update({
            stock_quantity: newStock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.product_id);
      }
    }

    // If payment was made, create refund record
    if (needsRefund) {
      await supabase
        .from('payment_records')
        .insert({
          order_id: orderId,
          user_id: user.id,
          payment_method: order.payment_method,
          amount: `-${order.total_amount}`, // Negative amount for refund
          status: 'completed',
          notes: `订单取消退款: ${reason || '用户取消'}`,
        });
    }

    // TODO: Send cancellation email to user
    // TODO: Notify admin of cancellation
    // TODO: Handle refund processing if payment was made

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        status: 'cancelled',
        refundRequired: needsRefund,
        cancelledAt: new Date().toISOString(),
      },
      message: needsRefund ? '订单已取消，退款将在3-7个工作日内处理' : '订单已取消',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in cancel order API:', error);
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