import { Header } from '@/components/layout/header';
import { 
  ShoppingBag, 
  Users, 
  Award, 
  Truck, 
  Shield, 
  Heart,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">关于 ShopNext</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ShopNext 是一个现代化的电商平台，致力于为用户提供最优质的购物体验。
            我们使用最新的技术栈，打造安全、快速、美观的在线购物环境。
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">丰富商品</h3>
            <p className="text-gray-600">
              精选优质商品，涵盖各个品类，满足您的不同需求
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">快速配送</h3>
            <p className="text-gray-600">
              全国范围内快速配送，大部分地区24小时内送达
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">安全保障</h3>
            <p className="text-gray-600">
              采用最新的安全技术，保护您的个人信息和支付安全
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">品质保证</h3>
            <p className="text-gray-600">
              严格的质量把控，确保每一件商品都符合高标准
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">贴心服务</h3>
            <p className="text-gray-600">
              专业的客服团队，7x24小时为您提供优质服务
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">用户至上</h3>
            <p className="text-gray-600">
              以用户体验为中心，不断优化和改进我们的服务
            </p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">技术栈</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-4 mb-3">
                <h3 className="font-semibold text-blue-900">Next.js 15</h3>
              </div>
              <p className="text-sm text-gray-600">现代化React框架</p>
            </div>
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4 mb-3">
                <h3 className="font-semibold text-green-900">Supabase</h3>
              </div>
              <p className="text-sm text-gray-600">云端数据库服务</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-50 rounded-lg p-4 mb-3">
                <h3 className="font-semibold text-purple-900">Tailwind CSS</h3>
              </div>
              <p className="text-sm text-gray-600">现代化样式框架</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-50 rounded-lg p-4 mb-3">
                <h3 className="font-semibold text-yellow-900">TypeScript</h3>
              </div>
              <p className="text-sm text-gray-600">类型安全开发</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">联系我们</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">邮箱</h3>
              <p className="text-blue-100">contact@shopnext.com</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">电话</h3>
              <p className="text-blue-100">400-123-4567</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">地址</h3>
              <p className="text-blue-100">北京市朝阳区科技园区</p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">我们的使命</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            通过技术创新和优质服务，让每一次购物都成为愉快的体验。
            我们相信，好的产品和服务能够让生活更美好，让世界更精彩。
          </p>
        </div>
      </div>
    </div>
  );
}
