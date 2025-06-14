import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PAGINATION } from '@/lib/constants';

// GET /api/orders - 获取用户订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || PAGINATION.defaultLimit.toString()),
      PAGINATION.maxLimit
    );
    const status = searchParams.get('status');

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

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(id, name, slug, images:product_images(image_url, is_primary))
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: orders, error, count } = await query
      .range(from, to)
      .limit(limit);

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_ORDERS_ERROR',
            message: '获取订单列表失败',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    // Transform orders
    const transformedOrders = orders?.map((order) => ({
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
          images: item.product.images
            ?.filter((img: any) => img.is_primary)
            ?.map((img: any) => img.image_url) || [],
        } : null,
      })) || [],
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    })) || [];

    // Calculate pagination info
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: {
        orders: transformedOrders,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasMore,
        },
      },
      message: '订单列表获取成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in orders API:', error);
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

// POST /api/orders - 创建新订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod = 'bank_transfer',
      notes,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ITEMS',
            message: '订单商品不能为空',
          },
        },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SHIPPING_ADDRESS',
            message: '收货地址不能为空',
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

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, sku')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: `商品不存在: ${item.productId}`,
            },
          },
          { status: 400 }
        );
      }

      // Check stock
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `商品 ${product.name} 库存不足`,
            },
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      });
    }

    const taxAmount = 0; // 可以根据需要计算税费
    const shippingAmount = 0; // 可以根据需要计算运费
    const discountAmount = 0; // 可以根据需要计算折扣
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Create order in transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        payment_status: 'pending',
        payment_method: paymentMethod,
        subtotal: subtotal.toString(),
        tax_amount: taxAmount.toString(),
        shipping_amount: shippingAmount.toString(),
        discount_amount: discountAmount.toString(),
        total_amount: totalAmount.toString(),
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CREATE_ORDER_ERROR',
            message: '创建订单失败',
            details: orderError,
          },
        },
        { status: 500 }
      );
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CREATE_ORDER_ITEMS_ERROR',
            message: '创建订单商品失败',
            details: itemsError,
          },
        },
        { status: 500 }
      );
    }

    // Update product stock
    for (const item of items) {
      // Get current stock first
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.productId)
        .single();

      if (currentProduct) {
        const newStock = Math.max(0, currentProduct.stock_quantity - item.quantity);
        await supabase
          .from('products')
          .update({
            stock_quantity: newStock
          })
          .eq('id', item.productId);
      }
    }

    // Clear user's cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: parseFloat(order.total_amount),
        status: order.status,
        paymentStatus: order.payment_status,
      },
      message: '订单创建成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in create order API:', error);
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
