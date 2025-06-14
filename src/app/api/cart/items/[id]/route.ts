import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateItemSchema = z.object({
  quantity: z.number().int().min(1, '数量必须大于0'),
});

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求参数无效',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { quantity } = validationResult.data;

    // Check if cart item exists and belongs to user
    const { data: cartItem, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(id, name, price, stock_quantity, status)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (cartError || !cartItem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CART_ITEM_NOT_FOUND',
            message: '购物车项目不存在',
          },
        },
        { status: 404 }
      );
    }

    // Check product availability
    if (cartItem.product.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_UNAVAILABLE',
            message: '商品暂时不可购买',
          },
        },
        { status: 400 }
      );
    }

    if (cartItem.product.stock_quantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `库存不足，仅剩 ${cartItem.product.stock_quantity} 件`,
          },
        },
        { status: 400 }
      );
    }

    // Update cart item
    const { data: updatedItem, error: updateError } = await supabase
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating cart item:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_CART_ERROR',
            message: '更新购物车失败',
            details: updateError,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        item: {
          id: updatedItem.id,
          productId: updatedItem.product_id,
          quantity: updatedItem.quantity,
          price: parseFloat(updatedItem.price),
          createdAt: updatedItem.created_at,
          updatedAt: updatedItem.updated_at,
        },
      },
      message: '购物车已更新',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in update cart item API:', error);
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Delete cart item
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting cart item:', deleteError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DELETE_CART_ERROR',
            message: '删除购物车项目失败',
            details: deleteError,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: '商品已从购物车移除',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in delete cart item API:', error);
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
