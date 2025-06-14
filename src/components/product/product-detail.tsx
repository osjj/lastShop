'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Minus, Plus, Share2, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product: Product;
  className?: string;
}

export function ProductDetail({ product, className }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isLoading } = useCartStore();

  const handleAddToCart = async () => {
    try {
      await addItem(product, quantity);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const images = product.images?.length > 0 ? product.images : ['/placeholder-product.jpg'];

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-8', className)}>
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={images[selectedImageIndex]}
            alt={product.name}
            width={600}
            height={600}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  'aspect-square overflow-hidden rounded-md border-2 transition-colors',
                  selectedImageIndex === index
                    ? 'border-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={150}
                  height={150}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Title and Rating */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          {product.rating && product.reviewCount && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < Math.floor(product.rating!)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviewCount} 评价)
              </span>
            </div>
          )}

          {product.shortDescription && (
            <p className="text-gray-600">{product.shortDescription}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-red-600">
              ¥{product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-lg text-gray-500 line-through">
                  ¥{product.originalPrice.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                  省 ¥{(product.originalPrice - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>
          
          {discountPercentage > 0 && (
            <div className="text-sm text-red-600">
              限时优惠，立减 {discountPercentage}%
            </div>
          )}
        </div>

        {/* Stock Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">库存：</span>
            <span className={cn(
              'text-sm font-medium',
              product.stockQuantity > 10 ? 'text-green-600' : 
              product.stockQuantity > 0 ? 'text-yellow-600' : 'text-red-600'
            )}>
              {product.stockQuantity > 10 ? '现货充足' : 
               product.stockQuantity > 0 ? `仅剩 ${product.stockQuantity} 件` : '暂时缺货'}
            </span>
          </div>
          
          {product.sku && (
            <div className="text-sm text-gray-500">
              商品编号：{product.sku}
            </div>
          )}
        </div>

        {/* Quantity Selector */}
        {product.stockQuantity > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">数量：</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-3 py-1 text-center min-w-[3rem]">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stockQuantity}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-500">
                最多可购买 {product.stockQuantity} 件
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0 || isLoading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                添加中...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {product.stockQuantity === 0 ? '暂时缺货' : '加入购物车'}
              </div>
            )}
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Heart className="h-4 w-4 mr-2" />
              收藏
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">商品详情</h3>
            <div className="prose prose-sm max-w-none text-gray-600">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
