'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Carousel } from '@/components/ui/carousel';
import { ProductSection } from '@/components/product/product-section';
import { ShoppingBag, Truck, Shield, Headphones, ArrowRight, Sparkles, Star, Gift } from 'lucide-react';

export default function Home() {
  // 轮播图数据
  const carouselSlides = [
    {
      id: '1',
      title: '新年大促销',
      subtitle: '限时优惠',
      description: '全场商品最高享受 50% 折扣，数量有限，先到先得！',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=600&fit=crop&auto=format',
      buttonText: '立即抢购',
      buttonLink: '/products',
      textColor: 'light' as const
    },
    {
      id: '2',
      title: '最新科技产品',
      subtitle: '创新科技',
      description: '体验最前沿的科技产品，让生活更加智能便捷',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop&auto=format',
      buttonText: '探索新品',
      buttonLink: '/products?sort=newest',
      textColor: 'light' as const
    },
    {
      id: '3',
      title: '品质生活',
      subtitle: '精选好物',
      description: '严选高品质商品，为您打造精致生活体验',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop&auto=format',
      buttonText: '精选推荐',
      buttonLink: '/products?featured=true',
      textColor: 'light' as const
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Carousel */}
      <Carousel 
        slides={carouselSlides}
        autoPlay={true}
        autoPlayInterval={5000}
        showDots={true}
        showArrows={true}
        className=""
      />

      {/* Welcome Section */}
      <section className="relative py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
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

          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            欢迎来到
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> ShopNext</span>
          </h2>

          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            为您提供最优质的购物体验，让购物变得更加简单和愉快
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3 font-semibold shadow-lg">
              <Link href="/products">
                开始购物
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3 font-semibold">
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

      {/* Hot Products Section */}
      <ProductSection 
        title="热销推荐" 
        description="人气爆款商品，销量领先，品质保证"
        type="hot" 
        limit={4}
        className="bg-white"
      />

      {/* New Products Section */}
      <ProductSection 
        title="新品上架" 
        description="最新到货商品，抢先体验最新科技"
        type="new" 
        limit={4}
        className="bg-gray-50"
      />

      {/* Special Offers Section */}
      <section className="py-16 bg-gradient-to-r from-orange-400 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Gift className="h-8 w-8 text-yellow-300 mr-3" />
            <span className="text-yellow-300 font-semibold text-lg">限时特惠</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">每日精选特价</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            每天为您推荐精选特价商品，品质保证，价格优惠
          </p>
          <Button asChild size="lg" className="bg-white text-orange-500 hover:bg-gray-100 text-lg px-8 py-3 font-semibold shadow-lg">
            <Link href="/products?sale=true">
              查看特价商品
              <Star className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products Section */}
      <ProductSection 
        title="精选推荐" 
        description="编辑精选，为您推荐最值得购买的商品"
        type="featured" 
        limit={4}
        className="bg-white"
      />

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
