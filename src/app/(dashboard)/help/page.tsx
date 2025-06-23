'use client';

import { useState } from 'react';
import { 
  Search, MessageCircle, Phone, Mail, ChevronDown, 
  ChevronRight, HelpCircle, Book, ShoppingCart, 
  CreditCard, Package, RefreshCw, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const categories = [
    { value: 'all', label: '全部', icon: Book },
    { value: 'account', label: '账户问题', icon: Shield },
    { value: 'order', label: '订单相关', icon: ShoppingCart },
    { value: 'payment', label: '支付问题', icon: CreditCard },
    { value: 'shipping', label: '物流配送', icon: Package },
    { value: 'return', label: '退换货', icon: RefreshCw }
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: 'account',
      question: '如何重置我的密码？',
      answer: '您可以在登录页面点击"忘记密码"链接，输入您的邮箱地址，我们会发送重置密码的链接到您的邮箱。请注意检查垃圾邮件文件夹。'
    },
    {
      id: 2,
      category: 'account',
      question: '如何修改个人信息？',
      answer: '登录后进入"个人中心" > "个人资料"页面，您可以修改姓名、手机号等基本信息。修改后请点击保存按钮。'
    },
    {
      id: 3,
      category: 'order',
      question: '如何查看订单状态？',
      answer: '登录后进入"我的订单"页面，您可以查看所有订单的详细状态，包括已下单、已支付、已发货、已完成等状态。'
    },
    {
      id: 4,
      category: 'order',
      question: '可以取消订单吗？',
      answer: '未发货的订单可以取消。进入订单详情页面，点击"取消订单"按钮即可。已发货的订单需要走退货流程。'
    },
    {
      id: 5,
      category: 'payment',
      question: '支持哪些支付方式？',
      answer: '我们支持支付宝、微信支付、银行卡支付等多种支付方式。所有支付都通过安全的第三方支付平台处理。'
    },
    {
      id: 6,
      category: 'payment',
      question: '支付失败怎么办？',
      answer: '如果支付失败，请检查银行卡余额、网络连接等。您也可以尝试更换支付方式。如果问题持续，请联系客服。'
    },
    {
      id: 7,
      category: 'shipping',
      question: '一般多久能收到商品？',
      answer: '标准配送一般3-7个工作日送达，具体时间取决于您的收货地址。偏远地区可能需要额外1-2天。'
    },
    {
      id: 8,
      category: 'shipping',
      question: '可以修改收货地址吗？',
      answer: '未发货的订单可以修改收货地址。请及时联系客服或在订单详情页面修改。已发货的订单无法修改地址。'
    },
    {
      id: 9,
      category: 'return',
      question: '退货政策是什么？',
      answer: '商品在收到7天内，保持原包装和标签完整的情况下可以申请退货。特殊商品（如生鲜、个人定制等）不支持退货。'
    },
    {
      id: 10,
      category: 'return',
      question: '如何申请退换货？',
      answer: '在订单详情页面点击"申请退货"，填写退货原因，我们会在1-2个工作日内处理您的申请。'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">帮助中心</h1>
        <p className="text-gray-600">找到您需要的答案，或联系我们获取帮助</p>
      </div>

      {/* 搜索框 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索帮助内容..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 快速联系 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
          <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">在线客服</h3>
          <p className="text-sm text-gray-600 mb-4">9:00-21:00 在线为您服务</p>
          <Button className="w-full">开始对话</Button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
          <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">电话客服</h3>
          <p className="text-sm text-gray-600 mb-4">400-888-8888</p>
          <Button variant="outline" className="w-full">拨打电话</Button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
          <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">邮件支持</h3>
          <p className="text-sm text-gray-600 mb-4">support@shopnext.com</p>
          <Button variant="outline" className="w-full">发送邮件</Button>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">问题分类</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  selectedCategory === category.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 常见问题 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">常见问题</h3>
          {filteredFAQs.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              找到 {filteredFAQs.length} 个相关问题
            </p>
          )}
        </div>
        
        {filteredFAQs.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关问题</h3>
            <p className="text-gray-600 mb-4">尝试调整搜索关键词或选择其他分类</p>
            <Button variant="outline">联系客服</Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="p-6">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="flex items-center justify-between w-full text-left hover:text-blue-600 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="mt-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 没有找到答案 */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
        <h3 className="text-lg font-medium text-blue-900 mb-2">没有找到您需要的答案？</h3>
        <p className="text-blue-700 mb-4">我们的客服团队随时为您提供帮助</p>
        <div className="flex justify-center gap-4">
          <Button>联系在线客服</Button>
          <Button variant="outline">提交问题反馈</Button>
        </div>
      </div>
    </div>
  );
}