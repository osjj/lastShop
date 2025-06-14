import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Fetch cart items with product details
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          *,
          category:categories(id, name, slug),
          brand:brands(id, name, slug),
          images:product_images(image_url, alt_text, is_primary, sort_order)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart items:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_CART_ERROR',
            message: '获取购物车失败',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    // Transform data
    const transformedItems = cartItems?.map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      price: parseFloat(item.price),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        description: item.product.description,
        shortDescription: item.product.short_description,
        sku: item.product.sku,
        price: parseFloat(item.product.price),
        originalPrice: item.product.original_price ? parseFloat(item.product.original_price) : undefined,
        categoryId: item.product.category_id,
        brandId: item.product.brand_id,
        stockQuantity: item.product.stock_quantity,
        images: item.product.images
          ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
          ?.map((img: any) => img.image_url) || [],
        status: item.product.status,
        isFeatured: item.product.is_featured,
        isDigital: item.product.is_digital,
        rating: item.product.rating,
        reviewCount: item.product.review_count,
        createdAt: item.product.created_at,
        updatedAt: item.product.updated_at,
        category: item.product.category,
        brand: item.product.brand,
      },
    })) || [];

    // Calculate totals
    const total = transformedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = transformedItems.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      data: {
        items: transformedItems,
        total,
        itemCount,
      },
      message: '购物车获取成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in cart API:', error);
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

export async function DELETE(request: NextRequest) {
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

    // Clear all cart items for the user
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CLEAR_CART_ERROR',
            message: '清空购物车失败',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: '购物车已清空',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in clear cart API:', error);
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
