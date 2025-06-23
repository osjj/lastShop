'use client';

import { useState } from 'react';
import { X, Crown, Shield, User } from 'lucide-react';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, role: string) => Promise<void>;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'admin' | 'moderator';
  } | null;
  loading?: boolean;
}

const roles = [
  {
    value: 'customer',
    label: '客户',
    description: '普通客户，可以浏览商品和下单',
    icon: User,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    value: 'moderator',
    label: '审核员',
    description: '可以审核商品和内容，但无法管理用户',
    icon: Shield,
    color: 'bg-green-100 text-green-800'
  },
  {
    value: 'admin',
    label: '管理员',
    description: '拥有系统的完全访问权限',
    icon: Crown,
    color: 'bg-purple-100 text-purple-800'
  }
];

export function UserRoleModal({ isOpen, onClose, onSave, user, loading = false }: UserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && selectedRole !== user.role) {
      try {
        await onSave(user.id, selectedRole);
        onClose();
      } catch (error) {
        console.error('更新用户角色失败:', error);
      }
    }
  };

  const currentRole = selectedRole || user.role;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  编辑用户角色
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user.firstName && user.lastName ? `${user.firstName}${user.lastName}` : '未填写'}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  选择新角色
                </label>
                {roles.map((role) => {
                  const IconComponent = role.icon;
                  const isSelected = currentRole === role.value;
                  const isCurrent = user.role === role.value;
                  
                  return (
                    <label
                      key={role.value}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={isSelected}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                            <IconComponent className="h-3 w-3" />
                            {role.label}
                          </div>
                          {isCurrent && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              当前角色
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>注意：</strong>更改用户角色将立即生效，并影响该用户的系统访问权限。
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={loading || !selectedRole || selectedRole === user.role}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '保存中...' : '保存更改'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}