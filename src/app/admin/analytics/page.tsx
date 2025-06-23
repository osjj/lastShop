'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Users, Package, Calendar, BarChart3, PieChart, 
  Activity, Target, Eye, MousePointer
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
  };
  customers: {
    current: number;
    previous: number;
    change: number;
  };
  products: {
    current: number;
    previous: number;
    change: number;
  };
  conversionRate: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByMonth: Array<{
    month: string;
    sales: number;
    orders: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data - 在实际项目中这里会调用API
      const mockAnalytics: AnalyticsData = {
        revenue: {
          current: 125680.50,
          previous: 98340.20,
          change: 27.8
        },
        orders: {
          current: 456,
          previous: 389,
          change: 17.2
        },
        customers: {
          current: 234,
          previous: 201,
          change: 16.4
        },
        products: {
          current: 89,
          previous: 82,
          change: 8.5
        },
        conversionRate: 3.2,
        averageOrderValue: 275.60,
        topProducts: [
          { id: '1', name: 'iPhone 15 Pro', sales: 45, revenue: 404550 },
          { id: '2', name: 'MacBook Air M3', sales: 23, revenue: 298770 },
          { id: '3', name: 'AirPods Pro', sales: 67, revenue: 134000 },
          { id: '4', name: 'iPad Air', sales: 34, revenue: 136000 },
          { id: '5', name: 'Apple Watch', sales: 28, revenue: 84000 }
        ],
        salesByMonth: [
          { month: '1月', sales: 85000, orders: 120 },
          { month: '2月', sales: 92000, orders: 135 },
          { month: '3月', sales: 78000, orders: 110 },
          { month: '4月', sales: 105000, orders: 145 },
          { month: '5月', sales: 118000, orders: 165 },
          { month: '6月', sales: 125680, orders: 180 }
        ]
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('获取分析数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const isPositive = change > 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />  
        )}
        {Math.abs(change).toFixed(1)}%
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
          <p className="text-gray-600">查看您的商店业务数据和分析报告</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
            <option value="1y">最近一年</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            {formatChange(analytics.revenue.change)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">总收入</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.current)}</p>
            <p className="text-xs text-gray-500 mt-1">
              相比上期 {formatCurrency(analytics.revenue.previous)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            {formatChange(analytics.orders.change)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">订单数量</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.orders.current.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              相比上期 {analytics.orders.previous.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            {formatChange(analytics.customers.change)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">新客户</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.customers.current.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              相比上期 {analytics.customers.previous.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            {formatChange(analytics.products.change)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">活跃商品</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.products.current}</p>
            <p className="text-xs text-gray-500 mt-1">
              相比上期 {analytics.products.previous}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">关键指标</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">转化率</p>
                  <p className="text-sm text-gray-500">访问转化为订单</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{analytics.conversionRate}%</p>
                <p className="text-xs text-green-600">+0.3%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">平均订单价值</p>
                  <p className="text-sm text-gray-500">每笔订单平均金额</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.averageOrderValue)}</p>
                <p className="text-xs text-green-600">+12.5%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">客户生命周期价值</p>
                  <p className="text-sm text-gray-500">平均客户价值</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">¥1,250</p>
                <p className="text-xs text-green-600">+8.2%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">热销商品</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} 销量</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">销售趋势</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {analytics.salesByMonth.map((data, index) => {
            const maxSales = Math.max(...analytics.salesByMonth.map(d => d.sales));
            const height = (data.sales / maxSales) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative group cursor-pointer hover:bg-gray-200 transition-colors">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(data.sales)}
                    <br />
                    {data.orders} 订单
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium">{data.month}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}