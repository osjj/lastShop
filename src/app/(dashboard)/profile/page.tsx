'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { User, Mail, Phone, Calendar } from 'lucide-react';

// Validation schema
const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, '请输入姓名')
    .max(50, '姓名不能超过50个字符'),
  lastName: z
    .string()
    .min(1, '请输入姓氏')
    .max(50, '姓氏不能超过50个字符'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^1[3-9]\d{9}$/.test(val), {
      message: '请输入有效的手机号码',
    }),
  dateOfBirth: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, updateProfile, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError(null);
      setSuccess(null);
      
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      
      setSuccess('个人信息更新成功');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败，请重试');
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (!user) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="text-center">
          <p className="text-muted-foreground">加载用户信息中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">个人信息</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              编辑信息
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md mb-6">
            {success}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                  姓名 *
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  id="firstName"
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                  姓氏 *
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                手机号码
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="请输入您的手机号码（可选）"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
              >
                保存更改
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                取消
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">姓名</p>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">邮箱</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">手机号码</p>
                  <p className="font-medium">{user.phone || '未设置'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">注册时间</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  user.status === 'active' ? 'bg-green-500' : 
                  user.status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-sm text-muted-foreground">账户状态</p>
                  <p className="font-medium">
                    {user.status === 'active' ? '正常' : 
                     user.status === 'suspended' ? '已暂停' : '已禁用'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
