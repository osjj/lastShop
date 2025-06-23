'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { API_ROUTES, PAGE_ROUTES } from '@/lib/constants';
import { CheckoutForm, CheckoutItem } from '@/types';
import { ArrowLeft, CreditCard, Truck, MapPin, FileText, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutForm>({
    shippingAddress: {
      name: '',
      phone: '',
      country: '中国',
      province: '',
      city: '',
      district: '',
      address: '',
      postalCode: '',
    },
    paymentMethod: 'bank_transfer',
    notes: '',
    useBillingAsSame: true,
  });

  // Redirect if not authenticated
  useEffect(() => {
    // Wait for auth state to be determined
    const { isLoading } = useAuthStore.getState();

    if (!isLoading && !isAuthenticated) {
      router.push(`${PAGE_ROUTES.login}?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }
  }, [isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push(PAGE_ROUTES.cart);
      return;
    }
  }, [items.length, router]);

  // Load user's default address if available
  useEffect(() => {
    if (user && user.firstName && user.lastName) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          name: `${user.firstName} ${user.lastName}`,
        },
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string, isAddress = true) => {
    if (isAddress) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check authentication again before submitting
      if (!isAuthenticated || !user) {
        throw new Error('请先登录后再提交订单');
      }

      // Validate form
      const { shippingAddress } = formData;
      if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.province ||
          !shippingAddress.city || !shippingAddress.address) {
        throw new Error('请填写完整的收货地址信息');
      }

      // Prepare order items
      const orderItems: CheckoutItem[] = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      // Create order
      const response = await fetch(API_ROUTES.orders.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: formData.shippingAddress,
          billingAddress: formData.useBillingAsSame ? formData.shippingAddress : formData.billingAddress,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('登录已过期，请重新登录');
        }
        throw new Error(result.error?.message || '创建订单失败');
      }

      if (!result.success) {
        throw new Error(result.error?.message || '创建订单失败');
      }

      // Clear cart and redirect to order confirmation
      await clearCart();
      router.push(`/orders/${result.data.orderId}?created=true`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建订单失败';
      setError(errorMessage);

      // If authentication error, redirect to login
      if (errorMessage.includes('登录') || errorMessage.includes('认证')) {
        setTimeout(() => {
          router.push(`${PAGE_ROUTES.login}?redirect=${encodeURIComponent('/checkout')}`);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate order summary
  const subtotal = total;
  const taxAmount = 0; // 可以根据需要计算税费
  const shippingAmount = 0; // 可以根据需要计算运费
  const discountAmount = 0; // 可以根据需要计算折扣
  const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

  // Show loading while auth state is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
            <Link href={PAGE_ROUTES.cart}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回购物车
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            安全结账
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            请填写订单信息并完成银行转账，我们将在确认收款后安排发货
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            SSL 安全加密 | 信息安全保护
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">订单创建失败</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">收货地址</h2>
                    <p className="text-sm text-gray-500">请确认您的收货地址信息</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">收货人姓名 *</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.shippingAddress.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="请输入收货人姓名"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">联系电话 *</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="请输入联系电话"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">省份 *</label>
                    <input
                      type="text"
                      id="province"
                      value={formData.shippingAddress.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      placeholder="请输入省份"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">城市 *</label>
                    <input
                      type="text"
                      id="city"
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="请输入城市"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">区县</label>
                    <input
                      type="text"
                      id="district"
                      value={formData.shippingAddress.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="请输入区县"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">邮政编码</label>
                    <input
                      type="text"
                      id="postalCode"
                      value={formData.shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="请输入邮政编码"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">详细地址 *</label>
                  <input
                    type="text"
                    id="address"
                    value={formData.shippingAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="请输入详细地址"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Method - Bank Transfer */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">支付方式</h2>
                    <p className="text-sm text-gray-500">银行转账 - 安全可靠</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">银</span>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">收款银行信息</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 rounded-lg p-3">
                      <span className="text-blue-700 font-medium block mb-1">银行名称</span>
                      <span className="text-blue-900 font-semibold">中国工商银行</span>
                    </div>
                    <div className="bg-white/50 rounded-lg p-3">
                      <span className="text-blue-700 font-medium block mb-1">账户名称</span>
                      <span className="text-blue-900 font-semibold">ShopNext 电商有限公司</span>
                    </div>
                    <div className="bg-white/50 rounded-lg p-3">
                      <span className="text-blue-700 font-medium block mb-1">银行账号</span>
                      <span className="text-blue-900 font-mono font-bold text-lg">6222 0202 0000 1234 567</span>
                    </div>
                    <div className="bg-white/50 rounded-lg p-3">
                      <span className="text-blue-700 font-medium block mb-1">开户行</span>
                      <span className="text-blue-900 font-semibold">工商银行北京分行营业部</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <h4 className="font-semibold text-amber-800">重要提醒</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-amber-700">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">1.</span>
                      <span>请在转账备注中填写您的订单号</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">2.</span>
                      <span>转账金额必须与订单总金额一致</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">3.</span>
                      <span>确认收款后1-2个工作日内发货</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">4.</span>
                      <span>客服电话：400-123-4567</span>
                    </div>
                  </div>
                </div>

                <input type="hidden" name="paymentMethod" value="bank_transfer" />
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">订单备注</h2>
                </div>

                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value, false)}
                  placeholder="如有特殊要求，请在此说明..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 text-lg py-6"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold">创建订单中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5" />
                      <span className="font-semibold">提交订单并获取银行信息</span>
                    </div>
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  点击提交后，您将获得订单号和详细的银行转账信息
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">订单摘要</h2>
                </div>
                
                {/* Items */}
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-gray-500">数量: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">商品小计</span>
                    <span className="text-gray-900 font-medium">¥{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">运费</span>
                    <span className="text-green-600 font-medium">
                      {shippingAmount === 0 ? '免费' : `¥${shippingAmount.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">税费</span>
                    <span className="text-gray-900 font-medium">¥{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">总计</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ¥{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    安全结账，信息加密保护
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
