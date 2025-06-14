'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { ProductCard } from '@/components/product/product-card';
import { Product } from '@/types';
import { API_ROUTES } from '@/lib/constants';
import { ShoppingBag, Truck, Shield, Headphones, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_ROUTES.products.list}?limit=4&featured=true`);
        const result = await response.json();

        if (result.success && result.data?.products) {
          setFeaturedProducts(result.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-yellow-300 mr-3" />
            <span className="text-yellow-300 font-medium text-lg">现代化电商平台</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            欢迎来到
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> ShopNext</span>
          </h1>

          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            现代化的电商平台，为您提供最优质的购物体验。基于 Next.js 14+ 构建，支持最新的 Web 技术，让购物变得更加简单和愉快。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-semibold shadow-lg">
              <Link href="/products">
                开始购物
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 font-semibold">
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">为什么选择我们</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们致力于为您提供最优质的购物体验，从商品质量到售后服务，每一个细节都精心打造
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">快速配送</h3>
              <p className="text-gray-600 leading-relaxed">
                全国范围内快速配送，大部分地区 24 小时内送达，让您尽快收到心仪的商品
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-green-200 transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">安全保障</h3>
              <p className="text-gray-600 leading-relaxed">
                采用最新的安全技术，保护您的个人信息和支付安全，让您购物无忧
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-purple-200 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <Headphones className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">24/7 客服</h3>
              <p className="text-gray-600 leading-relaxed">
                专业的客服团队随时为您提供帮助和支持，解决您的任何疑问
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">热门商品</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              精选优质商品，为您带来最佳的购物体验
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeleton
              [...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              // Real products
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="rounded-2xl border-gray-200 hover:shadow-xl hover:border-blue-200"
                />
              ))
            ) : (
              // Fallback static products if no data
              [
                {
                  id: 'fallback-1',
                  name: 'iPhone 15 Pro',
                  price: 7999,
                  originalPrice: 8999,
                  slug: 'iphone-15-pro',
                  images: ['/placeholder-product.jpg'],
                  stockQuantity: 10,
                  categoryId: '1',
                  shortDescription: '最新款 iPhone，性能强劲',
                  rating: 4.8,
                  reviewCount: 128,
                  status: 'active' as const,
                  isFeatured: true,
                  isDigital: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  id: 'fallback-2',
                  name: 'Nike Air Max',
                  price: 899,
                  originalPrice: 1299,
                  slug: 'nike-air-max',
                  images: ['/placeholder-product.jpg'],
                  stockQuantity: 15,
                  categoryId: '2',
                  shortDescription: '经典运动鞋，舒适透气',
                  rating: 4.6,
                  reviewCount: 89,
                  status: 'active' as const,
                  isFeatured: true,
                  isDigital: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  id: 'fallback-3',
                  name: 'Samsung Galaxy',
                  price: 5999,
                  originalPrice: 6999,
                  slug: 'samsung-galaxy',
                  images: ['/placeholder-product.jpg'],
                  stockQuantity: 8,
                  categoryId: '1',
                  shortDescription: '三星旗舰手机，拍照出色',
                  rating: 4.5,
                  reviewCount: 156,
                  status: 'active' as const,
                  isFeatured: true,
                  isDigital: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  id: 'fallback-4',
                  name: 'Adidas 运动鞋',
                  price: 1299,
                  originalPrice: 1599,
                  slug: 'adidas-sneakers',
                  images: ['/placeholder-product.jpg'],
                  stockQuantity: 12,
                  categoryId: '2',
                  shortDescription: '阿迪达斯经典款，时尚百搭',
                  rating: 4.7,
                  reviewCount: 203,
                  status: 'active' as const,
                  isFeatured: true,
                  isDigital: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ].map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="rounded-2xl border-gray-200 hover:shadow-xl hover:border-blue-200"
                />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
              <Link href="/products">
                查看更多商品
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <ShoppingBag className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">ShopNext</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                现代化的电商平台，为您提供最优质的购物体验。我们致力于让购物变得更加简单和愉快。
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">i</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">快速链接</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">首页</Link></li>
                <li><Link href="/products" className="text-gray-300 hover:text-white transition-colors">商品</Link></li>
                <li><Link href="/cart" className="text-gray-300 hover:text-white transition-colors">购物车</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">关于我们</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">客户服务</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">帮助中心</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">退换货政策</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">配送信息</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">联系我们</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">联系信息</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <span className="w-5 h-5 mr-3">📞</span>
                  400-123-4567
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 mr-3">✉️</span>
                  support@shopnext.com
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 mr-3">📍</span>
                  北京市朝阳区某某街道123号
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 ShopNext. 保留所有权利。 |
              <a href="#" className="hover:text-white transition-colors ml-2">隐私政策</a> |
              <a href="#" className="hover:text-white transition-colors ml-2">服务条款</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
