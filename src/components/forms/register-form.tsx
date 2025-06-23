'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function RegisterForm({
  onSuccess,
  redirectTo = '/',
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="text-foreground mb-2 block text-sm font-medium"
          >
            姓名 *
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            className="border-input focus:ring-ring w-full rounded-md border px-3 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
            placeholder="请输入姓名"
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="text-foreground mb-2 block text-sm font-medium"
          >
            姓氏 *
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            className="border-input focus:ring-ring w-full rounded-md border px-3 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
            placeholder="请输入姓氏"
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          邮箱地址 *
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="border-input focus:ring-ring w-full rounded-md border px-3 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
          placeholder="请输入您的邮箱"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          手机号码
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className="border-input focus:ring-ring w-full rounded-md border px-3 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
          placeholder="请输入您的手机号码（可选）"
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          密码 *
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className="border-input focus:ring-ring w-full rounded-md border px-3 py-2 pr-10 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
            placeholder="请输入密码"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="text-muted-foreground h-4 w-4" />
            ) : (
              <Eye className="text-muted-foreground h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          确认密码 *
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            className="border-input focus:ring-ring w-full rounded-md border px-3 py-2 pr-10 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
            placeholder="请再次输入密码"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="text-muted-foreground h-4 w-4" />
            ) : (
              <Eye className="text-muted-foreground h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          {...register('agreeToTerms')}
          id="agreeToTerms"
          type="checkbox"
          className="text-primary focus:ring-ring border-input h-4 w-4 rounded"
          disabled={isLoading}
        />
        <label
          htmlFor="agreeToTerms"
          className="text-foreground ml-2 block text-sm"
        >
          我同意{' '}
          <a href="/terms" className="text-primary hover:text-primary/80">
            服务条款
          </a>{' '}
          和{' '}
          <a href="/privacy" className="text-primary hover:text-primary/80">
            隐私政策
          </a>
        </label>
      </div>
      {errors.agreeToTerms && (
        <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        loading={isLoading}
      >
        注册账户
      </Button>

      <div className="text-center">
        <span className="text-muted-foreground text-sm">
          已有账户？{' '}
          <a
            href="/login"
            className="text-primary hover:text-primary/80 font-medium"
          >
            立即登录
          </a>
        </span>
      </div>
    </form>
  );
}
