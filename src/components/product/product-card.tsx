'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { PAGE_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  showAddToCart?: boolean;
  showWishlist?: boolean;
}

export function ProductCard({
  product,
  className,
  showAddToCart = true,
  showWishlist = true,
}: ProductCardProps) {
  const { addItem, isItemLoading } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addItem(product, 1);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement wishlist functionality
    console.log('Add to wishlist:', product.id);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const primaryImage = product.images?.[0] || '/placeholder-product.jpg';

  return (
    <div className={cn(
      'group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden',
      className
    )}>
      {/* Product Image - Clickable area for navigation */}
      <Link href={PAGE_ROUTES.product(product.slug)}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span className="flex items-center gap-1">
                <span>🔥</span>
                -{discountPercentage}%
              </span>
            </div>
          )}

          {/* Stock Status */}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white/90 text-gray-900 font-semibold px-4 py-2 rounded-full">
                暂时缺货
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          {showWishlist && (
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
              aria-label="添加到收藏夹"
            >
              <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
            </button>
          )}

          {/* Quick View Badge */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
              点击查看
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info - Separate from Link to allow button interaction */}
      <div className="p-5">
        {/* Product Name - Clickable for navigation */}
        <Link href={PAGE_ROUTES.product(product.slug)}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 hover:text-blue-600 transition-colors cursor-pointer leading-relaxed">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Rating */}
        {product.rating && product.reviewCount && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {product.rating?.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-gray-900">
            ¥{product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ¥{product.originalPrice.toFixed(2)}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="text-xs text-green-600 font-semibold">
              省¥{(product.originalPrice! - product.price).toFixed(0)}
            </span>
          )}
        </div>

        {/* Add to Cart Button - Outside of Link to prevent navigation */}
        {showAddToCart && (
          <Button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0 || isItemLoading(product.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
            size="sm"
          >
            {isItemLoading(product.id) ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">添加中...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="font-medium">
                  {product.stockQuantity === 0 ? '暂时缺货' : '加入购物车'}
                </span>
              </div>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
