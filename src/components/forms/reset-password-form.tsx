'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validations/auth';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password');

  // Check if we have the required tokens from the URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (!accessToken || !refreshToken || type !== 'recovery') {
      setError('无效的重置链接，请重新申请密码重置。');
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError(null);
      await resetPassword(data.password);
      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/login');
        }
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '密码重置失败，请重试');
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const levels = [
      { score: 0, text: '很弱', color: 'text-red-500' },
      { score: 1, text: '弱', color: 'text-red-400' },
      { score: 2, text: '一般', color: 'text-yellow-500' },
      { score: 3, text: '良好', color: 'text-blue-500' },
      { score: 4, text: '强', color: 'text-green-500' },
      { score: 5, text: '很强', color: 'text-green-600' },
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(password || '');

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            密码重置成功
          </h3>
          <p className="text-muted-foreground text-sm">
            您的密码已成功重置。正在跳转到登录页面...
          </p>
        </div>

        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 animate-pulse rounded-full bg-green-600"
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6 text-center">
        <p className="text-muted-foreground text-sm">
          请输入您的新密码。密码必须包含大小写字母、数字和特殊字符。
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          新密码
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className="border-input focus:ring-ring w-full rounded-md border px-3 py-2 pr-10 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
            placeholder="请输入新密码"
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
        {password && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground text-xs">密码强度:</span>
              <span className={`text-xs font-medium ${passwordStrength.color}`}>
                {passwordStrength.text}
              </span>
            </div>
            <div className="mt-1 h-1 w-full rounded-full bg-gray-200">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  passwordStrength.score <= 1
                    ? 'bg-red-500'
                    : passwordStrength.score <= 2
                      ? 'bg-yellow-500'
                      : passwordStrength.score <= 3
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                }`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          确认新密码
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            className="border-input focus:ring-ring w-full rounded-md border px-3 py-2 pr-10 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
            placeholder="请再次输入新密码"
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

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !!error}
        loading={isLoading}
      >
        重置密码
      </Button>
    </form>
  );
}
