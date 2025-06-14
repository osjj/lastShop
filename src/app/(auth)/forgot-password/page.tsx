import { Metadata } from 'next';
import { AuthLayout } from '@/components/layout/auth-layout';
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form';

export const metadata: Metadata = {
  title: '忘记密码 - ShopNext',
  description: '重置您的 ShopNext 账户密码',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="忘记密码"
      subtitle="输入您的邮箱地址，我们将向您发送密码重置链接。"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
