'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      await forgotPassword(data.email);
      setIsSubmitted(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送重置邮件失败，请重试');
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            重置邮件已发送
          </h3>
          <p className="text-sm text-muted-foreground">
            我们已向 <span className="font-medium">{getValues('email')}</span> 发送了密码重置链接。
            请检查您的邮箱并点击链接重置密码。
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            没有收到邮件？请检查垃圾邮件文件夹，或者
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-primary hover:text-primary/80 font-medium ml-1"
            >
              重新发送
            </button>
          </p>
          
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">
          输入您的邮箱地址，我们将向您发送密码重置链接。
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          邮箱地址
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          placeholder="请输入您的邮箱"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        loading={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            发送中...
          </>
        ) : (
          '发送重置链接'
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回登录
        </Link>
      </div>
    </form>
  );
}
