'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { Product } from '@/types';
import { API_ROUTES } from '@/lib/constants';
import { ArrowRight, Flame, Sparkles, Star } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  description?: string;
  type: 'hot' | 'new' | 'featured' | 'recommended';
  limit?: number;
  className?: string;
}

const sectionConfig = {
  hot: {
    icon: Flame,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    params: '?limit=8&sort=popularity',
  },
  new: {
    icon: Sparkles,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    params: '?limit=8&sort=newest',
  },
  featured: {
    icon: Star,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    params: '?limit=8&featured=true',
  },
  recommended: {
    icon: Star,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    params: '?limit=8&recommended=true',
  },
};

export function ProductSection({ 
  title, 
  description, 
  type, 
  limit = 8,
  className = ''
}: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const config = sectionConfig[type];
  const IconComponent = config.icon;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_ROUTES.products.list}${config.params}&limit=${limit}`);
        const result = await response.json();

        if (result.success && result.data?.products) {
          setProducts(result.data.products);
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} products:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type, limit, config.params]);

  // Fallback static products for each type
  const getFallbackProducts = () => {
    const baseProducts = [
      {
        id: `${type}-1`,
        name: type === 'hot' ? 'iPhone 15 Pro Max' : type === 'new' ? 'MacBook Pro M3' : 'AirPods Pro',
        price: type === 'hot' ? 9999 : type === 'new' ? 15999 : 1999,
        originalPrice: type === 'hot' ? 10999 : type === 'new' ? 17999 : 2499,
        slug: `${type}-product-1`,
        images: ['/placeholder-product.jpg'],
        stockQuantity: 10,
        categoryId: '1',
        shortDescription: type === 'hot' ? '最受欢迎的旗舰手机' : type === 'new' ? '最新发布的专业级笔记本' : '顶级无线耳机',
        rating: 4.8,
        reviewCount: 256,
        status: 'active' as const,
        isFeatured: type === 'featured',
        isDigital: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${type}-2`,
        name: type === 'hot' ? 'Nike Air Jordan' : type === 'new' ? 'iPad Pro 2024' : 'Apple Watch',
        price: type === 'hot' ? 1299 : type === 'new' ? 8999 : 3199,
        originalPrice: type === 'hot' ? 1599 : type === 'new' ? 9999 : 3999,
        slug: `${type}-product-2`,
        images: ['/placeholder-product.jpg'],
        stockQuantity: 15,
        categoryId: '2',
        shortDescription: type === 'hot' ? '经典运动鞋款' : type === 'new' ? '最新平板电脑' : '智能手表',
        rating: 4.6,
        reviewCount: 189,
        status: 'active' as const,
        isFeatured: type === 'featured',
        isDigital: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${type}-3`,
        name: type === 'hot' ? 'Sony WH-1000XM5' : type === 'new' ? 'Samsung Galaxy S24' : 'Dell XPS 13',
        price: type === 'hot' ? 2299 : type === 'new' ? 6999 : 8999,
        originalPrice: type === 'hot' ? 2599 : type === 'new' ? 7999 : 9999,
        slug: `${type}-product-3`,
        images: ['/placeholder-product.jpg'],
        stockQuantity: 8,
        categoryId: '1',
        shortDescription: type === 'hot' ? '顶级降噪耳机' : type === 'new' ? '最新旗舰手机' : '轻薄笔记本',
        rating: 4.7,
        reviewCount: 142,
        status: 'active' as const,
        isFeatured: type === 'featured',
        isDigital: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${type}-4`,
        name: type === 'hot' ? 'Adidas Ultraboost' : type === 'new' ? 'Surface Laptop 6' : 'Canon EOS R6',
        price: type === 'hot' ? 1199 : type === 'new' ? 12999 : 15999,
        originalPrice: type === 'hot' ? 1499 : type === 'new' ? 14999 : 17999,
        slug: `${type}-product-4`,
        images: ['/placeholder-product.jpg'],
        stockQuantity: 12,
        categoryId: '2',
        shortDescription: type === 'hot' ? '专业跑步鞋' : type === 'new' ? '新款二合一笔记本' : '专业相机',
        rating: 4.5,
        reviewCount: 203,
        status: 'active' as const,
        isFeatured: type === 'featured',
        isDigital: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return baseProducts.slice(0, Math.min(limit, 4));
  };

  const displayProducts = products.length > 0 ? products : getFallbackProducts();

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center mr-4`}>
              <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          </div>
          {description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {loading ? (
            // Loading skeleton
            [...Array(limit)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded mb-3 w-1/2"></div>
                  <div className="h-9 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className={`rounded-xl ${config.borderColor} hover:shadow-lg transition-shadow duration-300`}
              />
            ))
          )}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className={`${config.borderColor} ${config.iconColor} hover:bg-gray-50`}
          >
            <Link href="/products">
              查看更多{title}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}