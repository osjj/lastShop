import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProductCount = searchParams.get('include_count') === 'true';
    const parentId = searchParams.get('parent_id');

    const supabase = await createSupabaseServerClient();

    // Build base query
    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    // Filter by parent_id if specified
    if (parentId === 'null' || parentId === '') {
      query = query.is('parent_id', null);
    } else if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_CATEGORIES_ERROR',
            message: '获取分类列表失败',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    // Get product counts if requested
    let categoriesWithCount = categories;
    if (includeProductCount && categories) {
      const categoryIds = categories.map(cat => cat.id);
      
      const { data: productCounts } = await supabase
        .from('products')
        .select('category_id')
        .eq('status', 'active')
        .in('category_id', categoryIds);

      const countMap = productCounts?.reduce((acc: Record<string, number>, product) => {
        acc[product.category_id] = (acc[product.category_id] || 0) + 1;
        return acc;
      }, {}) || {};

      categoriesWithCount = categories.map(category => ({
        ...category,
        productCount: countMap[category.id] || 0,
      }));
    }

    // Transform data
    const transformedCategories = categoriesWithCount?.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.image_url,
      parentId: category.parent_id,
      productCount: category.productCount,
      isActive: category.is_active,
      sortOrder: category.sort_order,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    }));

    // Build hierarchical structure if no parent_id filter is applied
    let result = transformedCategories;
    if (!parentId) {
      const categoryMap = new Map(transformedCategories?.map(cat => [cat.id, { ...cat, children: [] }]));
      const rootCategories: any[] = [];

      transformedCategories?.forEach(category => {
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(categoryMap.get(category.id));
          }
        } else {
          rootCategories.push(categoryMap.get(category.id));
        }
      });

      result = rootCategories;
    }

    return NextResponse.json({
      success: true,
      data: {
        categories: result,
      },
      message: '分类列表获取成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in categories API:', error);
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
