'use client';

import { useState } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

interface ProductFiltersProps {
  categories?: Category[];
  selectedCategory?: string;
  selectedBrand?: string;
  priceRange?: [number, number];
  sortBy?: string;
  onCategoryChange?: (categoryId: string) => void;
  onBrandChange?: (brandId: string) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onSortChange?: (sortBy: string) => void;
  onClearFilters?: () => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: '最新上架' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'rating', label: '评分最高' },
  { value: 'sales', label: '销量最高' },
];

const PRICE_RANGES = [
  { value: [0, 100], label: '¥0 - ¥100' },
  { value: [100, 500], label: '¥100 - ¥500' },
  { value: [500, 1000], label: '¥500 - ¥1000' },
  { value: [1000, 5000], label: '¥1000 - ¥5000' },
  { value: [5000, Infinity], label: '¥5000以上' },
];

export function ProductFilters({
  categories = [],
  selectedCategory,
  selectedBrand,
  priceRange,
  sortBy = 'newest',
  onCategoryChange,
  onPriceRangeChange,
  onSortChange,
  onClearFilters,
  className,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = selectedCategory || selectedBrand || priceRange;

  return (
    <div className={className}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            筛选条件
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                已筛选
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`lg:block ${isOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">筛选条件</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4 mr-1" />
                清除
              </Button>
            </div>
          )}

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              排序方式
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                商品分类
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!selectedCategory}
                    onChange={() => onCategoryChange?.('')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">全部分类</span>
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={selectedCategory === category.id}
                      onChange={() => onCategoryChange?.(category.id)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                    {category.productCount && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({category.productCount})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              价格区间
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priceRange"
                  checked={!priceRange}
                  onChange={() => onPriceRangeChange?.(undefined as [number, number] | undefined)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">不限价格</span>
              </label>
              {PRICE_RANGES.map((range, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={
                      priceRange &&
                      priceRange[0] === range.value[0] &&
                      priceRange[1] === range.value[1]
                    }
                    onChange={() => onPriceRangeChange?.(range.value as [number, number])}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
