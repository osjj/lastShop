'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { API_ROUTES, PAGE_ROUTES } from '@/lib/constants';
import { Order } from '@/types';
import { Package, Eye, Calendar, CreditCard, Truck, AlertCircle } from 'lucide-react';

const ORDER_STATUS_CONFIG = {
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800' },
  processing: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: '已送达', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
  refunded: { label: '已退款', color: 'bg-red-100 text-red-800' },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800' },
  failed: { label: '支付失败', color: 'bg-red-100 text-red-800' },
  refunded: { label: '已退款', color: 'bg-gray-100 text-gray-800' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`${PAGE_ROUTES.login}?redirect=${encodeURIComponent('/orders')}`);
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ROUTES.orders.list);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || '获取订单列表失败');
        }

        setOrders(result.data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取订单列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-64 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-48" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>重试</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的订单</h1>
          <p className="text-gray-600">查看和管理您的订单</p>
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <Package className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">暂无订单</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              您还没有任何订单。快去挑选您喜欢的商品吧！
            </p>
            <Button asChild size="lg">
              <Link href={PAGE_ROUTES.products}>开始购物</Link>
            </Button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        订单号: {order.orderNumber}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {order.paymentMethod === 'manual_review' ? '人工审核' : 
                           order.paymentMethod === 'bank_transfer' ? '银行转账' : '货到付款'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        ¥{order.totalAmount.toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={ORDER_STATUS_CONFIG[order.status].color}>
                          {ORDER_STATUS_CONFIG[order.status].label}
                        </Badge>
                        <Badge className={PAYMENT_STATUS_CONFIG[order.paymentStatus].color}>
                          {PAYMENT_STATUS_CONFIG[order.paymentStatus].label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.productName}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-500">
                            ¥{item.unitPrice.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ¥{item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 3 && (
                      <div className="text-center text-sm text-gray-500">
                        还有 {order.items.length - 3} 件商品...
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      共 {order.items.length} 件商品
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={PAGE_ROUTES.order(order.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </Link>
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          取消订单
                        </Button>
                      )}
                      
                      {order.status === 'shipped' && (
                        <Button size="sm">
                          <Truck className="h-4 w-4 mr-2" />
                          查看物流
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
