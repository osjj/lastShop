'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { PAGE_ROUTES } from '@/lib/constants';

interface CartSummaryProps {
  className?: string;
  showCheckoutButton?: boolean;
}

export function CartSummary({ className, showCheckoutButton = true }: CartSummaryProps) {
  const { items, total, itemCount } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed_amount';
  } | null>(null);

  // Calculate totals
  const subtotal = total;
  const shipping = subtotal >= 99 ? 0 : 15; // Free shipping over ¥99
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (subtotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0;
  const finalTotal = subtotal + shipping - couponDiscount;

  const handleApplyCoupon = () => {
    // TODO: Implement coupon validation
    if (couponCode.toLowerCase() === 'welcome10') {
      setAppliedCoupon({
        code: 'WELCOME10',
        discount: 10,
        type: 'percentage',
      });
    } else if (couponCode.toLowerCase() === 'save50') {
      setAppliedCoupon({
        code: 'SAVE50',
        discount: 50,
        type: 'fixed_amount',
      });
    }
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  if (items.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">购物车为空</h3>
          <p className="text-gray-500 mb-4">快去挑选您喜欢的商品吧！</p>
          <Button asChild>
            <Link href={PAGE_ROUTES.products}>开始购物</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">订单摘要</h2>

      {/* Order Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">商品小计 ({itemCount} 件)</span>
          <span className="text-gray-900">¥{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">运费</span>
          <span className="text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600">免费</span>
            ) : (
              `¥${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {shipping > 0 && (
          <div className="text-xs text-gray-500">
            满 ¥99 免运费，还差 ¥{(99 - subtotal).toFixed(2)}
          </div>
        )}

        {appliedCoupon && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              优惠券 ({appliedCoupon.code})
              <button
                onClick={handleRemoveCoupon}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                移除
              </button>
            </span>
            <span className="text-green-600">
              -¥{couponDiscount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between text-base font-semibold">
            <span className="text-gray-900">总计</span>
            <span className="text-gray-900">¥{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Coupon Code */}
      {!appliedCoupon && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="inline h-4 w-4 mr-1" />
            优惠券代码
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="输入优惠券代码"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim()}
              variant="outline"
              size="sm"
            >
              应用
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            试试：WELCOME10 (10%折扣) 或 SAVE50 (减50元)
          </div>
        </div>
      )}

      {/* Checkout Button */}
      {showCheckoutButton && (
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href={PAGE_ROUTES.checkout}>
              立即结账
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href={PAGE_ROUTES.products}>
              继续购物
            </Link>
          </Button>
        </div>
      )}

      {/* Security Notice */}
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
  );
}
