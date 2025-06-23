'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { PAGE_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
  className?: string;
}

export function CartItem({ item, className }: CartItemProps) {
  const { updateItem, removeItem, isActionLoading } = useCartStore();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stockQuantity) {
      return;
    }

    try {
      await updateItem(item.id, newQuantity);
    } catch (error) {
      console.error('Failed to update item quantity:', error);
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(item.id);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const primaryImage = item.product.images?.[0] || '/placeholder-product.jpg';
  const subtotal = item.price * item.quantity;
  const isUpdating = isActionLoading(`update-${item.id}`);
  const isRemoving = isActionLoading(`remove-${item.id}`);
  const isProcessing = isUpdating || isRemoving;

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg',
      isProcessing && 'opacity-50 pointer-events-none',
      className
    )}>
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Link href={PAGE_ROUTES.product(item.product.slug)}>
          <div className="w-20 h-20 relative overflow-hidden rounded-md bg-gray-100">
            <Image
              src={primaryImage}
              alt={item.product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              sizes="80px"
            />
          </div>
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={PAGE_ROUTES.product(item.product.slug)}
          className="block hover:text-blue-600 transition-colors"
        >
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {item.product.name}
          </h3>
        </Link>
        
        {item.product.shortDescription && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {item.product.shortDescription}
          </p>
        )}

        {item.product.sku && (
          <p className="text-xs text-gray-400 mt-1">
            SKU: {item.product.sku}
          </p>
        )}

        {/* Stock Status */}
        <div className="mt-2">
          {item.product.stockQuantity === 0 ? (
            <span className="text-xs text-red-600 font-medium">缺货</span>
          ) : item.product.stockQuantity < 10 ? (
            <span className="text-xs text-yellow-600">
              仅剩 {item.product.stockQuantity} 件
            </span>
          ) : (
            <span className="text-xs text-green-600">现货充足</span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">
          ¥{item.price.toFixed(2)}
        </div>
        {item.product.originalPrice && item.product.originalPrice > item.price && (
          <div className="text-xs text-gray-500 line-through">
            ¥{item.product.originalPrice.toFixed(2)}
          </div>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || isProcessing}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="px-3 py-1 text-sm text-center min-w-[3rem]">
            {item.quantity}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.product.stockQuantity || isProcessing}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[80px]">
        <div className="text-sm font-bold text-gray-900">
          ¥{subtotal.toFixed(2)}
        </div>
      </div>

      {/* Remove Button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isProcessing}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
