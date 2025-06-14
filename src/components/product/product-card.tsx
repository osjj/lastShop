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
  const { addItem, isLoading } = useCartStore();

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
      'group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200',
      className
    )}>
      {/* Product Image - Clickable area for navigation */}
      <Link href={PAGE_ROUTES.product(product.slug)}>
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}

          {/* Stock Status */}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium">缺货</span>
            </div>
          )}

          {/* Wishlist Button */}
          {showWishlist && (
            <button
              onClick={handleWishlist}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
              aria-label="添加到收藏夹"
            >
              <Heart className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
      </Link>

      {/* Product Info - Separate from Link to allow button interaction */}
      <div className="p-4">
        {/* Product Name - Clickable for navigation */}
        <Link href={PAGE_ROUTES.product(product.slug)}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {product.shortDescription}
          </p>
        )}

        {/* Rating */}
        {product.rating && product.reviewCount && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            ¥{product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ¥{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button - Outside of Link to prevent navigation */}
        {showAddToCart && (
          <Button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0 || isLoading}
            className="w-full"
            size="sm"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                添加中...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                {product.stockQuantity === 0 ? '缺货' : '加入购物车'}
              </div>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
