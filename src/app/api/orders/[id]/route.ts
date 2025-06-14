import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id] - 获取订单详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ORDER_ID',
            message: '订单ID不能为空',
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

    // Fetch order with items
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(
            id, name, slug, short_description,
            images:product_images(image_url, is_primary)
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
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

      console.error('Error fetching order:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_ORDER_ERROR',
            message: '获取订单详情失败',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    // Transform order data
    const transformedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      subtotal: parseFloat(order.subtotal),
      taxAmount: parseFloat(order.tax_amount || '0'),
      shippingAmount: parseFloat(order.shipping_amount || '0'),
      discountAmount: parseFloat(order.discount_amount || '0'),
      totalAmount: parseFloat(order.total_amount),
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      notes: order.notes,
      items: order.items?.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        totalPrice: parseFloat(item.total_price),
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          shortDescription: item.product.short_description,
          images: item.product.images
            ?.filter((img: any) => img.is_primary)
            ?.map((img: any) => img.image_url) || [],
        } : null,
      })) || [],
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder,
      message: '订单详情获取成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in order detail API:', error);
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

// PATCH /api/orders/[id] - 更新订单状态（管理员功能）
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ORDER_ID',
            message: '订单ID不能为空',
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

    // Check if user is admin (you can implement role-based access control)
    // For now, we'll allow order owners to cancel their orders
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
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

    // Only allow order owner to cancel pending orders
    if (order.user_id !== user.id && status === 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '无权限操作此订单',
          },
        },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (paymentStatus) updateData.payment_status = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_ORDER_ERROR',
            message: '更新订单失败',
            details: updateError,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status,
        notes: updatedOrder.notes,
        updatedAt: updatedOrder.updated_at,
      },
      message: '订单更新成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in update order API:', error);
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
