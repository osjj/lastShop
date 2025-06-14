import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_SLUG',
            message: '商品标识符不能为空',
          },
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Fetch product with related data
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        brand:brands(id, name, slug),
        images:product_images(image_url, alt_text, is_primary, sort_order),
        attributes:product_attributes(name, value, sort_order)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: '商品不存在或已下架',
            },
          },
          { status: 404 }
        );
      }

      console.error('Error fetching product:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_PRODUCT_ERROR',
            message: '获取商品详情失败',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    // Transform data
    const transformedProduct = {
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
      weight: product.weight,
      dimensions: product.dimensions,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      category: product.category,
      brand: product.brand,
      attributes: product.attributes
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        ?.map((attr: any) => ({
          name: attr.name,
          value: attr.value,
        })) || [],
    };

    // Fetch related products (same category, excluding current product)
    const { data: relatedProducts } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        short_description,
        price,
        original_price,
        images:product_images!inner(image_url, is_primary)
      `)
      .eq('category_id', product.category_id)
      .eq('status', 'active')
      .neq('id', product.id)
      .limit(4);

    const transformedRelatedProducts = relatedProducts?.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.short_description,
      price: parseFloat(p.price),
      originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
      images: p.images
        ?.filter((img: any) => img.is_primary)
        ?.map((img: any) => img.image_url) || [],
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        product: transformedProduct,
        relatedProducts: transformedRelatedProducts,
      },
      message: '商品详情获取成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in product detail API:', error);
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
