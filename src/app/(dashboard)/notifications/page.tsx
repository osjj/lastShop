'use client';

import { useState } from 'react';
import { Bell, BellOff, Package, CreditCard, User, Settings, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: number;
  type: 'order' | 'payment' | 'system' | 'promotion';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: any;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'order',
      title: '订单已发货',
      message: '您的订单 #202401001 已发货，预计3-5个工作日送达',
      time: '2024-01-20 10:30',
      isRead: false,
      icon: Package
    },
    {
      id: 2,
      type: 'payment',
      title: '支付成功',
      message: '订单 #202401002 支付成功，金额 ¥299.00',
      time: '2024-01-19 15:20',
      isRead: true,
      icon: CreditCard
    },
    {
      id: 3,
      type: 'system',
      title: '账户安全提醒',
      message: '检测到您的账户在新设备上登录，如非本人操作请及时修改密码',
      time: '2024-01-18 09:15',
      isRead: false,
      icon: User
    },
    {
      id: 4,
      type: 'promotion',
      title: '优惠活动',
      message: '新春大促销开始啦！全场商品8折起，优惠券限时领取',
      time: '2024-01-17 14:00',
      isRead: true,
      icon: Bell
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'system': return 'bg-yellow-100 text-yellow-600';
      case 'promotion': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">消息通知</h1>
          <p className="text-gray-600">
            查看系统通知和消息 {unreadCount > 0 && `(${unreadCount} 条未读)`}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            全部标记为已读
          </Button>
        )}
      </div>

      {/* 过滤器 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">显示：</span>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              全部 ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              未读 ({unreadCount})
            </Button>
          </div>
        </div>
      </div>

      {/* 通知列表 */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? '暂无通知' : '暂无未读通知'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? '当有新的系统消息时，会在这里显示' 
              : '所有通知都已阅读'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div 
                key={notification.id} 
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.time}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 通知设置 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">通知设置</h3>
            <p className="text-sm text-gray-600">管理您接收通知的偏好</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}