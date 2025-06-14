'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { API_ROUTES, PAGE_ROUTES } from '@/lib/constants';
import { Order } from '@/types';
import { 
  ArrowLeft, Package, MapPin, CreditCard, FileText, 
  Calendar, CheckCircle, AlertCircle, Truck, Phone, User 
} from 'lucide-react';

const ORDER_STATUS_CONFIG = {
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  processing: { label: '处理中', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: '已送达', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  refunded: { label: '已退款', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800' },
  failed: { label: '支付失败', color: 'bg-red-100 text-red-800' },
  refunded: { label: '已退款', color: 'bg-gray-100 text-gray-800' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  const orderId = params.id as string;
  const isNewOrder = searchParams.get('created') === 'true';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`${PAGE_ROUTES.login}?redirect=${encodeURIComponent(`/orders/${orderId}`)}`);
      return;
    }
  }, [isAuthenticated, router, orderId]);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated || !orderId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ROUTES.orders.detail(orderId));
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || '获取订单详情失败');
        }

        setOrder(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取订单详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, orderId]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-64 mb-6" />
            <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
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
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="space-x-4">
              <Button onClick={() => window.location.reload()}>重试</Button>
              <Button variant="outline" asChild>
                <Link href={PAGE_ROUTES.orders}>返回订单列表</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const StatusIcon = ORDER_STATUS_CONFIG[order.status].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
            <Link href={PAGE_ROUTES.orders}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回订单列表
            </Link>
          </Button>
        </div>

        {/* Success Message for New Orders */}
        {isNewOrder && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">订单创建成功！</h3>
              <p className="text-sm text-green-700 mt-1">
                我们已收到您的订单，将在1-2个工作日内联系您确认订单详情。
              </p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">订单详情</h1>
              <p className="text-gray-600">订单号: {order.orderNumber}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className="h-5 w-5" />
                <Badge className={ORDER_STATUS_CONFIG[order.status].color}>
                  {ORDER_STATUS_CONFIG[order.status].label}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                创建时间: {new Date(order.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                订单商品
              </h2>
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      {item.product?.shortDescription && (
                        <p className="text-sm text-gray-500 mt-1">{item.product.shortDescription}</p>
                      )}
                      {item.productSku && (
                        <p className="text-xs text-gray-400 mt-1">SKU: {item.productSku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">¥{item.unitPrice.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">× {item.quantity}</p>
                      <p className="font-semibold text-gray-900 mt-1">¥{item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                收货地址
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{order.shippingAddress.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{order.shippingAddress.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p>
                      {order.shippingAddress.province} {order.shippingAddress.city} {order.shippingAddress.district}
                    </p>
                    <p>{order.shippingAddress.address}</p>
                    {order.shippingAddress.postalCode && (
                      <p className="text-sm text-gray-500">邮编: {order.shippingAddress.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  订单备注
                </h2>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Payment Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  支付信息
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">支付状态</span>
                    <Badge className={PAYMENT_STATUS_CONFIG[order.paymentStatus].color}>
                      {PAYMENT_STATUS_CONFIG[order.paymentStatus].label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支付方式</span>
                    <span className="text-gray-900">
                      {order.paymentMethod === 'manual_review' ? '人工审核' : 
                       order.paymentMethod === 'bank_transfer' ? '银行转账' : '货到付款'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">价格明细</h2>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">商品小计</span>
                    <span className="text-gray-900">¥{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">运费</span>
                    <span className="text-gray-900">¥{order.shippingAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">税费</span>
                    <span className="text-gray-900">¥{order.taxAmount.toFixed(2)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">优惠</span>
                      <span className="text-red-600">-¥{order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">总计</span>
                      <span className="text-gray-900">¥{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">订单操作</h2>
                
                <div className="space-y-3">
                  {order.status === 'pending' && (
                    <Button variant="outline" className="w-full">
                      取消订单
                    </Button>
                  )}
                  
                  {order.status === 'shipped' && (
                    <Button className="w-full">
                      <Truck className="h-4 w-4 mr-2" />
                      查看物流
                    </Button>
                  )}
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link href={PAGE_ROUTES.products}>
                      继续购物
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
