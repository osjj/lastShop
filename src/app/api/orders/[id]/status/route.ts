import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// PATCH /api/orders/[id]/status - 更新订单状态 (管理员)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { status, notes } = body;

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

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: '状态不能为空',
          },
        },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS_VALUE',
            message: '无效的订单状态',
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

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '权限不足',
          },
        },
        { status: 403 }
      );
    }

    // Get current order
    const { data: currentOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !currentOrder) {
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

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add status-specific timestamps
    switch (status) {
      case 'paid':
        if (currentOrder.status !== 'paid') {
          updateData.payment_status = 'paid';
          updateData.payment_confirmed_at = new Date().toISOString();
        }
        break;
      case 'processing':
        if (currentOrder.status !== 'processing') {
          updateData.processing_started_at = new Date().toISOString();
        }
        break;
      case 'shipped':
        if (currentOrder.status !== 'shipped') {
          updateData.shipped_at = new Date().toISOString();
        }
        break;
      case 'delivered':
        if (currentOrder.status !== 'delivered') {
          updateData.delivered_at = new Date().toISOString();
        }
        break;
      case 'cancelled':
        if (currentOrder.status !== 'cancelled') {
          updateData.cancelled_at = new Date().toISOString();
          updateData.cancel_reason = notes || '管理员取消';
        }
        break;
    }

    if (notes) {
      updateData.admin_notes = notes;
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_ORDER_ERROR',
            message: '更新订单状态失败',
            details: updateError,
          },
        },
        { status: 500 }
      );
    }

    // Log the status change
    await supabase
      .from('order_status_logs')
      .insert({
        order_id: orderId,
        previous_status: currentOrder.status,
        new_status: status,
        changed_by: user.id,
        notes: notes || null,
        created_at: new Date().toISOString(),
      });

    // Handle specific status transitions
    if (status === 'cancelled' && currentOrder.payment_status === 'paid') {
      // Create refund record if order was paid
      await supabase
        .from('payment_records')
        .insert({
          order_id: orderId,
          user_id: currentOrder.user_id,
          payment_method: currentOrder.payment_method,
          amount: `-${currentOrder.total_amount}`, // Negative for refund
          status: 'completed',
          notes: `管理员取消订单退款: ${notes || ''}`,
        });

      // Update payment status to refunded
      await supabase
        .from('orders')
        .update({ payment_status: 'refunded' })
        .eq('id', orderId);
    }

    // TODO: Send notification to customer
    // TODO: Send email updates
    // TODO: Update inventory if cancelled

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        status,
        updatedAt: new Date().toISOString(),
      },
      message: '订单状态更新成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in update order status API:', error);
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