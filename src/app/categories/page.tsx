'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { Header } from '@/components/layout/header';
import { API_ROUTES } from '@/lib/constants';
import { Package, ArrowRight, Search } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_ROUTES.categories.list}?include_count=true`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || '获取分类列表失败');
        }

        if (result.success) {
          setCategories(result.data.categories);
        } else {
          throw new Error(result.error?.message || '获取分类列表失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取分类列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">商品分类</h1>
          <p className="text-lg text-gray-600 mb-6">
            浏览我们的商品分类，找到您需要的产品
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索分类..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-red-800 mb-2">加载失败</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && (
          <>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? '未找到匹配的分类' : '暂无分类'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery ? '请尝试其他搜索关键词' : '分类正在准备中，请稍后再来'}
                </p>
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    {searchQuery ? (
                      <>找到 {filteredCategories.length} 个分类包含 "{searchQuery}"</>
                    ) : (
                      <>共 {filteredCategories.length} 个分类</>
                    )}
                  </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group border border-gray-200 hover:border-blue-300"
                    >
                      <div className="p-6">
                        {/* Category Icon */}
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>

                        {/* Category Info */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        
                        {category.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {category.description}
                          </p>
                        )}

                        {/* Product Count & Arrow */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {category.product_count || 0} 件商品
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
