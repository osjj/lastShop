import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ShopNext</h1>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                首页
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">
                商品
              </Link>
              <Button>登录</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            欢迎来到 <span className="text-yellow-300">ShopNext</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            现代化的电商平台，为您提供最优质的购物体验
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              开始购物
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">为什么选择我们</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">优质商品</h3>
              <p className="text-gray-600">精选全球优质商品，品质保证</p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">五星服务</h3>
              <p className="text-gray-600">专业客服团队，贴心服务体验</p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">快速配送</h3>
              <p className="text-gray-600">全国快速配送，24小时内送达</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">热门商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 flex items-center justify-center text-4xl">
                  📱
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 text-gray-900">商品名称 {item}</h3>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(128)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-600">¥299</span>
                    <Button size="sm">加入购物车</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ShoppingBag className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">ShopNext</span>
          </div>
          <p className="text-gray-400 mb-4">现代化的电商平台，为您提供最优质的购物体验</p>
          <p className="text-gray-500">&copy; 2024 ShopNext. 保留所有权利。</p>
        </div>
      </footer>
    </div>
  );
}
