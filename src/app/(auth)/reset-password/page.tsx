import { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { ResetPasswordForm } from '@/components/forms/reset-password-form';

export const metadata: Metadata = {
  title: '重置密码 - ShopNext',
  description: '设置您的新密码',
};

function ResetPasswordLoading() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
      </div>

      <div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="重置密码"
      subtitle="请设置您的新密码。密码必须包含大小写字母、数字和特殊字符。"
    >
      <Suspense fallback={<ResetPasswordLoading />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
