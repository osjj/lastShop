import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const addItemSchema = z.object({
  productId: z.string().uuid('无效的商品ID'),
  quantity: z.number().int().min(1, '数量必须大于0'),
});

export async function POST(request: NextRequest) {
  try {
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
    const validationResult = addItemSchema.safeParse(body);

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

    const { productId, quantity } = validationResult.data;

    // Check if product exists and is available
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, status')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: '商品不存在',
          },
        },
        { status: 404 }
      );
    }

    if (product.status !== 'active') {
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

    if (product.stock_quantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `库存不足，仅剩 ${product.stock_quantity} 件`,
          },
        },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > product.stock_quantity) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `库存不足，最多可添加 ${product.stock_quantity - existingItem.quantity} 件`,
            },
          },
          { status: 400 }
        );
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id)
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
        message: '商品已添加到购物车',
        timestamp: new Date().toISOString(),
      });
    } else {
      // Add new item
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
          price: product.price,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error adding cart item:', insertError);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ADD_CART_ERROR',
              message: '添加到购物车失败',
              details: insertError,
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          item: {
            id: newItem.id,
            productId: newItem.product_id,
            quantity: newItem.quantity,
            price: parseFloat(newItem.price),
            createdAt: newItem.created_at,
            updatedAt: newItem.updated_at,
          },
        },
        message: '商品已添加到购物车',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Unexpected error in add cart item API:', error);
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
