import { Metadata } from 'next';
import { AuthLayout } from '@/components/layout/auth-layout';
import { ResetPasswordForm } from '@/components/forms/reset-password-form';

export const metadata: Metadata = {
  title: '重置密码 - ShopNext',
  description: '设置您的新密码',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="重置密码"
      subtitle="请设置您的新密码。密码必须包含大小写字母、数字和特殊字符。"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
