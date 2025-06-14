'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Product, Category } from '@/types';
import { ProductList } from '@/components/product/product-list';
import { ProductFilters } from '@/components/product/product-filters';
import { ProductSearch } from '@/components/product/product-search';
import { Header } from '@/components/layout/header';
import { API_ROUTES } from '@/lib/constants';

interface ProductsPageData {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

function ProductsPageContent() {
  const [data, setData] = useState<ProductsPageData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get current filters from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('min_price');
  const currentMaxPrice = searchParams.get('max_price');

  // Update URL with new parameters
  const updateURL = useCallback((params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    // Reset to page 1 when filters change (except when explicitly setting page)
    if (!params.page && Object.keys(params).some(key => key !== 'page')) {
      newSearchParams.set('page', '1');
    }

    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [searchParams, router, pathname]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      
      if (currentSearch) params.set('search', currentSearch);
      if (currentCategory) params.set('category', currentCategory);
      if (currentSort) params.set('sort', currentSort);
      if (currentMinPrice) params.set('min_price', currentMinPrice);
      if (currentMaxPrice) params.set('max_price', currentMaxPrice);

      const response = await fetch(`${API_ROUTES.products.list}?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '获取商品列表失败');
      }

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error?.message || '获取商品列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取商品列表失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, currentCategory, currentSort, currentMinPrice, currentMaxPrice]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_ROUTES.categories.list}?include_count=true`);
      const result = await response.json();

      if (result.success) {
        setCategories(result.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Load data on mount and when search params change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Event handlers
  const handleSearch = (query: string) => {
    updateURL({ search: query || undefined });
  };

  const handleCategoryChange = (categoryId: string) => {
    updateURL({ category: categoryId || undefined });
  };

  const handleSortChange = (sortBy: string) => {
    updateURL({ sort: sortBy });
  };

  const handlePriceRangeChange = (range: [number, number] | undefined) => {
    updateURL({
      min_price: range ? range[0].toString() : undefined,
      max_price: range && range[1] !== Infinity ? range[1].toString() : undefined,
    });
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  const handleLoadMore = () => {
    if (data?.pagination.hasMore) {
      updateURL({ page: (currentPage + 1).toString() });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">商品列表</h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <ProductSearch
              value={currentSearch}
              onSearch={handleSearch}
              onClear={() => handleSearch('')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              categories={categories}
              selectedCategory={currentCategory}
              sortBy={currentSort}
              priceRange={
                currentMinPrice || currentMaxPrice
                  ? [
                      parseInt(currentMinPrice || '0'),
                      currentMaxPrice ? parseInt(currentMaxPrice) : Infinity,
                    ]
                  : undefined
              }
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
              onPriceRangeChange={handlePriceRangeChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            {data && !loading && (
              <div className="mb-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  共找到 {data.pagination.total} 件商品
                  {currentSearch && (
                    <span className="ml-1">
                      包含 "{currentSearch}"
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  第 {data.pagination.page} 页，共 {data.pagination.totalPages} 页
                </p>
              </div>
            )}

            {/* Product List */}
            <ProductList
              products={data?.products}
              loading={loading}
              error={error}
              hasMore={data?.pagination.hasMore}
              onLoadMore={handleLoadMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ProductsPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded max-w-2xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsPageContent />
    </Suspense>
  );
}
