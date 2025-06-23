'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { API_ROUTES } from '@/lib/constants';
import { Order } from '@/types';
import {
  Search, Filter, Download, Eye, Edit, MoreHorizontal,
  Calendar, CreditCard, Package, AlertCircle, RefreshCw, FileDown,
  Truck, CheckCircle, XCircle, MessageSquare, Printer, Phone
} from 'lucide-react';

const ORDER_STATUS_CONFIG = {
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800' },
  processing: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: '已送达', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
  refunded: { label: '已退款', color: 'bg-red-100 text-red-800' },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800' },
  failed: { label: '支付失败', color: 'bg-red-100 text-red-800' },
  refunded: { label: '已退款', color: 'bg-gray-100 text-gray-800' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Export states
  const [isExporting, setIsExporting] = useState(false);
  
  // Date filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Order actions states
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'refund' | 'ship' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, paymentFilter, currentPage, dateFrom, dateTo]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.relative')) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (paymentFilter !== 'all') {
        params.append('payment_status', paymentFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }

      const url = `${API_ROUTES.orders.list}?${params.toString()}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || '获取订单列表失败');
      }

      setOrders(result.data.orders);
      setTotalOrders(result.data.total || result.data.orders.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(API_ROUTES.orders.updateStatus(orderId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || '更新订单状态失败');
      }

      // Refresh orders list
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err instanceof Error ? err.message : '更新订单状态失败');
    }
  };

  const exportOrders = async () => {
    try {
      setIsExporting(true);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (paymentFilter !== 'all') {
        params.append('payment_status', paymentFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }

      const url = `/api/admin/orders/export?${params.toString()}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        // Fallback: generate CSV from current data
        const csvContent = generateCSV(orders);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (orders: Order[]) => {
    const headers = ['订单号', '客户邮箱', '总金额', '订单状态', '支付状态', '创建时间'];
    const rows = orders.map(order => [
      order.orderNumber,
      order.user?.email || '未知',
      order.totalAmount.toString(),
      ORDER_STATUS_CONFIG[order.status]?.label || order.status,
      PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label || order.paymentStatus,
      new Date(order.createdAt).toLocaleString('zh-CN')
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleOrderAction = (order: Order, action: 'cancel' | 'refund' | 'ship') => {
    setSelectedOrder(order);
    setActionType(action);
    setShowActionDialog(true);
    setShowDropdown(null);
  };

  const confirmOrderAction = async () => {
    if (!selectedOrder || !actionType) return;

    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/${actionType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Refresh orders list
        fetchOrders();
        setShowActionDialog(false);
        setSelectedOrder(null);
        setActionType(null);
      } else {
        throw new Error(`${actionType} 操作失败`);
      }
    } catch (error) {
      console.error(`Order ${actionType} failed:`, error);
      alert(error instanceof Error ? error.message : `${actionType} 操作失败`);
    } finally {
      setActionLoading(false);
    }
  };

  const printOrder = (order: Order) => {
    // 生成打印页面
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>订单 ${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>订单详情</h1>
              <p>订单号: ${order.orderNumber}</p>
            </div>
            <div class="section">
              <span class="label">客户信息:</span><br>
              姓名: ${order.shippingAddress.name}<br>
              电话: ${order.shippingAddress.phone}<br>
              地址: ${order.shippingAddress.address}
            </div>
            <div class="section">
              <span class="label">订单信息:</span><br>
              状态: ${ORDER_STATUS_CONFIG[order.status]?.label}<br>
              支付状态: ${PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label}<br>
              总金额: ¥${order.totalAmount.toFixed(2)}
            </div>
            <div class="section">
              <span class="label">商品列表:</span><br>
              <table>
                <tr><th>商品名称</th><th>数量</th><th>单价</th><th>小计</th></tr>
                ${order.items.map(item => 
                  `<tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>¥${item.unitPrice.toFixed(2)}</td>
                    <td>¥${(item.unitPrice * item.quantity).toFixed(2)}</td>
                  </tr>`
                ).join('')}
              </table>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const contactCustomer = (order: Order) => {
    if (order.shippingAddress.phone) {
      window.open(`tel:${order.shippingAddress.phone}`);
    } else {
      alert('客户电话信息不可用');
    }
  };

  const getActionDialogContent = () => {
    if (!actionType || !selectedOrder) return { title: '', message: '' };
    
    switch (actionType) {
      case 'cancel':
        return {
          title: '取消订单',
          message: `确定要取消订单 "${selectedOrder.orderNumber}" 吗？此操作不可撤销。`
        };
      case 'refund':
        return {
          title: '退款订单',
          message: `确定要为订单 "${selectedOrder.orderNumber}" 申请退款吗？退款金额为 ¥${selectedOrder.totalAmount.toFixed(2)}。`
        };
      case 'ship':
        return {
          title: '确认发货',
          message: `确定要将订单 "${selectedOrder.orderNumber}" 标记为已发货吗？`
        };
      default:
        return { title: '', message: '' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchOrders}>重试</Button>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
          <p className="text-gray-600">管理所有订单和支付状态</p>
          {/* Order Stats */}
          <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
            <span>总订单: {totalOrders}</span>
            <span>待处理: {orders.filter(o => o.status === 'pending').length}</span>
            <span>已支付: {orders.filter(o => o.paymentStatus === 'paid').length}</span>
            <span>已发货: {orders.filter(o => o.status === 'shipped').length}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={exportOrders}
            disabled={isExporting}
          >
            <FileDown className="h-4 w-4 mr-2" />
            {isExporting ? '导出中...' : '导出订单'}
          </Button>
          <Button onClick={resetFilters} variant="outline">
            重置筛选
          </Button>
          <Button onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单号或商品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Order Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">所有状态</option>
            <option value="pending">待审核</option>
            <option value="paid">已支付</option>
            <option value="processing">处理中</option>
            <option value="shipped">已发货</option>
            <option value="delivered">已送达</option>
            <option value="cancelled">已取消</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">所有支付状态</option>
            <option value="pending">待支付</option>
            <option value="paid">已支付</option>
            <option value="failed">支付失败</option>
            <option value="refunded">已退款</option>
          </select>

          {/* Date From Filter */}
          <div className="relative">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="开始日期"
            />
          </div>

          {/* Date To Filter */}
          <div className="relative">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="结束日期"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支付
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    暂无订单数据
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          共 {order.items.length} 件商品
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.shippingAddress.name}
                        </p>
                        <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`
                          text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500
                          ${ORDER_STATUS_CONFIG[order.status].color}
                        `}
                      >
                        <option value="pending">待审核</option>
                        <option value="paid">已支付</option>
                        <option value="processing">处理中</option>
                        <option value="shipped">已发货</option>
                        <option value="delivered">已送达</option>
                        <option value="cancelled">已取消</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={PAYMENT_STATUS_CONFIG[order.paymentStatus].color}>
                        {PAYMENT_STATUS_CONFIG[order.paymentStatus].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        ¥{order.totalAmount.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('zh-CN')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowDropdown(showDropdown === order.id ? null : order.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          
                          {showDropdown === order.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => printOrder(order)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Printer className="h-4 w-4" />
                                  打印订单
                                </button>
                                
                                <button
                                  onClick={() => contactCustomer(order)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Phone className="h-4 w-4" />
                                  联系客户
                                </button>
                                
                                {order.status === 'paid' && (
                                  <button
                                    onClick={() => handleOrderAction(order, 'ship')}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                  >
                                    <Truck className="h-4 w-4" />
                                    确认发货
                                  </button>
                                )}
                                
                                {(order.status === 'pending' || order.status === 'paid') && (
                                  <button
                                    onClick={() => handleOrderAction(order, 'cancel')}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    取消订单
                                  </button>
                                )}
                                
                                {(order.status === 'delivered' || order.status === 'shipped') && order.paymentStatus === 'paid' && (
                                  <button
                                    onClick={() => handleOrderAction(order, 'refund')}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    申请退款
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {orders.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalOrders / itemsPerPage)}
          totalItems={totalOrders}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showActionDialog}
        onClose={() => setShowActionDialog(false)}
        onConfirm={confirmOrderAction}
        title={getActionDialogContent().title}
        message={getActionDialogContent().message}
        confirmText={actionType === 'cancel' ? '确认取消' : actionType === 'refund' ? '确认退款' : '确认发货'}
        cancelText="取消"
        type={actionType === 'cancel' ? 'danger' : actionType === 'refund' ? 'warning' : 'info'}
        loading={actionLoading}
      />
    </div>
  );
}