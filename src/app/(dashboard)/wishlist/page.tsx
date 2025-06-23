'use client';

import { useState } from 'react';
import { Heart, ShoppingCart, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 7999,
      image: '/api/placeholder/200/200',
      rating: 4.8,
      inStock: true,
      addedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'MacBook Air M3',
      price: 8999,
      image: '/api/placeholder/200/200',
      rating: 4.9,
      inStock: false,
      addedAt: '2024-01-10'
    }
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const addToCart = (item: any) => {
    console.log('添加到购物车:', item);
    // 这里可以集成实际的购物车逻辑
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
        <p className="text-gray-600">管理您收藏的商品</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">收藏夹为空</h3>
          <p className="text-gray-500 mb-6">浏览商品时点击心形图标即可收藏</p>
          <Button asChild>
            <a href="/products">去逛逛</a>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                收藏商品 ({wishlist.length})
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setWishlist([])}
              >
                清空收藏
              </Button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {wishlist.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">缺货</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        收藏于 {new Date(item.addedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-bold text-red-600">
                        ¥{item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {item.inStock ? '加入购物车' : '缺货'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}