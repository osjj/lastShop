'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { 
  User, LogOut, Settings, ShoppingBag, Heart, 
  ChevronDown, Bell, CreditCard, HelpCircle
} from 'lucide-react';

export function UserDropdown() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push('/');
  };

  const menuItems = [
    {
      icon: User,
      label: '个人资料',
      href: '/profile',
      description: '查看和编辑个人信息'
    },
    {
      icon: ShoppingBag,
      label: '我的订单',
      href: '/orders',
      description: '查看订单历史和状态'
    },
    {
      icon: Heart,
      label: '我的收藏',
      href: '/wishlist',
      description: '查看收藏的商品'
    },
    {
      icon: CreditCard,
      label: '支付方式',
      href: '/payment-methods',
      description: '管理支付方式'
    },
    {
      icon: Bell,
      label: '消息通知',
      href: '/notifications',
      description: '查看系统通知'
    },
    {
      icon: Settings,
      label: '账户设置',
      href: '/settings',
      description: '隐私和安全设置'
    },
    {
      icon: HelpCircle,
      label: '帮助中心',
      href: '/help',
      description: '常见问题和客服'
    }
  ];

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 用户头像触发器 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.firstName?.[0] || user.email[0].toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : '用户'
            }
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* 用户信息头部 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : '用户'
                  }
                </p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    管理员
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 管理员入口 */}
          {user.role === 'admin' && (
            <div className="border-t border-gray-100 py-2">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 text-purple-700 hover:bg-purple-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">管理后台</p>
                  <p className="text-xs text-purple-600">系统管理和配置</p>
                </div>
              </Link>
            </div>
          )}

          {/* 退出登录 */}
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-700 hover:bg-red-50 transition-colors"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">退出登录</p>
                <p className="text-xs text-red-600">安全退出当前账户</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}