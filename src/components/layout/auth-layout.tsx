import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-8">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">ShopNext</span>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-32 w-32 text-primary/30 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-foreground mb-4">
              欢迎来到 ShopNext
            </h3>
            <p className="text-lg text-muted-foreground max-w-md">
              现代化的电商平台，为您提供最优质的购物体验。
              基于 Next.js 14+ 构建，支持最新的 Web 技术。
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">优质商品</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">10000+</div>
                <div className="text-sm text-muted-foreground">满意用户</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">客户服务</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
