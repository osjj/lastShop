import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PAGINATION } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || PAGINATION.defaultLimit.toString()),
      PAGINATION.maxLimit
    );
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('category') || '';
    const brandId = searchParams.get('brand') || '';
    const sortBy = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const featured = searchParams.get('featured') === 'true';

    const supabase = await createSupabaseServerClient();

    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        brand:brands(id, name, slug),
        images:product_images(image_url, alt_text, is_primary, sort_order)
      `)
      .eq('status', 'active');

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false, nullsLast: true });
        break;
      case 'sales':
        query = query.order('sales_count', { ascending: false, nullsLast: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_PRODUCTS_ERROR',
            message: '获取商品列表失败',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    // Transform data
    const transformedProducts = products?.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.short_description,
      sku: product.sku,
      price: parseFloat(product.price),
      originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
      categoryId: product.category_id,
      brandId: product.brand_id,
      stockQuantity: product.stock_quantity,
      images: product.images
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        ?.map((img: any) => img.image_url) || [],
      status: product.status,
      isFeatured: product.is_featured,
      isDigital: product.is_digital,
      rating: product.rating,
      reviewCount: product.review_count,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      category: product.category,
      brand: product.brand,
    }));

    // Calculate pagination info
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasMore,
        },
      },
      message: '商品列表获取成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in products API:', error);
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
