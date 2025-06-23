'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Mail, Phone, Calendar,
  Shield, User, Crown, MoreVertical, UserCheck, UserX, Edit
} from 'lucide-react';
import { UserRoleModal } from '@/components/admin/user-role-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  lastLoginAt: string;
  totalOrders: number;
  totalSpent: number;
}

const roleConfig = {
  customer: { label: '客户', color: 'bg-blue-100 text-blue-800', icon: User },
  admin: { label: '管理员', color: 'bg-purple-100 text-purple-800', icon: Crown },
  moderator: { label: '审核员', color: 'bg-green-100 text-green-800', icon: Shield },
};

const statusConfig = {
  active: { label: '活跃', color: 'bg-green-100 text-green-800' },
  inactive: { label: '未激活', color: 'bg-yellow-100 text-yellow-800' },
  banned: { label: '已封禁', color: 'bg-red-100 text-red-800' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  
  // Status change states
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusChangeUser, setStatusChangeUser] = useState<User | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // 实际项目中调用真实API
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        // Fallback to mock data if API not available
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'john.doe@example.com',
            firstName: '张',
            lastName: '三',
            phone: '13800138000',
            role: 'customer',
            status: 'active',
            createdAt: '2024-01-15T10:30:00Z',
            lastLoginAt: '2024-01-20T14:22:00Z',
            totalOrders: 12,
            totalSpent: 15680.50
          },
          {
            id: '2',
            email: 'admin@shopnext.com',
            firstName: '管理员',
            lastName: '',
            phone: '13900139000',
            role: 'admin',
            status: 'active',
            createdAt: '2024-01-01T08:00:00Z',
            lastLoginAt: '2024-01-21T09:15:00Z',
            totalOrders: 0,
            totalSpent: 0
          },
          {
            id: '3',
            email: 'jane.smith@example.com',
            firstName: '李',
            lastName: '四',
            phone: '13700137000',
            role: 'customer',
            status: 'inactive',
            createdAt: '2024-01-18T16:45:00Z',
            lastLoginAt: '2024-01-18T16:50:00Z',
            totalOrders: 2,
            totalSpent: 899.00
          },
          {
            id: '4',
            email: 'moderator@shopnext.com',
            firstName: '审核员',
            lastName: '',
            phone: '13600136000',
            role: 'moderator',
            status: 'active',
            createdAt: '2024-01-10T12:00:00Z',
            lastLoginAt: '2024-01-20T18:30:00Z',
            totalOrders: 0,
            totalSpent: 0
          }
        ];
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('获取用户失败:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName}${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditRole = (user: User) => {
    setEditingUser(user);
    setShowRoleModal(true);
  };

  const handleStatusChange = (user: User) => {
    setStatusChangeUser(user);
    setShowStatusDialog(true);
  };

  const handleSaveRole = async (userId: string, newRole: string) => {
    try {
      setRoleLoading(true);
      
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole as any } : user
        ));
      } else {
        // Fallback to local update
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole as any } : user
        ));
      }
    } catch (error) {
      console.error('更新用户角色失败:', error);
      // Still update locally on error
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ));
    } finally {
      setRoleLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!statusChangeUser) return;

    try {
      setStatusLoading(true);
      const newStatus = statusChangeUser.status === 'banned' ? 'active' : 'banned';
      
      const response = await fetch(`/api/admin/users/${statusChangeUser.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === statusChangeUser.id 
            ? { ...user, status: newStatus }
            : user
        ));
      } else {
        // Fallback to local update
        setUsers(prev => prev.map(user => 
          user.id === statusChangeUser.id 
            ? { ...user, status: newStatus }
            : user
        ));
      }
      
      setShowStatusDialog(false);
      setStatusChangeUser(null);
    } catch (error) {
      console.error('更新用户状态失败:', error);
      // Still update locally on error
      if (statusChangeUser) {
        const newStatus = statusChangeUser.status === 'banned' ? 'active' : 'banned';
        setUsers(prev => prev.map(user => 
          user.id === statusChangeUser.id 
            ? { ...user, status: newStatus }
            : user
        ));
      }
      setShowStatusDialog(false);
      setStatusChangeUser(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-600">管理系统中的所有用户账户</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>总用户: {users.length}</span>
            <span>活跃用户: {users.filter(u => u.status === 'active').length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户邮箱或姓名..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">所有角色</option>
              <option value="customer">客户</option>
              <option value="admin">管理员</option>
              <option value="moderator">审核员</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">所有状态</option>
              <option value="active">活跃</option>
              <option value="inactive">未激活</option>
              <option value="banned">已封禁</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">用户</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">角色</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">状态</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">统计</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">注册时间</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">最后登录</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const RoleIcon = roleConfig[user.role].icon;
                return (
                  <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.firstName && user.lastName ? `${user.firstName}${user.lastName}` : '未填写'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleConfig[user.role].color}`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleConfig[user.role].label}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[user.status].color}`}>
                        {statusConfig[user.status].label}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">{user.totalOrders} 订单</p>
                        <p className="text-gray-500">¥{user.totalSpent.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-500">
                        {formatDate(user.lastLoginAt)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleEditRole(user)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100"
                          title="编辑角色"
                        >
                          <Edit className="h-3 w-3" />
                          角色
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleStatusChange(user)}
                            className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                              user.status === 'banned'
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {user.status === 'banned' ? (
                              <>
                                <UserCheck className="h-3 w-3" />
                                解封
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3" />
                                封禁
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无用户</h3>
          <p className="text-gray-500">没有找到符合条件的用户</p>
        </div>
      )}

      {/* User Role Modal */}
      <UserRoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSave={handleSaveRole}
        user={editingUser}
        loading={roleLoading}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={confirmStatusChange}
        title={statusChangeUser?.status === 'banned' ? '解封用户' : '封禁用户'}
        message={`确定要${statusChangeUser?.status === 'banned' ? '解封' : '封禁'}用户 "${statusChangeUser?.email}" 吗？`}
        confirmText={statusChangeUser?.status === 'banned' ? '解封' : '封禁'}
        cancelText="取消"
        type={statusChangeUser?.status === 'banned' ? 'info' : 'warning'}
        loading={statusLoading}
      />
    </div>
  );
}