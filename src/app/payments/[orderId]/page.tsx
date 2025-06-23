'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { API_ROUTES, PAGE_ROUTES } from '@/lib/constants';
import { Order } from '@/types';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  QrCode,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface PaymentData {
  paymentMethod: string;
  orderId: string;
  amount: string;
  qrCode?: string;
  bankInfo?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchName: string;
    swift?: string;
  };
  instructions: string[];
  expireTime: string;
}

const PAYMENT_METHODS = [
  {
    id: 'alipay',
    name: '支付宝',
    icon: Smartphone,
    description: '使用支付宝扫码支付',
    color: 'bg-blue-500',
  },
  {
    id: 'wechat',
    name: '微信支付',
    icon: Smartphone,
    description: '使用微信扫码支付',
    color: 'bg-green-500',
  },
  {
    id: 'bank_transfer',
    name: '银行转账',
    icon: Building2,
    description: '通过银行转账支付',
    color: 'bg-gray-500',
  },
];

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('alipay');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(
        `${PAGE_ROUTES.login}?redirect=${encodeURIComponent(`/payments/${orderId}`)}`
      );
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

        const orderData = result.data;

        // Check if order can be paid
        if (orderData.paymentStatus === 'paid') {
          router.push(`/orders/${orderId}`);
          return;
        }

        if (orderData.status === 'cancelled') {
          throw new Error('订单已取消，无法支付');
        }

        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取订单详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, orderId, router]);

  const handlePayment = async () => {
    if (!order) return;

    try {
      setPaymentLoading(true);
      setError(null);

      const response = await fetch(API_ROUTES.payments.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: selectedPaymentMethod,
          amount: order.totalAmount.toString(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || '创建支付订单失败');
      }

      setPaymentData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建支付订单失败');
    } finally {
      setPaymentLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const checkPaymentStatus = async () => {
    if (!order) return;

    try {
      const response = await fetch(API_ROUTES.orders.detail(order.id));
      const result = await response.json();

      if (result.success && result.data.paymentStatus === 'paid') {
        router.push(`/orders/${order.id}?paid=true`);
      }
    } catch (err) {
      console.error('Failed to check payment status:', err);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 h-6 w-32 rounded bg-gray-200" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 text-red-500">
              <AlertCircle className="mx-auto h-12 w-12" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">加载失败</h3>
            <p className="mb-4 text-gray-500">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="text-gray-600 hover:text-gray-900"
          >
            <Link href={`/orders/${orderId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回订单详情
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">订单支付</h1>
          <p className="text-gray-600">订单号: {order.orderNumber}</p>
          <div className="mt-2">
            <Badge className="bg-yellow-100 text-yellow-800">
              待支付 - ¥{order.totalAmount.toFixed(2)}
            </Badge>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <h3 className="text-sm font-medium text-red-800">支付失败</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            {!paymentData ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-6 text-lg font-semibold text-gray-900">
                  选择支付方式
                </h2>

                <div className="mb-6 space-y-4">
                  {PAYMENT_METHODS.map(method => {
                    const IconComponent = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                          selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } `}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full ${method.color} flex items-center justify-center`}
                          >
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {method.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {method.description}
                            </p>
                          </div>
                          <div
                            className={`h-4 w-4 rounded-full border-2 ${
                              selectedPaymentMethod === method.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            } `}
                          >
                            {selectedPaymentMethod === method.id && (
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500">
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  loading={paymentLoading}
                  className="w-full"
                  size="lg"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    立即支付
                  </div>
                </Button>
              </div>
            ) : (
              /* Payment Details */
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    支付详情
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkPaymentStatus}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    检查支付状态
                  </Button>
                </div>

                {paymentData.qrCode && (
                  <div className="mb-6 text-center">
                    <div className="inline-block rounded-lg border-2 border-gray-200 bg-white p-4">
                      <QrCode className="h-32 w-32 text-gray-400" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      请使用
                      {paymentData.paymentMethod === 'alipay'
                        ? '支付宝'
                        : '微信'}
                      扫描二维码
                    </p>
                  </div>
                )}

                {paymentData.bankInfo && (
                  <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">
                      收款银行信息
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-700">
                          银行名称：
                        </span>
                        <span className="text-blue-900">
                          {paymentData.bankInfo.bankName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-700">
                          账户名称：
                        </span>
                        <span className="text-blue-900">
                          {paymentData.bankInfo.accountName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-700">
                          银行账号：
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-blue-900">
                            {paymentData.bankInfo.accountNumber}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              copyToClipboard(
                                paymentData.bankInfo!.accountNumber,
                                'account'
                              )
                            }
                          >
                            {copySuccess === 'account' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-700">
                          开户行：
                        </span>
                        <span className="text-blue-900">
                          {paymentData.bankInfo.branchName}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-800">
                    <Clock className="h-4 w-4" />
                    支付说明
                  </h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    {paymentData.instructions.map((instruction, index) => (
                      <li key={index}>• {instruction}</li>
                    ))}
                  </ul>
                  <div className="mt-3 border-t border-yellow-200 pt-3">
                    <p className="text-xs text-yellow-600">
                      支付有效期至:{' '}
                      {new Date(paymentData.expireTime).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setPaymentData(null)}
                    className="mr-4"
                  >
                    更换支付方式
                  </Button>
                  <Button onClick={checkPaymentStatus}>我已完成支付</Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  订单摘要
                </h2>

                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">商品小计</span>
                    <span className="text-gray-900">
                      ¥{order.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">运费</span>
                    <span className="text-gray-900">
                      ¥{order.shippingAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">税费</span>
                    <span className="text-gray-900">
                      ¥{order.taxAmount.toFixed(2)}
                    </span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">优惠</span>
                      <span className="text-red-600">
                        -¥{order.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">应付金额</span>
                      <span className="text-gray-900">
                        ¥{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-500">
                  <div className="flex items-center justify-center gap-1">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    安全支付，信息加密保护
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
