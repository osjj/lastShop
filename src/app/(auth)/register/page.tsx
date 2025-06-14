import { Metadata } from 'next';
import { AuthLayout } from '@/components/layout/auth-layout';
import { RegisterForm } from '@/components/forms/register-form';

export const metadata: Metadata = {
  title: '注册 - ShopNext',
  description: '创建您的 ShopNext 账户',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="创建新账户"
      subtitle="加入 ShopNext，开始您的购物之旅。"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
