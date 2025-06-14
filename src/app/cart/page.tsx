'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { PAGE_ROUTES } from '@/lib/constants';

export default function CartPage() {
  const { items, isLoading, loadCart, clearCart } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleClearCart = async () => {
    if (window.confirm('确定要清空购物车吗？')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg" />
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-lg" />
            </div>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
              <Link href={PAGE_ROUTES.products}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                继续购物
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart className="h-8 w-8" />
              购物车
              {items.length > 0 && (
                <span className="text-lg font-normal text-gray-600">
                  ({items.length} 件商品)
                </span>
              )}
            </h1>
            
            {items.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                清空购物车
              </Button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">购物车为空</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              您的购物车中还没有任何商品。快去挑选您喜欢的商品吧！
            </p>
            <div className="space-y-4">
              <Button asChild size="lg">
                <Link href={PAGE_ROUTES.products}>开始购物</Link>
              </Button>
              <div>
                <Button variant="outline" asChild>
                  <Link href={PAGE_ROUTES.home}>返回首页</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  商品清单
                </h2>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Bulk Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      共 {items.length} 件商品
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={PAGE_ROUTES.products}>
                          继续购物
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <CartSummary />
              </div>
            </div>
          </div>
        )}

        {/* Recently Viewed or Recommended Products */}
        {items.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">您可能还喜欢</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center text-gray-500 py-8">
                推荐商品功能即将上线...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
