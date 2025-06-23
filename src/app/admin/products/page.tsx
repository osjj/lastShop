'use client';

import { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Edit, Trash2, 
  Eye, EyeOff, Star, MoreVertical, Grid, List
} from 'lucide-react';
import { ProductForm } from '@/components/admin/product-form';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  images: string[];
  isActive: boolean;
  featured: boolean;
  tags: string[];
  specifications: { [key: string]: string };
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // 实际项目中调用真实API
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      } else {
        // Fallback to mock data if API not available
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'iPhone 15 Pro',
            description: '最新的苹果旗舰手机，配备A17 Pro芯片',
            price: 8999,
            category: '电子产品',
            brand: 'Apple',
            stock: 25,
            images: ['/api/placeholder/300/300'],
            isActive: true,
            featured: true,
            tags: ['手机', '苹果', '旗舰'],
            specifications: {
              '屏幕尺寸': '6.1英寸',
              '处理器': 'A17 Pro',
              '存储': '128GB',
              '摄像头': '48MP主摄'
            },
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            name: 'MacBook Air M3',
            description: '轻薄便携的笔记本电脑，搭载M3芯片',
            price: 12999,
            category: '电子产品',
            brand: 'Apple',
            stock: 15,
            images: ['/api/placeholder/300/300'],
            isActive: true,
            featured: false,
            tags: ['笔记本', '苹果', 'M3'],
            specifications: {
              '屏幕': '13.6英寸',
              '处理器': 'Apple M3',
              '内存': '8GB',
              '存储': '256GB SSD'
            },
            createdAt: '2024-01-14T09:15:00Z'
          },
          {
            id: '3',
            name: 'Nike Air Max 270',
            description: '舒适透气的运动鞋，适合日常穿着',
            price: 899,
            category: '服装鞋包',
            brand: 'Nike',
            stock: 50,
            images: ['/api/placeholder/300/300'],
            isActive: false,
            featured: false,
            tags: ['运动鞋', '跑步', '休闲'],
            specifications: {
              '尺码': '36-45',
              '材质': '网面+橡胶',
              '适用': '跑步、休闲'
            },
            createdAt: '2024-01-13T14:22:00Z'
          }
        ];
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('获取商品失败:', error);
      // Fallback to empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleProductStatus = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive })
      });

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, isActive: !p.isActive }
            : p
        ));
      } else {
        // Fallback to local update if API fails
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, isActive: !p.isActive }
            : p
        ));
      }
    } catch (error) {
      console.error('更新商品状态失败:', error);
    }
  };

  const toggleFeatured = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/admin/products/${productId}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !product.featured })
      });

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, featured: !p.featured }
            : p
        ));
      } else {
        // Fallback to local update if API fails
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, featured: !p.featured }
            : p
        ));
      }
    } catch (error) {
      console.error('更新精选状态失败:', error);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteProduct(product);
    setShowDeleteDialog(true);
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      setFormLoading(true);
      
      if (editingProduct) {
        // 更新商品
        const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          const updatedProduct = await response.json();
          setProducts(prev => prev.map(p => 
            p.id === editingProduct.id ? updatedProduct.data : p
          ));
        } else {
          // Fallback to local update
          setProducts(prev => prev.map(p => 
            p.id === editingProduct.id ? { ...p, ...productData } : p
          ));
        }
      } else {
        // 创建新商品
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          const newProduct = await response.json();
          setProducts(prev => [newProduct.data, ...prev]);
        } else {
          // Fallback to local creation
          const newProduct = {
            ...productData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
          };
          setProducts(prev => [newProduct, ...prev]);
        }
      }
    } catch (error) {
      console.error('保存商品失败:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProduct) return;

    try {
      setDeleteLoading(true);
      
      const response = await fetch(`/api/admin/products/${deleteProduct.id}`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 404) {
        setProducts(prev => prev.filter(p => p.id !== deleteProduct.id));
      } else {
        // Fallback to local deletion
        setProducts(prev => prev.filter(p => p.id !== deleteProduct.id));
      }
      
      setShowDeleteDialog(false);
      setDeleteProduct(null);
    } catch (error) {
      console.error('删除商品失败:', error);
      // Still proceed with local deletion on error
      setProducts(prev => prev.filter(p => p.id !== deleteProduct.id));
      setShowDeleteDialog(false);
      setDeleteProduct(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-32 bg-gray-200 rounded-lg mb-4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <p className="text-gray-600">管理您的商品库存和信息</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          添加商品
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索商品名称或描述..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">所有分类</option>
              <option value="电子产品">电子产品</option>
              <option value="服装鞋包">服装鞋包</option>
              <option value="家居生活">家居生活</option>
              <option value="美妆护肤">美妆护肤</option>
            </select>
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "space-y-4"
      }>
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 ${
              viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
            }`}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="relative mb-4">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {product.featured && (
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-yellow-600 fill-current" />
                      </div>
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      product.isActive ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {product.isActive ? (
                        <Eye className="h-3 w-3 text-green-600" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">¥{product.price.toLocaleString()}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' : 
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      库存 {product.stock}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => toggleProductStatus(product.id)}
                      className={`flex-1 py-2 px-3 text-sm rounded-lg transition-colors ${
                        product.isActive 
                          ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {product.isActive ? '下架' : '上架'}
                    </button>
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                      title="编辑商品"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="删除商品"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{product.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-lg font-bold text-blue-600">¥{product.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">库存: {product.stock}</span>
                        <span className="text-sm text-gray-500">{product.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {product.featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无商品</h3>
          <p className="text-gray-500 mb-4">没有找到符合条件的商品</p>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductForm
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        loading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteProduct}
        title="删除商品"
        message={`确定要删除商品 "${deleteProduct?.name}" 吗？此操作不可恢复。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}