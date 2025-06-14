'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Product } from '@/types';
import { ProductDetail } from '@/components/product/product-detail';
import { ProductCard } from '@/components/product/product-card';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { API_ROUTES, PAGE_ROUTES } from '@/lib/constants';

interface ProductPageData {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [data, setData] = useState<ProductPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ROUTES.products.detail(slug));
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || '获取商品详情失败');
        }

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error?.message || '获取商品详情失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取商品详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading Skeleton */}
          <div className="animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="h-4 bg-gray-200 rounded w-64 mb-6" />
            
            {/* Product Detail Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-md" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>重试</Button>
            <Button variant="outline" asChild>
              <Link href={PAGE_ROUTES.products}>返回商品列表</Link>
            </Button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { product, relatedProducts } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
            <Link href={PAGE_ROUTES.products}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回商品列表
            </Link>
          </Button>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href={PAGE_ROUTES.home} className="hover:text-gray-700">
            首页
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={PAGE_ROUTES.products} className="hover:text-gray-700">
            商品列表
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`${PAGE_ROUTES.products}?category=${product.categoryId}`}
                className="hover:text-gray-700"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
          <ProductDetail product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">相关商品</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  showWishlist={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
