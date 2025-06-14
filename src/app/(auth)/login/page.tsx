import { Metadata } from 'next';
import { AuthLayout } from '@/components/layout/auth-layout';
import { LoginForm } from '@/components/forms/login-form';

export const metadata: Metadata = {
  title: '登录 - ShopNext',
  description: '登录您的 ShopNext 账户',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="登录您的账户"
      subtitle="欢迎回来！请登录您的账户以继续购物。"
    >
      <LoginForm />
    </AuthLayout>
  );
}
